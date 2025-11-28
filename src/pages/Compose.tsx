import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { OrcidLink } from '@/components/OrcidLink';
import { WalletConnect } from '@/components/WalletConnect';
import { ArticleEditor } from '@/components/editor/ArticleEditor';
import { ArticlePreview } from '@/components/editor/ArticlePreview';
import { SubmissionSuccess } from '@/components/SubmissionSuccess';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function Compose() {
  const navigate = useNavigate();
  const { user, profile, walletAddress } = useAuth();
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [content, setContent] = useState('');
  const [keywords, setKeywords] = useState('');
  const [publicationType, setPublicationType] = useState<'research_article' | 'review' | 'perspective' | 'preprint'>('research_article');
  const [license, setLicense] = useState('CC BY 4.0');
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!user || !title) return;

    const saveDraft = async () => {
      setIsSaving(true);
      try {
        const draftData = {
          author_id: user.id,
          title,
          content: { html: content },
          metadata: { abstract, keywords, publicationType, license, network },
          last_saved_at: new Date().toISOString(),
        };

        if (draftId) {
          await supabase
            .from('article_drafts')
            .update(draftData)
            .eq('id', draftId);
        } else {
          const { data, error } = await supabase
            .from('article_drafts')
            .insert(draftData)
            .select()
            .single();
          
          if (data) setDraftId(data.id);
          if (error) throw error;
        }
        
        toast.success('Draft saved');
      } catch (error) {
        console.error('Error saving draft:', error);
      } finally {
        setIsSaving(false);
      }
    };

    const interval = setInterval(saveDraft, 30000);
    return () => clearInterval(interval);
  }, [user, title, content, abstract, keywords, publicationType, license, network, draftId]);

  const handleSubmit = async () => {
    if (!user || !walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!profile?.orcid_verified) {
      toast.error('Please link your ORCID iD first');
      return;
    }

    if (!title || !abstract || !content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate PDF from HTML content
      const pdfResponse = await supabase.functions.invoke('generate-article-pdf', {
        body: {
          title,
          authors: profile.orcid_name || 'Anonymous',
          orcidId: profile.orcid_id,
          abstract,
          content,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          license,
        }
      });

      if (pdfResponse.error) throw pdfResponse.error;
      const { pdfIpfsHash, pdfGatewayUrl } = pdfResponse.data;

      // Upload metadata to IPFS
      const metadataResponse = await supabase.functions.invoke('upload-article-metadata', {
        body: {
          title,
          authors: [
            {
              name: profile.orcid_name || 'Anonymous',
              orcid: profile.orcid_id,
            }
          ],
          abstract,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          content,
          publicationType,
          license,
          network,
        }
      });

      if (metadataResponse.error) throw metadataResponse.error;

      const {
        ipfsHash,
        gatewayUrl,
        doi,
        ipaMetadataUri,
        ipaMetadataHash,
        nftMetadataUri,
        nftMetadataHash,
      } = metadataResponse.data;

      // Mint to Story Protocol
      const mintResponse = await supabase.functions.invoke('mint-to-story', {
        body: {
          nftMetadataUri,
          nftMetadataHash,
          ipaMetadataUri,
          ipaMetadataHash,
          network,
        }
      });

      if (mintResponse.error) throw mintResponse.error;

      const { ipAssetId, transactionHash, spgContractAddress } = mintResponse.data;

      // Save to database
      const { data: article, error: dbError } = await supabase
        .from('articles')
        .insert({
          title,
          abstract,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          ipfs_hash: ipfsHash,
          ipfs_gateway_url: gatewayUrl,
          pdf_ipfs_hash: pdfIpfsHash,
          doi,
          ipa_metadata_uri: ipaMetadataUri,
          ipa_metadata_hash: ipaMetadataHash,
          nft_metadata_uri: nftMetadataUri,
          nft_metadata_hash: nftMetadataHash,
          ip_asset_id: ipAssetId,
          transaction_hash: transactionHash,
          spg_contract_address: spgContractAddress,
          publication_type: publicationType,
          license,
          network,
          author_id: user.id,
          status: 'published',
          minted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Save authors
      await supabase.from('article_authors').insert({
        article_id: article.id,
        author_name: profile.orcid_name || 'Anonymous',
        orcid_id: profile.orcid_id || '',
        author_order: 1,
      });

      // Delete draft
      if (draftId) {
        await supabase.from('article_drafts').delete().eq('id', draftId);
      }

      setSubmissionData({
        title,
        authors: profile.orcid_name || 'Anonymous',
        orcidId: profile.orcid_id,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        ipfsHash,
        ipfsGatewayUrl: gatewayUrl,
        pdfIpfsHash,
        pdfGatewayUrl,
        doi,
        transactionHash,
        ipAssetId,
        network,
      });

      setShowSuccess(true);
      toast.success('Article published successfully!');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to publish article');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !walletAddress) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-4">
                <WalletConnect />
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Please connect your wallet to start composing an article.
            </p>
            <WalletConnect />
          </Card>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                {isSaving && (
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving draft...
                  </span>
                )}
                <OrcidLink />
                <WalletConnect />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Compose Article</h1>
            <p className="text-muted-foreground">
              Write and format your academic article with live preview
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Editor Panel */}
            <div className="space-y-6">
              <Card className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter article title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abstract">Abstract *</Label>
                  <Textarea
                    id="abstract"
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    placeholder="Write a brief summary of your article"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Publication Type</Label>
                    <Select value={publicationType} onValueChange={(value: any) => setPublicationType(value)}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="research_article">Research Article</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="perspective">Perspective</SelectItem>
                        <SelectItem value="preprint">Preprint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="network">Network</Label>
                    <Select value={network} onValueChange={(value: any) => setNetwork(value)}>
                      <SelectTrigger id="network">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="testnet">Testnet</SelectItem>
                        <SelectItem value="mainnet">Mainnet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="license">License</Label>
                  <Select value={license} onValueChange={setLicense}>
                    <SelectTrigger id="license">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC BY 4.0">CC BY 4.0</SelectItem>
                      <SelectItem value="CC BY-SA 4.0">CC BY-SA 4.0</SelectItem>
                      <SelectItem value="CC BY-NC 4.0">CC BY-NC 4.0</SelectItem>
                      <SelectItem value="CC BY-ND 4.0">CC BY-ND 4.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              <div>
                <Label className="mb-2 block">Article Content *</Label>
                <ArticleEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your article content here. Use the toolbar to format text, add headings, lists, images, and tables..."
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !profile?.orcid_verified}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Generate PDF & Publish
                  </>
                )}
              </Button>

              {!profile?.orcid_verified && (
                <p className="text-sm text-muted-foreground text-center">
                  Please link your ORCID iD to publish articles
                </p>
              )}
            </div>

            {/* Preview Panel */}
            <div className="lg:sticky lg:top-24 h-fit">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
                <div className="border border-border rounded-lg overflow-auto max-h-[800px]">
                  <ArticlePreview
                    title={title}
                    authors={profile?.orcid_name || 'Your Name'}
                    orcidId={profile?.orcid_id}
                    abstract={abstract}
                    content={content}
                    keywords={keywords.split(',').map(k => k.trim()).filter(Boolean)}
                    doi="10.KRUMPVERSE/..."
                  />
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {submissionData && <SubmissionSuccess {...submissionData} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
