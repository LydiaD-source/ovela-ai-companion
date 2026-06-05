import React from 'react';
import { Apple, Hourglass, Calculator, TrendingDown, FileText, Check } from 'lucide-react';
import type { ToolKind } from '@/components/UI/AuthorityTool';

export interface AssessmentLaunchPayload {
  initialPrompt: string;
  tool_context: string;
  authority_topic: string;
}

interface AssessmentsSectionProps {
  onLaunch: (payload: AssessmentLaunchPayload) => void;
}

interface Card {
  tool: ToolKind;
  icon: React.ReactNode;
  emoji: string;
  title: string;
  blurb: string;
  bullets: string[];
  cta: string;
  status: 'live' | 'beta' | 'wip';
  initialPrompt: string;
  tool_context: string;
  authority_topic: string;
}

const CARDS: Card[] = [
  {
    tool: 'nutrition_assessment',
    icon: <Apple className="w-6 h-6" />,
    emoji: '🧬',
    title: 'Executive Nutrition & Muscle Preservation Assessment',
    blurb:
      'Upload a meal log, describe a typical week, or answer a few questions.',
    bullets: [
      'Protein adequacy analysis',
      'Muscle preservation score',
      'Recovery & hydration scores',
      'Metabolic support evaluation',
      'Personalised weekly action plan',
      'Downloadable PDF report',
    ],
    cta: 'Start Free Assessment',
    status: 'live',
    initialPrompt:
      "I'd like the Executive Nutrition & Muscle Preservation Assessment. Please walk me through it conversationally — I can type my week, paste my meal diary, upload a PDF or screenshot, or just describe it. Start with the disclaimer, then ask for what you need.",
    tool_context: 'nutrition_assessment',
    authority_topic: 'protein_nutrition_assessment',
  },
  {
    tool: 'recovery_resilience',
    icon: <Hourglass className="w-6 h-6" />,
    emoji: '⏳',
    title: 'Executive Recovery & Resilience Assessment',
    blurb:
      'Discover how stress, recovery, sleep, workload and lifestyle habits may be affecting your resilience, energy and long-term performance.',
    bullets: [
      'Recovery capacity score',
      'Stress load & resilience scoring',
      'Burnout risk indicators',
      'Executive performance factor analysis',
      '7-day recovery plan',
      'Downloadable PDF report',
    ],
    cta: 'Check My Recovery Capacity',
    status: 'live',
    initialPrompt:
      "I'd like the Executive Recovery & Resilience Assessment. Please run it conversationally in 5 short phases (personal profile, workload & stress, recovery, lifestyle & resilience, optional nutrition integration). Lifestyle questions only — no medical history, no diagnosis. Start with the disclaimer and ask 2–3 questions at a time.",
    tool_context: 'recovery_resilience_assessment',
    authority_topic: 'recovery_resilience_assessment',
  },
  {
    tool: 'receptionist_cost',
    icon: <Calculator className="w-6 h-6" />,
    emoji: '💼',
    title: 'AI Reception Cost Calculator',
    blurb:
      'Compare traditional staffing costs with an AI Digital Employee.',
    bullets: [
      'Salary comparison',
      'Multilingual staffing estimates',
      'Availability analysis',
      'Cost projections',
      'Potential annual savings',
    ],
    cta: 'Run Comparison',
    status: 'beta',
    initialPrompt:
      "I'd like to calculate what a human receptionist would actually cost in my country, and compare it to deploying you instead. Please ask me what you need.",
    tool_context: 'receptionist_cost_calculator',
    authority_topic: 'receptionist_cost',
  },
  {
    tool: 'missed_leads',
    icon: <TrendingDown className="w-6 h-6" />,
    emoji: '🤖',
    title: 'How Much Am I Losing To Missed Calls?',
    blurb:
      'Discover where AI can support communication, lead generation, and customer engagement.',
    bullets: [
      'Communication bottleneck analysis',
      'Lead capture opportunities',
      'Automation opportunities',
      'Recommended AI roles',
      'Suggested implementation strategy',
    ],
    cta: 'Assess My Business',
    status: 'beta',
    initialPrompt:
      "Help me estimate how much revenue I'm losing to missed calls, after-hours leads, and language barriers. Ask me whatever you need to run the numbers.",
    tool_context: 'missed_leads_calculator',
    authority_topic: 'missed_leads',
  },
];

