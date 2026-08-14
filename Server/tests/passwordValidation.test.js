import test from 'node:test';
import assert from 'node:assert/strict';
import { validationResult } from 'express-validator';
import { isStrongPassword, optionalPasswordValidationRules } from '../validations/passwordValidation.js';

test('isStrongPassword rejects weak passwords when provided', () => {
  assert.equal(isStrongPassword('weakpass'), false);
  assert.equal(isStrongPassword('Weakpass1!'), true);
});

test('optionalPasswordValidationRules rejects an empty password string', async () => {
  const req = { body: { password: '' } };
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  const next = () => {};

  for (const rule of optionalPasswordValidationRules) {
    await rule(req, res, next);
  }

  const errors = validationResult(req);
  assert.equal(errors.isEmpty(), false);
  assert.match(errors.array()[0].msg, /Password/);
});
