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

        <ArticleSubmissionForm />
      </main>
    </div>
  );
};

export default Submit;
