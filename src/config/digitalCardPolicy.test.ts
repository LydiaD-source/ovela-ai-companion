import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { digitalCardLeadPayload } from '../../supabase/functions/ovela-chat/digitalCardLead';

test('Card enquiry preserves all supplied requirements and the selected plan for the team', () => {
  const payload = digitalCardLeadPayload({ name: 'Example Person', email: 'example@example.com', inquiry_type: 'general', message: '40 cards for sales, seminar announcements and analytics' }, 'digital_card_pro');
  assert.equal(payload.source, 'isabella-digital-card');
  assert.equal(payload.message, '[Ovela Digital Card Pro enquiry]\n40 cards for sales, seminar announcements and analytics');
  assert.equal(payload.email, 'example@example.com');
});