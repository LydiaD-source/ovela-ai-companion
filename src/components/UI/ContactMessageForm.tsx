import React, { useState } from 'react';
import { z } from 'zod';
import { Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { crmAPI, type LeadData } from '@/lib/crmAPI';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  name: z.string().trim().min(2, { message: 'Please enter your name' }).max(100),
  email: z.string().trim().email({ message: 'Please enter a valid email address' }).max(255),
  inquiry_type: z.enum(['modeling', 'collaboration', 'brand', 'general']),
  message: z.string().trim().min(10, { message: 'Please write at least a short message' }).max(1000),
});

const fieldStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(212,175,55,0.25)',
  color: '#FFFFFF',
};

export const ContactMessageForm = () => {
  const { toast } = useToast();
  const [values, setValues] = useState({
    name: '',
    email: '',
    inquiry_type: 'general' as LeadData['inquiry_type'],
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0]) next[String(issue.path[0])] = issue.message;
      });
      setErrors(next);
      return;
    }
    setErrors({});
    setSending(true);
    const result = await crmAPI.submitLead({ ...parsed.data, source: 'contact_page' });
    setSending(false);
    if (result.success) {
      setSent(true);
      setValues({ name: '', email: '', inquiry_type: 'general', message: '' });
    } else {
      toast({
        title: "Message couldn't be sent",
        description: 'Please try again in a moment, or call +376 699 369.',
        variant: 'destructive',
      });
    }
  };

  if (sent) {
    return (
      <div
        className="max-w-xl mx-auto rounded-2xl p-8 md:p-10 text-center"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.35)' }}
      >
        <CheckCircle2 size={40} className="mx-auto mb-4" style={{ color: '#D4AF37' }} />
        <h3 className="font-playfair text-2xl mb-3" style={{ color: '#D4AF37' }}>
          Message sent
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.75)' }}>
          Thank you — we've received your message and will reply within one business day.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          style={{ borderColor: 'rgba(212,175,55,0.4)', color: '#D4AF37', background: 'transparent' }}
          onClick={() => setSent(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto rounded-2xl p-6 md:p-8"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.3)' }}
      noValidate
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="cf-name" className="block text-sm mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Your name
          </label>
          <input
            id="cf-name"
            type="text"
            value={values.name}
            maxLength={100}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            className="w-full rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            style={fieldStyle}
            placeholder="Jane Doe"
          />
          {errors.name && <p className="text-sm mt-1 text-destructive">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="cf-email" className="block text-sm mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Your email
          </label>
          <input
            id="cf-email"
            type="email"
            value={values.email}
            maxLength={255}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            className="w-full rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            style={fieldStyle}
            placeholder="you@company.com"
          />
          {errors.email && <p className="text-sm mt-1 text-destructive">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="cf-type" className="block text-sm mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
            What is this about?
          </label>
          <select
            id="cf-type"
            value={values.inquiry_type}
            onChange={(e) => setValues({ ...values, inquiry_type: e.target.value as LeadData['inquiry_type'] })}
            className="w-full rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            style={fieldStyle}
          >
            <option value="general" style={{ color: '#0A0A23' }}>General question</option>
            <option value="brand" style={{ color: '#0A0A23' }}>AI digital employee for my business</option>
            <option value="collaboration" style={{ color: '#0A0A23' }}>Partnership or collaboration</option>
            <option value="modeling" style={{ color: '#0A0A23' }}>Interactive modeling &amp; marketing</option>
          </select>
        </div>

        <div>
          <label htmlFor="cf-message" className="block text-sm mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Your message
          </label>
          <textarea
            id="cf-message"
            rows={5}
            value={values.message}
            maxLength={1000}
            onChange={(e) => setValues({ ...values, message: e.target.value })}
            className="w-full rounded-lg px-4 py-3 outline-none resize-y focus:ring-2 focus:ring-[#D4AF37]/50"
            style={fieldStyle}
            placeholder="Tell us about your business and what you'd like to build."
          />
          {errors.message && <p className="text-sm mt-1 text-destructive">{errors.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={sending}
          className="w-full py-6 h-auto rounded-xl text-base"
          style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%)', color: '#0A0A23', fontWeight: 700 }}
        >
          {sending ? 'Sending…' : 'Send Message'}
          {!sending && <Send size={18} className="ml-2" />}
        </Button>
      </div>
    </form>
  );
};

export default ContactMessageForm;
