import React from 'react';
import { Calculator, HeartPulse, TrendingDown, MessageCircle } from 'lucide-react';

/**
 * Authority tool launcher — fires a `isabella:open` window event that
 * IsabellaConcierge listens for. Opens the concierge with a pre-seeded
 * prompt + tool_context + authority_topic so Isabella behaves as a
 * domain-specific tool, not a generic chat.
 */

export type ToolKind = 'receptionist_cost' | 'missed_leads' | 'wellness_assessment';

const TOOL_PRESETS: Record<ToolKind, {
  label: string;
  sub: string;
  icon: React.ReactNode;
  initialPrompt: string;
  tool_context: string;
}> = {
  receptionist_cost: {
    label: 'Calculate your reception cost',
    sub: 'Real Eurostat ranges vs Isabella — powered by Isabella',
    icon: <Calculator className="w-5 h-5" />,
    initialPrompt:
      "I'd like to calculate what a human receptionist would actually cost in my country, and compare it to deploying you instead. Please ask me what you need.",
    tool_context: 'receptionist_cost_calculator',
  },
  missed_leads: {
    label: 'How much revenue am I losing to missed calls?',
    sub: 'Quantify after-hours & language-blocked inbound — powered by Isabella',
    icon: <TrendingDown className="w-5 h-5" />,
    initialPrompt:
      "Help me estimate how much revenue I'm losing to missed calls, after-hours leads, and language barriers. Ask me whatever you need to run the numbers.",
    tool_context: 'missed_leads_calculator',
  },
  wellness_assessment: {
    label: 'Get a wellness suggestion (not a diagnosis)',
    sub: 'Describe your symptoms — Isabella suggests a WellneSpirit pack',
    icon: <HeartPulse className="w-5 h-5" />,
    initialPrompt:
      "I'd like a quick wellness suggestion — not a diagnosis. Ask me about my symptoms and recommend the right WellneSpirit assessment or therapy pack.",
    tool_context: 'wellness_assessment_suggestion',
  },
};

interface AuthorityToolProps {
  tool: ToolKind;
  authorityTopic: string;
  variant?: 'card' | 'inline';
}

export const launchIsabellaTool = (tool: ToolKind, authorityTopic: string) => {
  const preset = TOOL_PRESETS[tool];
  window.dispatchEvent(
    new CustomEvent('isabella:open', {
      detail: {
        initialPrompt: preset.initialPrompt,
        tool_context: preset.tool_context,
        authority_topic: authorityTopic,
      },
    }),
  );
};

const AuthorityTool: React.FC<AuthorityToolProps> = ({ tool, authorityTopic, variant = 'card' }) => {
  const preset = TOOL_PRESETS[tool];

  if (variant === 'inline') {
    return (
      <button
        onClick={() => launchIsabellaTool(tool, authorityTopic)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-champagne-gold text-charcoal text-sm font-medium hover:scale-105 transition-transform"
      >
        {preset.icon}
        {preset.label}
      </button>
    );
  }

  return (
    <button
      onClick={() => launchIsabellaTool(tool, authorityTopic)}
      className="group w-full text-left p-5 rounded-xl border border-champagne-gold/30 bg-gradient-to-br from-champagne-gold/[0.07] to-transparent hover:border-champagne-gold/70 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-full bg-champagne-gold/15 flex items-center justify-center text-champagne-gold flex-shrink-0">
          {preset.icon}
        </div>
        <div className="flex-1">
          <p className="font-playfair text-lg text-soft-white mb-1 group-hover:text-champagne-gold transition-colors">
            {preset.label}
          </p>
          <p className="text-xs text-soft-white/60">{preset.sub}</p>
        </div>
        <MessageCircle className="w-4 h-4 text-champagne-gold/70 mt-2" />
      </div>
    </button>
  );
};

export default AuthorityTool;
