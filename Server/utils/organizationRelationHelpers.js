export const normalizeIdList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item > 0);
  }

  if (value === null || value === undefined || value === "") {
    return [];
  }

  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? [value] : [];
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    if (trimmed.includes(",")) {
      return trimmed
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isInteger(item) && item > 0);
    }

    const parsed = Number(trimmed);
    return Number.isInteger(parsed) && parsed > 0 ? [parsed] : [];
  }

  return [];
};

export const getFirstId = (value) => normalizeIdList(value)[0] ?? null;
