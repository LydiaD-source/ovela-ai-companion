import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { DIGITAL_CARD_PLANS, DIGITAL_CARD_BASIC_UPDATE_KINDS, DIGITAL_CARD_PRO_CAPABILITIES } from './digitalCards';
import { digitalCardEnquiryPath, digitalCardEnquirySeed } from './digitalCardEnquiry';

describe('Digital Card prices and update limits', () => {
  test('Basic costs €2 monthly', () => assert.equal(DIGITAL_CARD_PLANS[0].monthlyPrice, 2));
  test('Basic costs €24 yearly', () => assert.equal(DIGITAL_CARD_PLANS[0].yearlyPrice, 24));
  test('Pro costs €3 monthly', () => assert.equal(DIGITAL_CARD_PLANS[1].monthlyPrice, 3));
  test('Pro costs €36 yearly', () => assert.equal(DIGITAL_CARD_PLANS[1].yearlyPrice, 36));
  test('Basic includes one profile update monthly', () => assert.equal(DIGITAL_CARD_PLANS[0].profileUpdatesPerMonth, 1));
  test('Pro includes up to two Smart Updates monthly', () => assert.equal(DIGITAL_CARD_PLANS[1].smartUpdatesPerMonth, 2));
  test('Smart Updates are Pro only', () => assert.equal(DIGITAL_CARD_PLANS[0].smartUpdatesPerMonth, 0));
  test('Basic updates include a message as well as contact information', () => {
    for (const kind of ['name', 'address', 'email', 'telephone', 'message']) assert.ok(DIGITAL_CARD_BASIC_UPDATE_KINDS.some(value => value === kind));
  });
  test('Pro offering includes marketing updates', () => assert.equal(DIGITAL_CARD_PRO_CAPABILITIES.marketingUpdates, true));
  test('Pro offering includes push notices', () => assert.equal(DIGITAL_CARD_PRO_CAPABILITIES.pushNotifications, true));
  test('Pro offering includes company analytics', () => assert.equal(DIGITAL_CARD_PRO_CAPABILITIES.companyAnalytics, true));
  test('Basic enquiry opens Isabella with the selected plan', () => {
    assert.equal(digitalCardEnquiryPath('', 'basic'), '/?tool=digital-card&plan=basic');
    assert.equal(digitalCardEnquirySeed('basic').authority_topic, 'digital_card_basic');
  });
  test('Pro enquiry retains the localized prefix and selected plan', () => {
    assert.equal(digitalCardEnquiryPath('/es', 'pro'), '/es/?tool=digital-card&plan=pro');
    assert.equal(digitalCardEnquirySeed('pro').authority_topic, 'digital_card_pro');
  });
});