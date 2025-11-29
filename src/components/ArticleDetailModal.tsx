import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ZenodoLinkDialog } from './ZenodoLinkDialog';
import { IPALinkDialog } from './IPALinkDialog';
import { TransactionLinkDialog } from './TransactionLinkDialog';
import { ClaimArticleDialog } from './ClaimArticleDialog';

interface Author {
  orcid_id: string;
  author_name: string;
  author_order: number;
}

interface ArticleDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: {
    id: string;
    title: string;
    abstract: string;
    keywords: string[];
    created_at: string;
    submitted_at: string | null;
    doi: string | null;
    zenodo_doi: string | null;
    ipfs_gateway_url: string;
    pdf_ipfs_hash: string | null;
    ip_asset_id: string | null;
    transaction_hash: string | null;
    network: string;
    wallet_address: string | null;
    world_id_verified: boolean | null;
    authors: Author[];
  } | null;
  isOwner: boolean;
  canClaim: boolean;
  onZenodoLinked: () => void;
}

export const ArticleDetailModal = ({
  open,
  onOpenChange,
  article,
  isOwner,
  canClaim,
  onZenodoLinked,
}: ArticleDetailModalProps) => {
  const [zenodoDialogOpen, setZenodoDialogOpen] = useState(false);
  const [ipaDialogOpen, setIpaDialogOpen] = useState(false);
  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const { address } = useAccount();

  if (!article) return null;

  const getStoryExplorerUrl = (network: string, ipAssetId: string) => {
    return network === 'testnet' 
      ? `https://aeneid.explorer.story.foundation/ipa/${ipAssetId}`
      : `https://explorer.story.foundation/ipa/${ipAssetId}`;
  };

  const getStoryScanUrl = (network: string, txHash: string) => {
    return network === 'testnet'
      ? `https://aeneid.storyscan.io/tx/${txHash}`
      : `https://storyscan.io/tx/${txHash}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold pr-8">{article.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            {/* Authors */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Authors</h3>
              <div className="flex flex-wrap gap-2">
                {article.authors
                  .sort((a, b) => a.author_order - b.author_order)
                  .map((author) => (
                    <a
                      key={author.orcid_id}
                      href={`https://orcid.org/${author.orcid_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm hover:underline"
                    >
                      {author.author_name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
              </div>
            </div>

            {/* Abstract */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Abstract</h3>
              <p className="text-sm leading-relaxed">{article.abstract}</p>
            </div>

            {/* Keywords */}
            {article.keywords && article.keywords.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Published:</span>
                <span className="ml-2">{formatDate(article.submitted_at)}</span>
              </div>
              {article.world_id_verified && (
                <div className="flex items-center">
                  <Badge 
                    variant="secondary"
                    className="bg-blue-500/20 text-blue-700 border-blue-500"
                  >
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    World ID Verified
                  </Badge>
                </div>
              )}
              {article.doi && (
                <div>
                  <span className="text-muted-foreground">DOI:</span>
                  <a
                    href={`https://doi.org/${article.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 hover:underline inline-flex items-center gap-1 break-all"
                  >
                    {article.doi}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 pt-4 border-t">
              {canClaim && (
                <Button
                  variant="default"
                  onClick={() => setClaimDialogOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Claim Article
                </Button>
              )}

              {article.zenodo_doi ? (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a
                    href={`https://doi.org/${article.zenodo_doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Zenodo
                  </a>
                </Button>
              ) : (
                isOwner && !canClaim && (
                  <Button
                    variant="outline"
                    onClick={() => setZenodoDialogOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Link to Zenodo
                  </Button>
                )
              )}

              {article.ip_asset_id ? (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a
                    href={getStoryExplorerUrl(article.network, article.ip_asset_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Story Explorer
                  </a>
                </Button>
              ) : (
                isOwner && !canClaim && (
                  <Button
                    variant="outline"
                    onClick={() => setIpaDialogOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Link IPA
                  </Button>
                )
              )}

              {article.transaction_hash ? (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a
                    href={getStoryScanUrl(article.network, article.transaction_hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Transaction
                  </a>
                </Button>
              ) : (
                isOwner && !canClaim && (
                  <Button
                    variant="outline"
                    onClick={() => setTxDialogOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Link Transaction
                  </Button>
                )
              )}

              <Button asChild className="w-full sm:w-auto">
                <a
                  href={
                    article.pdf_ipfs_hash
                      ? `https://gateway.pinata.cloud/ipfs/${article.pdf_ipfs_hash}`
                      : article.ipfs_gateway_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View PDF on IPFS
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {address && (
        <>
          <ZenodoLinkDialog
            open={zenodoDialogOpen}
            onOpenChange={setZenodoDialogOpen}
            articleId={article.id}
            walletAddress={address}
            onSuccess={() => {
              setZenodoDialogOpen(false);
              onZenodoLinked();
            }}
          />

          <IPALinkDialog
            open={ipaDialogOpen}
            onOpenChange={setIpaDialogOpen}
            articleId={article.id}
            walletAddress={address}
            onSuccess={() => {
              setIpaDialogOpen(false);
              onZenodoLinked();
            }}
          />

          <TransactionLinkDialog
            open={txDialogOpen}
            onOpenChange={setTxDialogOpen}
            articleId={article.id}
            walletAddress={address}
            onSuccess={() => {
              setTxDialogOpen(false);
              onZenodoLinked();
            }}
          />

          <ClaimArticleDialog
            open={claimDialogOpen}
            onOpenChange={setClaimDialogOpen}
            articleId={article.id}
            walletAddress={address}
            onSuccess={() => {
              setClaimDialogOpen(false);
              onZenodoLinked();
            }}
          />
        </>
      )}
    </>
  );
};
