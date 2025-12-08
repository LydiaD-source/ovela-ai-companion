import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FooterMinimal } from '@/components/Home/FooterMinimal';
import { IsabellaAvatarStream } from '@/components/Interactive/IsabellaAvatarStream';
import { useCanonicalLink } from '@/hooks/useCanonicalLink';

const Interactive = () => {
  useCanonicalLink('/interactive');
  const navigate = useNavigate();
  const [showAvatar, setShowAvatar] = useState(false);

  useEffect(() => {
    // SEO: Set page title and meta description
    document.title = 'Interactive AI Model | Ovela Interactive';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Meet Isabella, the world\'s first interactive AI model. Engage with cutting-edge AI technology that brings brands to life through real-time conversations and dynamic content.');
    }

    // Add Open Graph meta tags
    const updateOrCreateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    updateOrCreateMeta('og:title', 'Interactive AI Model | Ovela Interactive');
    updateOrCreateMeta('og:description', 'Meet Isabella, the world\'s first interactive AI model. Engage with cutting-edge AI technology that brings brands to life.');
    updateOrCreateMeta('og:url', 'https://ovelainteractive.com/interactive');
    updateOrCreateMeta('og:type', 'website');
    updateOrCreateMeta('og:image', 'https://ovelainteractive.com/images/isabella-hero-native.png');
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Avatar */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(180deg, #0D0D1A 0%, #000000 100%)',
          }}
        />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              style={{
                fontFamily: 'Playfair Display, serif',
                color: '#E8CFA9'
              }}
            >
              Meet Isabella
            </h1>
            <h2 className="text-2xl md:text-3xl mb-8 text-white/90">
              The World's First Interactive AI Model
            </h2>
            <p className="text-lg md:text-xl mb-8 text-white/70 max-w-2xl mx-auto leading-relaxed">
              Experience the future of brand engagement with Isabella, an AI ambassador who adapts to your brand, 
              engages your audience in real-time, and scales infinitely across campaigns.
            </p>
            
            {!showAvatar && (
              <Button
                onClick={() => setShowAvatar(true)}
                size="lg"
                className="text-lg px-8 py-6"
              >
                Launch Interactive Avatar
              </Button>
            )}
          </div>

          {/* Avatar Container */}
          {showAvatar && (
            <div className="w-full max-w-5xl mx-auto">
              <IsabellaAvatarStream onStreamingChange={(streaming) => console.log('Streaming:', streaming)} />
            </div>
          )}

          {/* Alternative Chat Option */}
          {!showAvatar && (
            <div className="text-center mt-8">
              <p className="text-white/50 mb-4">Or prefer text chat?</p>
              <Button
                onClick={() => navigate('/?chat=open')}
                variant="outline"
                size="lg"
              >
                Start Text Chat
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #000000 0%, #0D0D1A 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 
            className="text-4xl md:text-5xl font-bold text-center mb-16"
            style={{
              fontFamily: 'Playfair Display, serif',
              color: '#E8CFA9'
            }}
          >
            Why Interactive AI?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg bg-white/5 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#E8CFA9' }}>Real-Time Engagement</h3>
              <p className="text-white/70 leading-relaxed">
                Isabella responds instantly to your audience, creating authentic conversations that build trust and connection.
              </p>
            </div>
            
            <div className="p-8 rounded-lg bg-white/5 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#E8CFA9' }}>Infinite Scalability</h3>
              <p className="text-white/70 leading-relaxed">
                Deploy Isabella across unlimited campaigns simultaneously without the constraints of traditional models.
              </p>
            </div>
            
            <div className="p-8 rounded-lg bg-white/5 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#E8CFA9' }}>Brand Adaptation</h3>
              <p className="text-white/70 leading-relaxed">
                Isabella seamlessly adapts her voice, style, and messaging to perfectly match your brand identity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 text-center" style={{ background: '#000000' }}>
        <div className="max-w-3xl mx-auto">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-8"
            style={{
              fontFamily: 'Playfair Display, serif',
              color: '#E8CFA9'
            }}
          >
            Ready to Experience the Future?
          </h2>
          <p className="text-xl mb-12 text-white/70">
            Discover how Isabella can transform your brand's digital presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/?chat=open')}
              size="lg"
              className="text-lg px-8 py-6"
            >
              Chat with Isabella Now
            </Button>
            <Button
              onClick={() => navigate('/partner')}
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
            >
              Partner With Us
            </Button>
          </div>
        </div>
      </section>

      <FooterMinimal />
    </div>
  );
};

export default Interactive;
