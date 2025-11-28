const Index = () => {
  return (
    <main className="grain-texture relative min-h-screen flex items-center justify-center px-6 py-12" style={{ background: 'var(--gradient-subtle)' }}>
      <div className="max-w-4xl w-full space-y-8 text-center">
        {/* Main content */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <h1 className="text-7xl md:text-8xl lg:text-9xl tracking-tight text-foreground">
            Blank
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light max-w-xl mx-auto leading-relaxed">
            A minimal space. Pure possibility.
          </p>
        </div>

        {/* Accent line */}
        <div 
          className="h-px w-24 mx-auto bg-accent animate-fade-in-slow" 
          style={{ animationDelay: '0.6s', opacity: 0 }}
        />

        {/* Subtext */}
        <p 
          className="text-sm text-muted-foreground/60 font-light animate-fade-in" 
          style={{ animationDelay: '0.8s', opacity: 0 }}
        >
          Begin anywhere
        </p>
      </div>
    </main>
  );
};

export default Index;
