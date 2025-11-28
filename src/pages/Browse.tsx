import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { WalletConnect } from '@/components/WalletConnect';
import { NetworkToggle } from '@/components/NetworkToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, ArrowLeft, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Article {
  id: string;
  title: string;
  abstract: string;
  created_at: string;
  submitted_at: string | null;
  keywords: string[] | null;
  ipfs_gateway_url: string;
  doi: string | null;
  authors: {
    author_name: string;
    orcid_id: string;
  }[];
}

const Browse = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      // Fetch articles with authors
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (articlesError) throw articlesError;

      // Fetch authors for each article
      const articlesWithAuthors = await Promise.all(
        (articlesData || []).map(async (article) => {
          const { data: authorsData } = await supabase
            .from('article_authors')
            .select('author_name, orcid_id')
            .eq('article_id', article.id)
            .order('author_order');

          return {
            ...article,
            authors: authorsData || []
          };
        })
      );

      setArticles(articlesWithAuthors);
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load articles',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.abstract.toLowerCase().includes(query) ||
      article.authors.some((author) => 
        author.author_name.toLowerCase().includes(query)
      ) ||
      article.keywords?.some((keyword) => 
        keyword.toLowerCase().includes(query)
      )
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="grain-texture min-h-screen" style={{
      background: 'var(--gradient-subtle)'
    }}>
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-accent" />
                <h1 className="text-xl font-semibold">Browse Articles</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NetworkToggle />
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title, author, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? 'No articles found matching your search' : 'No articles published yet'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:border-accent/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{article.title}</CardTitle>
                        <CardDescription className="text-base">
                          {article.authors.map((author, idx) => (
                            <span key={idx}>
                              {author.author_name}
                              {idx < article.authors.length - 1 && ', '}
                            </span>
                          ))}
                        </CardDescription>
                      </div>
                      {article.doi && (
                        <Badge variant="secondary">DOI</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {article.abstract}
                    </p>
                    
                    {article.keywords && article.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {article.keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-muted-foreground">
                        Published {formatDate(article.submitted_at || article.created_at)}
                      </p>
                      <a
                        href={article.ipfs_gateway_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="gap-2">
                          View on IPFS
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Browse;
