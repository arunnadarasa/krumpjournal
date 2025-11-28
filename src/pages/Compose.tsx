import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Loader2, CheckCircle, FileText, Image as ImageIcon, Upload, Coins } from 'lucide-react';
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

  // Step-by-step publishing state
  const [pdfData, setPdfData] = useState<{ pdfIpfsHash: string; pdfGatewayUrl: string } | null>(null);
  const [coverImageData, setCoverImageData] = useState<{ imageBase64: string; preview: string } | null>(null);
  const [coverImageIpfs, setCoverImageIpfs] = useState<{ ipfsHash: string; gatewayUrl: string } | null>(null);
  const [ipfsData, setIpfsData] = useState<{
    ipfsHash: string;
    gatewayUrl: string;
    doi: string;
    ipaMetadataUri: string;
    ipaMetadataHash: string;
    nftMetadataUri: string;
    nftMetadataHash: string;
  } | null>(null);
  const [mintData, setMintData] = useState<{
    transactionHash: string;
    ipAssetId: string;
    spgContractAddress: string;
  } | null>(null);

  // Loading states for each step
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [isUploadingIpfs, setIsUploadingIpfs] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

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

  // Step 1: Generate PDF
  const handleGeneratePdf = async () => {
    if (!user || !profile) {
      toast.error('Please sign in first');
      return;
    }

    if (!title || !abstract || !content) {
      toast.error('Please fill in title, abstract, and content');
      return;
    }

    setIsGeneratingPdf(true);
    try {
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
      setPdfData({ pdfIpfsHash, pdfGatewayUrl });
      
      toast.success('PDF generated successfully!', {
        description: `IPFS Hash: ${pdfIpfsHash.slice(0, 20)}...`
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast.error(error.message || 'Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Step 2: Generate Cover Image
  const handleGenerateCoverImage = async () => {
    if (!title) {
      toast.error('Please add a title first to generate relevant artwork');
      return;
    }

    setIsGeneratingCover(true);
    try {
      const prompt = `${title}. Keywords: ${keywords || 'science, research'}. Style: abstract, modern, 1:1 square format, high quality concept art`;
      
      const response = await supabase.functions.invoke('generate-cover-image', {
        body: { prompt }
      });

      if (response.error) throw response.error;
      
      const { imageUrl } = response.data;
      setCoverImageData({
        imageBase64: imageUrl,
        preview: imageUrl,
      });
      
      toast.success('Cover image generated!');
    } catch (error: any) {
      console.error('Cover image generation error:', error);
      toast.error(error.message || 'Failed to generate cover image');
    } finally {
      setIsGeneratingCover(false);
    }
  };

  // Step 3: Upload to IPFS
  const handleUploadToIpfs = async () => {
    if (!pdfData) {
      toast.error('Please generate PDF first');
      return;
    }
    if (!coverImageData) {
      toast.error('Please generate cover image first');
      return;
    }

    setIsUploadingIpfs(true);
    try {
      // Upload cover image to IPFS
      const coverUploadResponse = await supabase.functions.invoke('upload-cover-image', {
        body: {
          imageBase64: coverImageData.imageBase64,
          fileName: `${title.replace(/\s+/g, '-').toLowerCase()}-cover.png`,
        }
      });

      if (coverUploadResponse.error) throw coverUploadResponse.error;
      
      const coverIpfsHash = coverUploadResponse.data.ipfsHash;
      const coverGatewayUrl = coverUploadResponse.data.gatewayUrl;
      
      setCoverImageIpfs({ ipfsHash: coverIpfsHash, gatewayUrl: coverGatewayUrl });
      toast.success('Cover image uploaded to IPFS!');

      // Upload metadata
      const metadataResponse = await supabase.functions.invoke('upload-article-metadata', {
        body: {
          title,
          authorName: profile.orcid_name || 'Anonymous',
          orcidId: profile.orcid_id,
          abstract,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          content,
          publicationType,
          license,
          coverImageIpfs: coverIpfsHash,
          network,
        }
      });

      if (metadataResponse.error) throw metadataResponse.error;

      const { 
        ipaMetadataUri, 
        ipaMetadataHash, 
        nftMetadataUri, 
        nftMetadataHash, 
        doi, 
        contentIpfsHash, 
        contentGatewayUrl 
      } = metadataResponse.data;

      setIpfsData({
        ipfsHash: contentIpfsHash,
        gatewayUrl: contentGatewayUrl,
        doi,
        ipaMetadataUri,
        ipaMetadataHash,
        nftMetadataUri,
        nftMetadataHash,
      });

      toast.success('Metadata uploaded to IPFS!');
    } catch (error: any) {
      console.error('IPFS upload error:', error);
      toast.error(error.message || 'Failed to upload to IPFS');
    } finally {
      setIsUploadingIpfs(false);
    }
  };

  // Step 4: Mint on Story
  const handleMintOnStory = async () => {
    if (!ipfsData) {
      toast.error('Please upload to IPFS first');
      return;
    }

    if (!walletAddress) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsMinting(true);
    try {
      const mintResponse = await supabase.functions.invoke('mint-to-story', {
        body: {
          nftMetadataUri: ipfsData.nftMetadataUri,
          nftMetadataHash: ipfsData.nftMetadataHash,
          ipaMetadataUri: ipfsData.ipaMetadataUri,
          ipaMetadataHash: ipfsData.ipaMetadataHash,
          network,
        }
      });

      if (mintResponse.error) throw mintResponse.error;

      const { ipAssetId, transactionHash, spgContractAddress } = mintResponse.data;
      setMintData({ transactionHash, ipAssetId, spgContractAddress });

      toast.success('Minted on Story Protocol!', {
        description: `IP Asset ID: ${ipAssetId.slice(0, 20)}...`
      });
    } catch (error: any) {
      console.error('Minting error:', error);
      toast.error(error.message || 'Failed to mint on Story');
    } finally {
      setIsMinting(false);
    }
  };

  // Step 5: Save to Database
  const handleSaveToDatabase = async () => {
    if (!pdfData || !ipfsData || !mintData) {
      toast.error('Please complete all previous steps first');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: article, error: dbError } = await supabase
        .from('articles')
        .insert({
          title,
          abstract,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          ipfs_hash: ipfsData.ipfsHash,
          ipfs_gateway_url: ipfsData.gatewayUrl,
          pdf_ipfs_hash: pdfData.pdfIpfsHash,
          cover_image_ipfs: coverImageIpfs?.ipfsHash,
          doi: ipfsData.doi,
          ipa_metadata_uri: ipfsData.ipaMetadataUri,
          ipa_metadata_hash: ipfsData.ipaMetadataHash,
          nft_metadata_uri: ipfsData.nftMetadataUri,
          nft_metadata_hash: ipfsData.nftMetadataHash,
          ip_asset_id: mintData.ipAssetId,
          transaction_hash: mintData.transactionHash,
          spg_contract_address: mintData.spgContractAddress,
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

      await supabase.from('article_authors').insert({
        article_id: article.id,
        author_name: profile.orcid_name || 'Anonymous',
        orcid_id: profile.orcid_id || '',
        author_order: 1,
      });

      if (draftId) {
        await supabase.from('article_drafts').delete().eq('id', draftId);
      }

      setSubmissionData({
        title,
        authors: profile.orcid_name || 'Anonymous',
        orcidId: profile.orcid_id,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        ipfsHash: ipfsData.ipfsHash,
        ipfsGatewayUrl: ipfsData.gatewayUrl,
        pdfIpfsHash: pdfData.pdfIpfsHash,
        pdfGatewayUrl: pdfData.pdfGatewayUrl,
        doi: ipfsData.doi,
        transactionHash: mintData.transactionHash,
        ipAssetId: mintData.ipAssetId,
        network,
      });

      setShowSuccess(true);
      toast.success('Article published successfully!');
    } catch (error: any) {
      console.error('Database error:', error);
      toast.error(error.message || 'Failed to save to database');
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

              {/* Publishing Steps */}
              <Card className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Publishing Steps</h3>
                
                {/* Step 1: Generate PDF */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleGeneratePdf}
                    disabled={isGeneratingPdf || !title || !abstract || !content}
                    variant={pdfData ? "outline" : "default"}
                    className="flex-1"
                  >
                    {isGeneratingPdf ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating PDF...</>
                    ) : pdfData ? (
                      <><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> PDF Generated</>
                    ) : (
                      <><FileText className="mr-2 h-4 w-4" /> 1. Generate PDF</>
                    )}
                  </Button>
                  {pdfData && (
                    <a href={pdfData.pdfGatewayUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                      View PDF
                    </a>
                  )}
                </div>

                {/* Step 2: Generate Cover Image */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleGenerateCoverImage}
                      disabled={isGeneratingCover || !pdfData}
                      variant={coverImageData ? "outline" : "default"}
                      className="flex-1"
                    >
                      {isGeneratingCover ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Artwork...</>
                      ) : coverImageData ? (
                        <><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Cover Generated</>
                      ) : (
                        <><ImageIcon className="mr-2 h-4 w-4" /> 2. Generate Cover Image</>
                      )}
                    </Button>
                    {coverImageData && (
                      <Button variant="ghost" size="sm" onClick={handleGenerateCoverImage}>
                        Regenerate
                      </Button>
                    )}
                  </div>
                  
                  {/* 1:1 Square Preview */}
                  {coverImageData && (
                    <div className="aspect-square w-48 mx-auto rounded-lg overflow-hidden border border-border">
                      <img 
                        src={coverImageData.preview} 
                        alt="Cover preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Step 3: Upload to IPFS */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleUploadToIpfs}
                    disabled={isUploadingIpfs || !coverImageData}
                    variant={ipfsData ? "outline" : "default"}
                    className="flex-1"
                  >
                    {isUploadingIpfs ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                    ) : ipfsData ? (
                      <><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Uploaded to IPFS</>
                    ) : (
                      <><Upload className="mr-2 h-4 w-4" /> 3. Upload to IPFS</>
                    )}
                  </Button>
                  {ipfsData && (
                    <>
                      <a href={ipfsData.gatewayUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                        View
                      </a>
                      {coverImageIpfs && (
                        <a href={coverImageIpfs.gatewayUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-500 hover:underline">
                          Cover
                        </a>
                      )}
                    </>
                  )}
                </div>

                {/* Step 4: Mint on Story */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleMintOnStory}
                    disabled={isMinting || !ipfsData || !walletAddress}
                    variant={mintData ? "outline" : "default"}
                    className="flex-1"
                  >
                    {isMinting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Minting...</>
                    ) : mintData ? (
                      <><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Minted on Story</>
                    ) : (
                      <><Coins className="mr-2 h-4 w-4" /> 4. Mint on Story</>
                    )}
                  </Button>
                </div>

                {/* Step 5: Save & Publish */}
                <Button
                  onClick={handleSaveToDatabase}
                  disabled={isSubmitting || !mintData}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" /> 5. Save & Publish</>
                  )}
                </Button>

                {!profile?.orcid_verified && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please link your ORCID iD to publish articles
                  </p>
                )}
              </Card>
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
