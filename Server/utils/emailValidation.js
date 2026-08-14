export const isValidEmail = (email) => {
  if (typeof email !== "string") return false;

  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  if (normalized.includes("..")) return false;
  if (normalized.startsWith(".") || normalized.endsWith(".")) return false;

  const parts = normalized.split("@");
  if (parts.length !== 2) return false;

  const [localPart, domainPart] = parts;
  if (!localPart || !domainPart) return false;
  if (localPart.length > 64 || domainPart.length > 253) return false;

  const domainLabels = domainPart.split(".");
  if (domainLabels.length < 2) return false;
  if (domainLabels[domainLabels.length - 1].length < 2) return false;

  const emailRegex = /^(?!.*\.\.)([a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?)@([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
  return emailRegex.test(normalized);
};
