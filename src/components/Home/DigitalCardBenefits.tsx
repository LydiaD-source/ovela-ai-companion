import { RefreshCw, Share2, Contact, Megaphone, BarChart3, Leaf, Bell, Printer } from 'lucide-react';

const benefits = [
  { icon: Share2, title: 'Never run out of cards', text: 'Share whenever you meet someone — at conferences, meetings, events or networking opportunities.' },
  { icon: RefreshCw, title: 'Always up to date', text: 'Basic includes one update per month: change a name, address, telephone, email, role, company information, website or message.' },
  { icon: Printer, title: 'No repeated printing costs', text: 'Keep information current without ordering another batch of paper cards.' },
  { icon: Contact, title: 'More than a contact card', text: 'Phone, WhatsApp, email, website, position, company highlights and relevant links — together in one place.' },
  { icon: Megaphone, title: 'A marketing channel with Pro', text: 'Up to two Smart Updates per month for new products, events, seminars, programmes, services, publications and announcements.' },
  { icon: Bell, title: 'Stay connected after the meeting', text: 'Your saved card stays on their phone. Pro is designed to add company news to saved cards and notify recipients by push, subject to notification permission and supported devices.' },
  { icon: BarChart3, title: 'Company-level insight with Pro', text: 'Card distribution and activity, scans, link clicks and interactions give management insight into how sales and marketing teams use their cards.' },
  { icon: Leaf, title: 'Less paper. Lasting connections.', text: 'Reduce paper and printing associated with distributing and replacing business cards.' },
];

export const DigitalCardBenefits = () => (
  <section className="mb-10 border-t border-solution-border pt-8">
    <h2 className="mb-6 max-w-3xl font-playfair text-3xl leading-tight">Why move from paper business cards to Ovela Digital Cards?</h2>
    <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
      {benefits.map(({ icon: Icon, title, text }) => <div key={title} className="min-w-0">
        <Icon className="mb-3 h-5 w-5 text-solution-gold" aria-hidden="true" />
        <h3 className="mb-2 text-base font-medium">{title}</h3>
        <p className="text-sm leading-relaxed text-solution-muted">{text}</p>
      </div>)}
    </div>
    <p className="mt-6 text-xs leading-relaxed text-solution-muted">Smart Updates, push notifications and company analytics describe the Pro offering, not working features demonstrated in these screenshots. The team will confirm availability and delivery details for your project.</p>
  </section>
);