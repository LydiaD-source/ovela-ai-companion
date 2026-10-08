export const DIGITAL_CARD_CONTACT_EMAIL = 'ovelainteractive@gmail.com';

export const digitalCardEnquiryPath = (prefix: string, plan: 'basic' | 'pro') =>
  `${prefix}/?tool=digital-card&plan=${plan}`;

export const digitalCardEnquirySeed = (plan: string | null) => ({
  tool_context: 'digital_card_enquiry',
  authority_topic: plan === 'pro' ? 'digital_card_pro' : 'digital_card_basic',
  initialPrompt: `I'm interested in the Ovela Digital Card ${plan === 'pro' ? 'Pro' : 'Basic'} option.`,
});