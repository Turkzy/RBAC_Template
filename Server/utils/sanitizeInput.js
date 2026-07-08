const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const sanitizeString = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') return String(value);

  const withoutScripts = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  const withoutTags = withoutScripts.replace(/<[^>]*>/g, '');

  return escapeHtml(withoutTags).trim();
};

export const sanitizeObject = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, sanitizeObject(value)])
    );
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  return obj;
};

export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};
