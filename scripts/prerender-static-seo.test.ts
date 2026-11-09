import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { buildJobs } from './prerender-static-seo';
import { TOPIC_HUBS } from '../src/lib/topicHubsContent';
import { CATEGORY_META } from '../src/lib/videoCategoryMeta';

test('Every English topic has its own prerender job and self canonical', () => {
  const jobs = buildJobs();
  for (const hub of TOPIC_HUBS) {
    const matches = jobs.filter(job => job.lang === 'en' && job.path === `/topics/${hub.slug}`);
    assert.equal(matches.length, 1);
    assert.equal(matches[0]?.canonical, 'self');
  }
  assert.equal(TOPIC_HUBS.length, 11);
});

test('Every English video category has its own prerender job and self canonical', () => {
  const jobs = buildJobs();
  for (const category of CATEGORY_META) {
    const matches = jobs.filter(job => job.lang === 'en' && job.path === `/videos/category/${category.slug}`);
    assert.equal(matches.length, 1);
    assert.equal(matches[0]?.canonical, 'self');
  }
  assert.equal(CATEGORY_META.length, 5);
});

test('Untranslated video libraries consolidate to the English URL', () => {
  const jobs = buildJobs().filter(job => job.path === '/videos');
  assert.equal(jobs.length, 6);
  assert.ok(jobs.every(job => job.canonical === 'en'));
});