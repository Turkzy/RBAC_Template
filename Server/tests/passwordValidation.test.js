import test from 'node:test';
import assert from 'node:assert/strict';
import { isStrongPassword } from '../validations/passwordValidation.js';

test('isStrongPassword rejects weak passwords when provided', () => {
  assert.equal(isStrongPassword('weakpass'), false);
  assert.equal(isStrongPassword('Weakpass1!'), true);
});
