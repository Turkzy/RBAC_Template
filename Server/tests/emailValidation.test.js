import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidEmail } from '../utils/emailValidation.js';

test('accepts well-formed email addresses', () => {
  assert.equal(isValidEmail('user@example.com'), true);
  assert.equal(isValidEmail('user.name+tag@sub.example.org'), true);
});

test('rejects malformed email addresses', () => {
  assert.equal(isValidEmail('a@b.c'), false);
  assert.equal(isValidEmail('user@localhost'), false);
  assert.equal(isValidEmail('test@example.'), false);
  assert.equal(isValidEmail('@example.com'), false);
  assert.equal(isValidEmail('user..name@example.com'), false);
});
