import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CoverImageUpload } from '@/components/CoverImageUpload';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WORLDCOIN_CONFIG } from '@/lib/worldcoin';
import { Loader2 } from 'lucide-react';

const articleSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  abstract: z.string().min(50, 'Abstract must be at least 50 characters').max(1000),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  keywords: z.string().min(1, 'At least one keyword required'),
  publicationType: z.enum(['research_article', 'review', 'perspective', 'preprint']),
  license: z.string().default('CC BY 4.0'),
  orcidId: z.string().regex(/^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/, 'Invalid ORCID iD format'),
  authorName: z.string().min(2, 'Author name required'),
});

type ArticleFormData = z.infer<typeof articleSchema>;

export const ArticleSubmissionForm = () => {
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [worldIdVerified, setWorldIdVerified] = useState(false);
  const [worldIdProof, setWorldIdProof] = useState<any>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      license: 'CC BY 4.0',
    },
  });

  const onWorldIdSuccess = (proof: any) => {
    console.log('World ID verification successful:', proof);
    setWorldIdVerified(true);
    setWorldIdProof(proof);
    toast.success('Human verification complete!');
  };

  const onSubmit = async (data: ArticleFormData) => {
    if (!isAuthenticated || !user) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!worldIdVerified) {
      toast.error('Please complete World ID verification first');
      return;
    }

    if (!coverImage) {
      toast.error('Please upload a cover image');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Store World ID verification
      const { error: verifyError } = await supabase
        .from('world_id_verifications')
        .insert({
          user_id: user.id,
          nullifier_hash: worldIdProof.nullifier_hash,
          merkle_root: worldIdProof.merkle_root,
          proof: worldIdProof.proof,
        });

      if (verifyError) throw verifyError;

      // Step 2: Upload cover image to IPFS
      const { data: coverData, error: coverError } = await supabase.functions.invoke('upload-cover-image', {
        body: {
          imageBase64: coverImagePreview,
          fileName: coverImage.name,
        },
      });

      if (coverError) throw coverError;

      // Step 3: Upload article metadata (IPA + NFT) to IPFS
      const { data: metadataResult, error: metadataError } = await supabase.functions.invoke('upload-article-metadata', {
        body: {
          title: data.title,
          abstract: data.abstract,
          content: data.content,
          keywords: data.keywords.split(',').map(k => k.trim()),
          publicationType: data.publicationType,
          license: data.license,
          authorName: data.authorName,
          orcidId: data.orcidId,
          coverImageIpfs: coverData.ipfsHash,
          network: 'testnet',
        },
      });

      if (metadataError) throw metadataError;

      // Step 4: Create article record
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .insert({
          author_id: user.id,
          title: data.title,
          abstract: data.abstract,
          keywords: data.keywords.split(',').map(k => k.trim()),
          publication_type: data.publicationType,
          license: data.license,
          ipfs_hash: metadataResult.contentIpfsHash,
          ipfs_gateway_url: metadataResult.contentGatewayUrl,
          cover_image_ipfs: coverData.ipfsHash,
          ipa_metadata_uri: metadataResult.ipaMetadataUri,
          ipa_metadata_hash: metadataResult.ipaMetadataHash,
          nft_metadata_uri: metadataResult.nftMetadataUri,
          nft_metadata_hash: metadataResult.nftMetadataHash,
          doi: metadataResult.doi,
          network: 'testnet',
          status: 'pending',
        })
        .select()
        .single();

      if (articleError) throw articleError;

      // Step 5: Add author record
      await supabase.from('article_authors').insert({
        article_id: article.id,
        orcid_id: data.orcidId,
        author_name: data.authorName,
        author_order: 1,
      });

      // Step 6: Mint to Story via edge function
      const { data: mintData, error: mintError } = await supabase.functions.invoke('mint-to-story', {
        body: {
          articleId: article.id,
          ipaMetadataUri: metadataResult.ipaMetadataUri,
          ipaMetadataHash: metadataResult.ipaMetadataHash,
          nftMetadataUri: metadataResult.nftMetadataUri,
          nftMetadataHash: metadataResult.nftMetadataHash,
        },
      });

      if (mintError) throw mintError;

      toast.success('Article submitted and minting initiated!');
      form.reset();
      setWorldIdVerified(false);
      setWorldIdProof(null);
      setCoverImage(null);
      setCoverImagePreview(null);
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit article');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Please connect your wallet to submit an article</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Article Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter article title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="abstract"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Abstract</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter article abstract (50-1000 characters)"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Article Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter full article content"
                    className="min-h-[300px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Minimum 100 characters. For best results, format your article using{' '}
                  <a 
                    href="https://www.overleaf.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Overleaf
                  </a>{' '}
                  and paste your content here.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="authorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orcidId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ORCID iD</FormLabel>
                  <FormControl>
                    <Input placeholder="0000-0000-0000-0000" {...field} />
                  </FormControl>
                  <FormDescription>Format: 0000-0000-0000-0000</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keywords</FormLabel>
                <FormControl>
                  <Input placeholder="krump, culture, research (comma-separated)" {...field} />
                </FormControl>
                <FormDescription>Separate keywords with commas</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="publicationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publication Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="research_article">Research Article</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="perspective">Perspective</SelectItem>
                      <SelectItem value="preprint">Preprint</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="license"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License</FormLabel>
                  <FormControl>
                    <Input placeholder="CC BY 4.0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <CoverImageUpload
            onImageSelect={(file, preview) => {
              setCoverImage(file);
              setCoverImagePreview(preview);
            }}
            disabled={isSubmitting}
          />

          <div className="border rounded-lg p-6 bg-muted/30">
            <h3 className="font-semibold mb-4">Human Verification Required</h3>
            {worldIdVerified ? (
              <div className="text-sm text-green-600 dark:text-green-400">
                ✓ Verified with World ID
              </div>
            ) : (
              <IDKitWidget
                app_id={WORLDCOIN_CONFIG.appId}
                action={WORLDCOIN_CONFIG.action}
                onSuccess={onWorldIdSuccess}
                verification_level={WORLDCOIN_CONFIG.verification_level as VerificationLevel}
              >
                {({ open }) => (
                  <Button type="button" onClick={open} variant="outline">
                    Verify with World ID
                  </Button>
                )}
              </IDKitWidget>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !worldIdVerified}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting & Minting...
              </>
            ) : (
              'Submit Article'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};
