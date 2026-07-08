import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeString, sanitizeObject } from '../utils/sanitizeInput.js';

test('sanitizeString removes script tags and escapes HTML', () => {
  const input = '<script>alert("xss")</script><b>Safe</b> & more';
  const result = sanitizeString(input);

  assert.equal(result, 'Safe &amp; more');
});

test('sanitizeObject sanitizes nested string values', () => {
  const input = {
    name: '<img src=x onerror=alert(1)>',
    description: 'A <strong>description</strong> with <script>bad()</script>',
    nested: { title: 'Hello <world>' },
  };

  const result = sanitizeObject(input);

  assert.equal(result.name, '');
  assert.equal(result.description, 'A description with');
  assert.equal(result.nested.title, 'Hello');
});
