import { describe, test, expect } from 'bun:test';
import { DIGITAL_CARD_PLANS } from './digitalCards';

describe('Digital Card prices and update limits', () => {
  test('Basic costs €2 monthly', () => expect(DIGITAL_CARD_PLANS[0].monthlyPrice).toBe(2));
  test('Basic costs €24 yearly', () => expect(DIGITAL_CARD_PLANS[0].yearlyPrice).toBe(24));
  test('Pro costs €3 monthly', () => expect(DIGITAL_CARD_PLANS[1].monthlyPrice).toBe(3));
  test('Pro costs €36 yearly', () => expect(DIGITAL_CARD_PLANS[1].yearlyPrice).toBe(36));
  test('Basic includes one profile update monthly', () => expect(DIGITAL_CARD_PLANS[0].profileUpdatesPerMonth).toBe(1));
  test('Pro includes up to two Smart Updates monthly', () => expect(DIGITAL_CARD_PLANS[1].smartUpdatesPerMonth).toBe(2));
  test('Smart Updates are Pro only', () => expect(DIGITAL_CARD_PLANS[0].smartUpdatesPerMonth).toBe(0));
});