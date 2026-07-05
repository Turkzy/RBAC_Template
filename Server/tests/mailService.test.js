import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml } from '../services/mailService.js';

test('escapeHtml prevents HTML injection in email content', () => {
  const input = '<script>alert("xss")</script> & "quoted" <b>bold</b>';
  assert.equal(escapeHtml(input), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &quot;quoted&quot; &lt;b&gt;bold&lt;/b&gt;');
});
