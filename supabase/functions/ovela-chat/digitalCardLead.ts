export const digitalCardLeadPayload = (
  contact: { name: string; email: string; inquiry_type: string; message: string },
  topic: string,
) => ({
  ...contact,
  message: `[Ovela Digital Card ${topic === 'digital_card_pro' ? 'Pro' : 'Basic'} enquiry]\n${contact.message}`,
  source: 'isabella-digital-card',
});