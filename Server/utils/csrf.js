import crypto from 'crypto';

export const createCsrfToken = () => crypto.randomBytes(32).toString('hex');

export const verifyCsrfToken = (expected, received) => {
  if (typeof expected !== 'string' || typeof received !== 'string') return false;
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
};
