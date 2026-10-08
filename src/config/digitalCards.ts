export const DIGITAL_CARD_PLANS = [
  { id: 'basic', name: 'Ovela Digital Card', monthlyPrice: 2, yearlyPrice: 24, profileUpdatesPerMonth: 1, smartUpdatesPerMonth: 0 },
  { id: 'pro', name: 'Ovela Digital Card Pro', monthlyPrice: 3, yearlyPrice: 36, profileUpdatesPerMonth: 1, smartUpdatesPerMonth: 2 },
] as const;

export const DIGITAL_CARD_BASIC_UPDATE_KINDS = ['name', 'address', 'email', 'telephone', 'position', 'company information', 'website', 'message'] as const;
export const DIGITAL_CARD_PRO_CAPABILITIES = { marketingUpdates: true, pushNotifications: true, companyAnalytics: true } as const;