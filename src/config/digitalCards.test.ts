import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { DIGITAL_CARD_PLANS } from './digitalCards';

describe('Digital Card prices and update limits', () => {
  test('Basic costs €2 monthly', () => assert.equal(DIGITAL_CARD_PLANS[0].monthlyPrice, 2));
  test('Basic costs €24 yearly', () => assert.equal(DIGITAL_CARD_PLANS[0].yearlyPrice, 24));
  test('Pro costs €3 monthly', () => assert.equal(DIGITAL_CARD_PLANS[1].monthlyPrice, 3));
  test('Pro costs €36 yearly', () => assert.equal(DIGITAL_CARD_PLANS[1].yearlyPrice, 36));
  test('Basic includes one profile update monthly', () => assert.equal(DIGITAL_CARD_PLANS[0].profileUpdatesPerMonth, 1));
  test('Pro includes up to two Smart Updates monthly', () => assert.equal(DIGITAL_CARD_PLANS[1].smartUpdatesPerMonth, 2));
  test('Smart Updates are Pro only', () => assert.equal(DIGITAL_CARD_PLANS[0].smartUpdatesPerMonth, 0));
});