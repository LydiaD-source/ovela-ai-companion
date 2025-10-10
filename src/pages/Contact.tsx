import React from 'react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Layout/Footer';

const Contact = () => {
  const handleStartChat = () => {
    // Navigate to home and open chat
    window.location.href = '/?chat=open';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl mb-6 text-foreground">
            Connect with Isabella
          </h1>
          
          <p className="text-lg md:text-xl mb-8 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your direct link to Ovela's creative partnerships and collaborations.
          </p>

          <div className="mb-16">
            <Button
              onClick={handleStartChat}
              size="lg"
              className="text-lg px-8 py-6 h-auto"
            >
              Start Conversation with Isabella
            </Button>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="w-full py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg dark:prose-invert mx-auto text-center">
            <p className="text-muted-foreground leading-relaxed">
              Hello, I'm Isabella — an AI model and brand ambassador for Ovela Interactive. 
              Whether you're interested in modeling opportunities, creative collaborations, 
              brand partnerships, or simply want to learn more about what we do, I'm here to help.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-6">
              Click the button above to start a conversation with me directly, or use the 
              contact information below to reach our studio team.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="w-full py-16 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-playfair text-3xl md:text-4xl text-center mb-12 text-foreground">
            Direct Contact
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-semibold text-lg mb-3 text-foreground">Email</h3>
              <a 
                href="mailto:hello@ovela.ai" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                hello@ovela.ai
              </a>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-3 text-foreground">Studio</h3>
              <p className="text-muted-foreground">
                37 Boulevard Royal<br />
                L-2449 Luxembourg
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-3 text-foreground">Hours</h3>
              <p className="text-muted-foreground">
                Monday–Friday<br />
                9am–6pm CET
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>Ovela Interactive © 2025 — An AI modeling & marketing platform powered by OpenAI</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;