import { Link } from 'react-router-dom';
import { WalletConnect } from '@/components/WalletConnect';
import { NetworkToggle } from '@/components/NetworkToggle';
import { BuyIPButton } from '@/components/BuyIPButton';
import { Button } from '@/components/ui/button';
import { BookOpen, Upload, Search, PenTool, ExternalLink, Droplets, Coins } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Index = () => {
  return (
    <div className="grain-texture min-h-screen" style={{
      background: 'var(--gradient-subtle)'
    }}>
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-accent" />
              <h1 className="text-xl font-semibold">Krump Journal</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <BuyIPButton />
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a 
                  href="https://cloud.google.com/application/web3/faucet/story/aeneid" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Droplets className="h-4 w-4" />
                  <span className="hidden sm:inline">Faucet</span>
                </a>
              </Button>
              <NetworkToggle />
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Hero */}
          <div className="space-y-6 animate-fade-in" style={{
            animationDelay: '0.1s',
            opacity: 0
          }}>
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{
            animationDelay: '0.4s',
            opacity: 0
          }}>
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
            <Link to="/browse">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                <Search className="h-4 w-4" />
                Browse Articles
              </Button>
            </Link>
          </div>

          {/* Developer Resources - Get Tokens */}
          <div className="bg-card/50 rounded-xl border border-border/40 p-6 animate-fade-in" style={{
            animationDelay: '0.5s',
            opacity: 0
          }}>
            <h3 className="text-lg font-semibold mb-4">Get Story Tokens</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Mainnet - Halliday */}
              <div className="p-4 rounded-lg bg-background/50 border border-border/30 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-5 w-5 text-accent" />
                  <span className="font-medium">Mainnet $IP</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Purchase real $IP tokens for production use via Halliday
                </p>
                <BuyIPButton />
              </div>
              
              {/* Testnet - Faucet */}
              <div className="p-4 rounded-lg bg-background/50 border border-border/30 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">Testnet $IP</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Get free testnet tokens for development on Story Aeneid
                </p>
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <a 
                    href="https://cloud.google.com/application/web3/faucet/story/aeneid" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Droplets className="h-4 w-4" />
                    Get Testnet Tokens
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 pt-12 animate-fade-in" style={{
            animationDelay: '0.6s',
            opacity: 0
          }}>
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

          {/* ORCID Integration Guide */}
          <div className="pt-16 animate-fade-in" style={{
            animationDelay: '1s',
            opacity: 0
          }}>
            <div className="bg-card/50 rounded-2xl border border-border/40 p-6 md:p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl md:text-3xl font-semibold mb-2">Add Your Article to ORCID</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  After publishing to Zenodo, link your article to your ORCID profile for proper attribution
                </p>
              </div>
              
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="step-1" className="border border-border/40 rounded-lg px-4 bg-background/50">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-semibold">1</span>
                      </div>
                      <span className="font-semibold text-left">Link Zenodo with your ORCID</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-4 pl-11 text-sm text-muted-foreground space-y-2">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Log in to Zenodo and open your profile (click your name/email in the top-right)</li>
                      <li>Navigate to "Linked accounts" section</li>
                      <li>Next to ORCID, click "Connect" and sign in with your ORCID credentials to authorize Zenodo</li>
                      <li>After this, your future Zenodo uploads will include your ORCID iD automatically in the record metadata</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-2" className="border border-border/40 rounded-lg px-4 bg-background/50">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-semibold">2</span>
                      </div>
                      <span className="font-semibold text-left">Add ORCID iD to your Zenodo record</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-4 pl-11 text-sm text-muted-foreground space-y-2">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Open your article's record on Zenodo and click "Edit" (if you have edit permissions)</li>
                      <li>In the "Creators/Authors" section, ensure your name appears with your ORCID iD attached</li>
                      <li>Use the search box or field provided to add your ORCID iD if it's not already there</li>
                      <li>Save/publish the updated record so the DOI metadata includes your ORCID iD</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step-3" className="border border-border/40 rounded-lg px-4 bg-background/50">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-accent font-semibold">3</span>
                      </div>
                      <span className="font-semibold text-left">Add the article to your ORCID record</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 pb-4 pl-11 text-sm text-muted-foreground space-y-2">
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Log in to your ORCID account and scroll to the "Works" section</li>
                      <li>Click "+ Add" → "Add DOI" (or similar option)</li>
                      <li>Paste the article's DOI from Zenodo and let ORCID retrieve the details automatically</li>
                      <li>Check the pre-filled fields, adjust anything needed, choose visibility settings</li>
                      <li>Save, and the article will appear under "Works" on your ORCID profile</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <a href="https://zenodo.org" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open Zenodo
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <a href="https://orcid.org" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open ORCID
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="pt-12 border-t border-border/40 animate-fade-in" style={{
            animationDelay: '0.8s',
            opacity: 0
          }}>
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
