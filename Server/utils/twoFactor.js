const codes = new Map(); // userId -> { code, expiresAt }

export const generateTwoFactorCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeTwoFactorCode = (userId, code, ttlMinutes = 10) => {
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  codes.set(String(userId), { code: String(code), expiresAt });
};

export const verifyTwoFactorCode = (userId, code) => {
  const entry = codes.get(String(userId));
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    codes.delete(String(userId));
    return false;
  }
  const ok = entry.code === String(code);
  if (ok) codes.delete(String(userId));
  return ok;
};

export const clearTwoFactorCode = (userId) => {
  codes.delete(String(userId));
};
