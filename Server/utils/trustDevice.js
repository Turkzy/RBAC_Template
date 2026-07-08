import crypto from "crypto";

const SECRET = process.env.TRUST_DEVICE_SECRET || process.env.JWT_SECRET || "change_me";

export const createTrustedDeviceToken = (userId, days = 30) => {
  const expires = Date.now() + days * 24 * 60 * 60 * 1000;
  const payload = `${userId}:${expires}`;
  const hmac = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${hmac}`).toString("base64");
};

export const verifyTrustedDeviceToken = (token) => {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [userId, expiresStr, hmac] = parts;
    const expires = Number(expiresStr);
    if (Date.now() > expires) return null;
    const payload = `${userId}:${expires}`;
    const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hmac))) return null;
    return { userId: Number(userId), expires };
  } catch (e) {
    return null;
  }
};
