import test from 'node:test';
import assert from 'node:assert/strict';
import { createCsrfToken, verifyCsrfToken } from '../utils/csrf.js';

test('csrf tokens validate correctly', () => {
  const token = createCsrfToken();
  assert.equal(typeof token, 'string');
  assert.equal(verifyCsrfToken(token, token), true);
  assert.equal(verifyCsrfToken(token, 'wrong'), false);
});
