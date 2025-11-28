import { Link } from 'react-router-dom';
import { WalletConnect } from '@/components/WalletConnect';
import { NetworkToggle } from '@/components/NetworkToggle';
import { Button } from '@/components/ui/button';
import { BookOpen, Upload, Search, PenTool } from 'lucide-react';

const Index = () => {
  return (
    <div className="grain-texture min-h-screen" style={{ background: 'var(--gradient-subtle)' }}>
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-accent" />
              <h1 className="text-xl font-semibold">KrumpVerse Journal</h1>
            </div>
            <div className="flex items-center gap-3">
              <NetworkToggle />
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Hero */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <h2 className="text-6xl md:text-7xl lg:text-8xl tracking-tight text-foreground">
              Decentralized
              <br />
              <span className="text-accent">Krump Research</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
              Compose, publish, and archive academic research on Krump culture with professional formatting. 
              Permanently stored on Story blockchain with DOI registration via Zenodo.
            </p>
          </div>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
            style={{ animationDelay: '0.4s', opacity: 0 }}
          >
            <Link to="/compose">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                <PenTool className="h-4 w-4" />
                Compose Article
              </Button>
            </Link>
            <Link to="/submit">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                <Upload className="h-4 w-4" />
                Upload PDF
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
              <Search className="h-4 w-4" />
              Browse Articles
            </Button>
          </div>

          {/* Features */}
          <div 
            className="grid md:grid-cols-3 gap-8 pt-12 animate-fade-in"
            style={{ animationDelay: '0.6s', opacity: 0 }}
          >
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg">Immutable Archive</h3>
              <p className="text-sm text-muted-foreground">
                Research permanently stored on Story testnet with IPFS
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <Upload className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg">ORCID Verified</h3>
              <p className="text-sm text-muted-foreground">
                Connect your ORCID iD for authenticated authorship attribution
              </p>
            </div>

            <div className="space-y-3">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <Search className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg">Human Verified</h3>
              <p className="text-sm text-muted-foreground">
                World ID verification ensures authentic contributions from real researchers
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div 
            className="pt-12 border-t border-border/40 animate-fade-in"
            style={{ animationDelay: '0.8s', opacity: 0 }}
          >
            <p className="text-xs text-muted-foreground/60 mb-4">Powered by</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground/80">
              <span>Story</span>
              <span>•</span>
              <span>IPFS (Pinata)</span>
              <span>•</span>
              <span>World ID</span>
              <span>•</span>
              <span>ORCID</span>
              <span>•</span>
              <span>MetaMask</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
