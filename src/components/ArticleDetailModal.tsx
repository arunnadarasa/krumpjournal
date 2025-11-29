import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Link as LinkIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { ZenodoLinkDialog } from './ZenodoLinkDialog';

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
    authors: Author[];
  } | null;
  isOwner: boolean;
  onZenodoLinked: () => void;
}

export const ArticleDetailModal = ({
  open,
  onOpenChange,
  article,
  isOwner,
  onZenodoLinked,
}: ArticleDetailModalProps) => {
  const [zenodoDialogOpen, setZenodoDialogOpen] = useState(false);

  if (!article) return null;

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold pr-8">{article.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
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
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Published:</span>
                <span className="ml-2">{formatDate(article.submitted_at)}</span>
              </div>
              {article.doi && (
                <div>
                  <span className="text-muted-foreground">DOI:</span>
                  <a
                    href={`https://doi.org/${article.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 hover:underline inline-flex items-center gap-1"
                  >
                    {article.doi}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              {article.zenodo_doi ? (
                <Button asChild variant="outline">
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
                isOwner && (
                  <Button
                    variant="outline"
                    onClick={() => setZenodoDialogOpen(true)}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Link to Zenodo
                  </Button>
                )
              )}

              <Button asChild>
                <a
                  href={article.ipfs_gateway_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on IPFS
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ZenodoLinkDialog
        open={zenodoDialogOpen}
        onOpenChange={setZenodoDialogOpen}
        articleId={article.id}
        onSuccess={() => {
          setZenodoDialogOpen(false);
          onZenodoLinked();
        }}
      />
    </>
  );
};
