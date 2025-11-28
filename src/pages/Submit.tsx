import { Link } from 'react-router-dom';
import { ArticleSubmissionForm } from '@/components/ArticleSubmissionForm';
import { WalletConnect } from '@/components/WalletConnect';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Submit = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold">Submit Article</h1>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Publish Your Research</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Submit your Krump research to be permanently archived on Story. 
            All submissions require World ID verification to ensure authenticity.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                Format Your Article Professionally
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                For the best presentation, we recommend using Overleaf to format your 
                research article. Overleaf is a free, collaborative LaTeX editor that 
                produces publication-ready documents.
              </p>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="https://www.overleaf.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    Visit Overleaf
                  </Button>
                </a>
                <a 
                  href="https://www.overleaf.com/latex/templates" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm">
                    Browse Templates
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        <ArticleSubmissionForm />
      </main>
    </div>
  );
};

export default Submit;
