import test from 'node:test';
import assert from 'node:assert/strict';
import { getGenericAuthMessage, getGenericAccountMessage } from '../utils/securityMessages.js';

test('getGenericAuthMessage returns a non-enumerating auth response', () => {
  assert.equal(getGenericAuthMessage(), 'Invalid email or password');
});

test('getGenericAccountMessage returns non-specific messages for create, update, and delete actions', () => {
  assert.equal(getGenericAccountMessage('create'), 'Unable to create account');
  assert.equal(getGenericAccountMessage('update'), 'Unable to update account');
  assert.equal(getGenericAccountMessage('delete'), 'Unable to delete account');
});
