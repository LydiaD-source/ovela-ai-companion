import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { cardComparisonPath, IIPE_PARTNER_URL } from './cardFirstSite';
test('Homepage card action opens Basic/Pro comparison rather than an enquiry', () => assert.equal(cardComparisonPath(), '/digital-cards#plans'));
test('Localized comparison preserves the visitor language', () => assert.equal(cardComparisonPath('/es'), '/es/digital-cards#plans'));
test('IIPE partner links to its independent domain', () => assert.equal(IIPE_PARTNER_URL, 'https://iipe.exchange/'));
