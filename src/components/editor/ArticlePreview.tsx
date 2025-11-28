import { Badge } from '@/components/ui/badge';
import '@/styles/journal-preview.css';

interface ArticlePreviewProps {
  title: string;
  authors: string;
  orcidId?: string;
  abstract: string;
  content: string;
  keywords?: string[];
  doi?: string;
}

export const ArticlePreview = ({ 
  title, 
  authors, 
  orcidId, 
  abstract, 
  content, 
  keywords,
  doi 
}: ArticlePreviewProps) => {
  return (
    <div className="journal-preview">
      <div className="journal-header">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Krump Journal
        </div>
        <h1 className="journal-title">{title || 'Article Title'}</h1>
        <div className="journal-authors">
          {authors || 'Author Name'}
          {orcidId && (
            <span className="ml-2">
              <Badge variant="secondary" className="text-xs">
                ORCID: {orcidId}
              </Badge>
            </span>
          )}
        </div>
        {doi && (
          <div className="text-xs text-muted-foreground mt-1">
            DOI: {doi}
          </div>
        )}
      </div>

      {keywords && keywords.length > 0 && (
        <div className="mb-4">
          <span className="text-sm font-semibold">Keywords: </span>
          <span className="text-sm text-muted-foreground">{keywords.join(', ')}</span>
        </div>
      )}

      {abstract && (
        <div className="journal-abstract">
          <div className="font-semibold mb-2">Abstract</div>
          <div>{abstract}</div>
        </div>
      )}

      <div 
        className="journal-content prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: content || '<p class="text-muted-foreground">Your article content will appear here...</p>' }}
      />

      <div className="mt-8 pt-4 border-t border-border text-xs text-muted-foreground text-center">
        © {new Date().getFullYear()} Krump Journal. All rights reserved.
      </div>
    </div>
  );
};