const STATUS_BADGE: Record<Card['status'], { label: string; cls: string }> = {
  live: { label: 'Live', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' },
  beta: { label: 'Beta', cls: 'bg-champagne-gold/15 text-champagne-gold border-champagne-gold/30' },
  wip: { label: 'Coming soon', cls: 'bg-soft-white/10 text-soft-white/70 border-soft-white/20' },
};

export const AssessmentsSection: React.FC<AssessmentsSectionProps> = ({ onLaunch }) => {
  return (
    <section
      id="isabella-assessments"
      className="w-full bg-black border-y border-champagne-gold/15 py-20 md:py-28"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at top, rgba(232,207,169,0.06), transparent 60%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-[11px] tracking-[0.3em] uppercase text-champagne-gold/80 mb-4">
            Experience Isabella
          </span>
          <h2
            className="text-3xl md:text-5xl leading-tight text-soft-white mb-5"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Experience what an{' '}
            <span
              style={{
                background: 'linear-gradient(90deg,#E8CFA9,#F5E6C8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI Digital Employee
            </span>{' '}
            can actually do
          </h2>
          <p className="text-soft-white/70 text-base md:text-lg leading-relaxed">
            Not a demo. Not a chatbot. A real AI Digital Employee capable of analysing
            information, generating reports, performing calculations and guiding decisions
            in real time. <span className="text-champagne-gold">Powered by Isabella.</span>
          </p>
          <p className="mt-4 text-sm text-soft-white/55">
            Choose one of Isabella's interactive assessments below — she'll take it from there.
          </p>
        </div>

        {/* Grid of 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {CARDS.map((card) => {
            const badge = STATUS_BADGE[card.status];
            return (
              <button
                key={card.tool}
                onClick={() =>
                  onLaunch({
                    initialPrompt: card.initialPrompt,
                    tool_context: card.tool_context,
                    authority_topic: card.authority_topic,
                  })
                }
                className="group relative text-left p-6 md:p-7 rounded-2xl border border-champagne-gold/25 bg-gradient-to-br from-champagne-gold/[0.06] via-transparent to-transparent hover:border-champagne-gold/70 hover:from-champagne-gold/[0.12] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-20px_rgba(232,207,169,0.35)]"
              >
                {/* Status badge */}
                <span
                  className={`absolute top-4 right-4 text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full border ${badge.cls}`}
                >
                  {badge.label}
                </span>

                {/* Icon + title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-champagne-gold/15 flex items-center justify-center text-champagne-gold flex-shrink-0 group-hover:scale-105 transition-transform">
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-xl md:text-2xl text-soft-white mb-1 leading-tight"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      <span className="mr-2 opacity-80">{card.emoji}</span>
                      {card.title}
                    </h3>
                    <p className="text-sm text-soft-white/65 leading-relaxed">
                      {card.blurb}
                    </p>
                  </div>
                </div>

                {/* Bullets */}
                <ul className="space-y-1.5 mb-6 mt-2">
                  {card.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-sm text-soft-white/80"
                    >
                      <Check className="w-4 h-4 text-champagne-gold/90 mt-0.5 flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-champagne-gold/15">
                  <span className="text-champagne-gold font-medium text-sm group-hover:translate-x-0.5 transition-transform">
                    {card.cta} →
                  </span>
                  <span className="text-[10px] text-soft-white/40 uppercase tracking-wider">
                    Free · Multilingual
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Trust banner */}
        <div className="mt-12 text-center">
          <p className="text-soft-white/70 text-sm md:text-base italic">
            Already generating personalised reports for clinic visitors, wellness clients,
            business owners and executives.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-soft-white/60">
            {[
              'Multilingual Assessments',
              'Personalised Reports',
              'Downloadable PDFs',
              'Powered by Isabella',
            ].map((f) => (
              <span key={f} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-champagne-gold" /> {f}
              </span>
            ))}
          </div>
        </div>

        {/* Sample report */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <p className="text-soft-white/70 text-sm text-center max-w-xl">
            <span className="text-champagne-gold font-medium">Real reports. Real analysis.</span>
            <br />
            Every assessment generates a personalised report powered by Isabella.
          </p>
          <a
            href="/sample-nutrition-assessment.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-champagne-gold/40 text-champagne-gold text-sm hover:bg-champagne-gold/10 transition-colors"
          >
            <FileText className="w-4 h-4" />
            View Sample Report (PDF)
          </a>
        </div>

        {/* Disclaimer */}
        <p className="mt-10 text-center text-[11px] text-soft-white/40 max-w-2xl mx-auto leading-relaxed">
          Educational use only. These assessments do not replace professional medical, legal,
          financial, or clinical advice. Uploaded files are processed in-session and are not
          permanently stored.
        </p>
      </div>
    </section>
  );
};

export default AssessmentsSection;
