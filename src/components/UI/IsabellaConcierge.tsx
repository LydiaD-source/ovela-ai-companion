import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import IsabellaAvatar from '@/components/UI/IsabellaAvatar';
import { isabellaAPI, ConversationMessage } from '@/lib/isabellaAPI';
import { Button } from '@/components/ui/button';

interface Msg { role: 'user' | 'assistant'; content: string; }

/**
 * Site-wide floating Isabella concierge.
 * Text-only lightweight chat (no D-ID stream) so it can run on every page
 * without the heavy WebRTC init. On Home we hide it (full Isabella is already there).
 */
const IsabellaConcierge: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hide on Home (any locale) — Isabella is already the hero.
  const path = location.pathname.replace(/^\/(fr|es|de|pt|ca)(\/|$)/, '/');
  const isHome = path === '/' || path === '';

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  if (isHome) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const history: ConversationMessage[] = next.map((m) => ({ role: m.role, content: m.content }));
      const res = await isabellaAPI.sendMessage(text, 'isabella-navia', history);
      setMessages((m) => [...m, { role: 'assistant', content: res.message || '…' }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: "I'm having trouble right now. You can reach the team via the Contact page." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openFullExperience = () => {
    setOpen(false);
    navigate('/');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Talk to Isabella"
          className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 pl-2 pr-4 py-2 rounded-full bg-gradient-to-r from-champagne-gold to-yellow-500 text-charcoal shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:scale-105 transition-transform"
        >
          <IsabellaAvatar size="small" />
          <span className="text-sm font-medium hidden sm:inline">Ask Isabella</span>
          <MessageCircle className="w-4 h-4 sm:hidden" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-[60] w-[min(380px,calc(100vw-2.5rem))] h-[min(560px,calc(100vh-2.5rem))] flex flex-col rounded-2xl border border-soft-white/10 bg-[hsl(var(--background))]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          <header className="flex items-center justify-between px-4 py-3 border-b border-soft-white/10">
            <div className="flex items-center gap-2">
              <IsabellaAvatar size="small" />
              <div>
                <p className="text-sm font-semibold text-soft-white">Isabella</p>
                <p className="text-[10px] text-soft-white/60">AI Ambassador · Ovela Interactive</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="p-1 rounded hover:bg-soft-white/10 text-soft-white/70"
            >
              <X className="w-4 h-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-sm">
            {messages.length === 0 && (
              <div className="text-soft-white/70 space-y-3">
                <p>Hi, I'm Isabella. Ask me anything about Ovela Interactive — pricing, use cases, demos, or how an AI digital employee could work for your business.</p>
                <div className="flex flex-wrap gap-2">
                  {['Show me a demo', 'Pricing', 'How does it work?', 'For my clinic'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="text-xs px-2 py-1 rounded-full border border-soft-white/15 hover:border-champagne-gold/60 text-soft-white/80"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <button
                  onClick={openFullExperience}
                  className="text-xs text-champagne-gold hover:underline"
                >
                  Open the full video experience →
                </button>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === 'user'
                  ? 'ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-champagne-gold/90 text-charcoal px-3 py-2'
                  : 'mr-auto max-w-[90%] text-soft-white/90'}
              >
                {m.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1 [&_a]:text-champagne-gold">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{m.content}</p>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-soft-white/60 text-xs">
                <Loader2 className="w-3 h-3 animate-spin" /> Isabella is typing…
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 p-3 border-t border-soft-white/10"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="flex-1 bg-soft-white/5 border border-soft-white/10 rounded-full px-3 py-2 text-sm text-soft-white placeholder:text-soft-white/40 focus:outline-none focus:border-champagne-gold/60"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} className="rounded-full bg-champagne-gold text-charcoal hover:bg-yellow-400">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
};

export default IsabellaConcierge;
