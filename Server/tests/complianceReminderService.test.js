import test from 'node:test';
import assert from 'node:assert/strict';
import { buildComplianceReminderHtml, getReminderStageName } from '../services/complianceReminderService.js';
import Compliance from '../models/ComplianceModel.js';

test('returns the 14-day stage when the deadline is two weeks away', () => {
  const now = new Date('2026-07-11T10:00:00.000Z');
  const deadline = new Date('2026-07-25T10:00:00.000Z');

  assert.equal(getReminderStageName(deadline, now), '14d');
});

test('returns the 7-day stage when the deadline is one week away', () => {
  const now = new Date('2026-07-11T10:00:00.000Z');
  const deadline = new Date('2026-07-18T10:00:00.000Z');

  assert.equal(getReminderStageName(deadline, now), '7d');
});

test('returns the 3-day stage when the deadline is three days away', () => {
  const now = new Date('2026-07-11T10:00:00.000Z');
  const deadline = new Date('2026-07-14T10:00:00.000Z');

  assert.equal(getReminderStageName(deadline, now), '3d');
});

test('returns null when the deadline has already passed', () => {
  const now = new Date('2026-07-15T10:00:00.000Z');
  const deadline = new Date('2026-07-14T10:00:00.000Z');

  assert.equal(getReminderStageName(deadline, now), null);
});

test('uses configured custom thresholds when they are provided', () => {
  const now = new Date('2026-07-11T10:00:00.000Z');
  const deadline = new Date('2026-07-21T10:00:00.000Z');

  assert.equal(getReminderStageName(deadline, now, [15, 10, 5]), '10d');
});

test('accepts comma-separated reminder thresholds stored as a string', () => {
  const now = new Date('2026-07-11T10:00:00.000Z');
  const deadline = new Date('2026-07-25T10:00:00.000Z');

  assert.equal(getReminderStageName(deadline, now, '14,7,3'), '14d');
});

test('accepts friendly reminder threshold strings with w/d suffixes', () => {
  const now = new Date('2026-07-11T10:00:00.000Z');
  assert.equal(getReminderStageName(new Date('2026-07-25T10:00:00.000Z'), now, '2w, 7d, 3d'), '14d');
  assert.equal(getReminderStageName(new Date('2026-07-18T10:00:00.000Z'), now, '2w, 7d, 3d'), '7d');
  assert.equal(getReminderStageName(new Date('2026-07-14T10:00:00.000Z'), now, '2w, 7d, 3d'), '3d');
});

test('accepts friendly reminder threshold strings with words', () => {
  const now = new Date('2026-07-11T10:00:00.000Z');
  assert.equal(getReminderStageName(new Date('2026-07-25T10:00:00.000Z'), now, '2 weeks, 7 days, 3 days'), '14d');
  assert.equal(getReminderStageName(new Date('2026-07-18T10:00:00.000Z'), now, '2 weeks, 7 days, 3 days'), '7d');
  assert.equal(getReminderStageName(new Date('2026-07-14T10:00:00.000Z'), now, '2 weeks, 7 days, 3 days'), '3d');
});

test('uses 14d stage for deadlines just under 14 days away', () => {
  const now = new Date('2026-07-11T10:00:00.000Z');
  const deadline = new Date('2026-07-25T09:59:59.000Z');

  assert.equal(getReminderStageName(deadline, now, '14,7,3'), '14d');
});

test('uses custom day thresholds for 1d..2w correctly', () => {
  const now = new Date('2026-07-11T10:00:00.000Z');
  const thresholds = '1d,2d,3d,4d,5d,6d,1w,2w';

  assert.equal(getReminderStageName(new Date('2026-07-12T09:00:00.000Z'), now, thresholds), '1d');
  assert.equal(getReminderStageName(new Date('2026-07-13T10:00:00.000Z'), now, thresholds), '2d');
  assert.equal(getReminderStageName(new Date('2026-07-14T10:00:00.000Z'), now, thresholds), '3d');
  assert.equal(getReminderStageName(new Date('2026-07-25T10:00:00.000Z'), now, thresholds), '14d');
});

test('serializes reminderStagesSent as a JSON string when set as an array', () => {
  const compliance = Compliance.build();

  compliance.reminderStagesSent = ['14d', '7d'];

  assert.deepEqual(compliance.reminderStagesSent, ['14d', '7d']);
  assert.equal(compliance.getDataValue('reminderStagesSent'), JSON.stringify(['14d', '7d']));
});

test('builds reminder HTML for a recipient without referencing undefined variables', () => {
  const html = buildComplianceReminderHtml({
    recipientName: 'Ada Lovelace',
    title: 'Quarterly review',
    deadline: 'July 25, 2026',
    reminderLabel: '2 weeks',
    description: 'Please prepare the evidence pack.',
  });

  assert.match(html, /Hello <strong>Ada Lovelace<\/strong>/);
  assert.match(html, /Quarterly review/);
  assert.match(html, /2 weeks/);
});
