import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calculator, HeartPulse, TrendingDown, MessageCircle, Apple, Hourglass } from 'lucide-react';

/**
 * Authority tool launcher — routes every click to the MAIN Isabella
 * (animated + voice-enabled) on the Home page, with a pre-seeded prompt
 * + tool_context + authority_topic stored in sessionStorage. There is
 * only ONE Isabella; no secondary chat instances.
 */

export type ToolKind =
  | 'receptionist_cost'
  | 'missed_leads'
  | 'wellness_assessment'
  | 'nutrition_assessment'
  | 'biological_age';

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
  nutrition_assessment: {
    label: 'Analyze my diet & protein intake',
    sub: 'Upload, paste, type or describe a typical week — Isabella analyses protein, balance and improvement opportunities.',
    icon: <Apple className="w-5 h-5" />,
    initialPrompt:
      "I'd like the Protein & Nutrition Assessment. Please walk me through it conversationally — I can type my week, paste my meal diary, upload a PDF or screenshot, or just describe it. Start with the disclaimer, then ask for what you need.",
    tool_context: 'nutrition_assessment',
  },
  biological_age: {
    label: 'Estimate my biological age',
    sub: 'Lifestyle, recovery, sleep and activity — Isabella estimates how your body may be aging.',
    icon: <Hourglass className="w-5 h-5" />,
    initialPrompt:
      "I'd like the Biological Age Assessment. Please run it conversationally — lifestyle questions only, no medical history. Start with the disclaimer, then ask 2–3 questions at a time.",
    tool_context: 'biological_age_assessment',
  },
};

export const ISABELLA_TOOL_STORAGE_KEY = 'ovela:isabella:tool';

interface AuthorityToolProps {
  tool: ToolKind;
  authorityTopic: string;
  variant?: 'card' | 'inline';
}

const AuthorityTool: React.FC<AuthorityToolProps> = ({ tool, authorityTopic, variant = 'card' }) => {
  const preset = TOOL_PRESETS[tool];
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const langPrefix = lang === 'en' ? '' : `/${lang}`;

  const launch = () => {
    try {
      sessionStorage.setItem(
        ISABELLA_TOOL_STORAGE_KEY,
        JSON.stringify({
          initialPrompt: preset.initialPrompt,
          tool_context: preset.tool_context,
          authority_topic: authorityTopic,
        }),
      );
    } catch {}
    // Always send the user to the main Isabella on Home; chat=open triggers her.
    navigate(`${langPrefix}/?chat=open`);
  };

  if (variant === 'inline') {
    return (
      <button
        onClick={launch}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-champagne-gold text-charcoal text-sm font-medium hover:scale-105 transition-transform"
      >
        {preset.icon}
        {preset.label}
      </button>
    );
  }

  return (
    <button
      onClick={launch}
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
