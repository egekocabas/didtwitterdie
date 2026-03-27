const CUTOFFS_DAYS = {
  "1M": 30,
  "6M": 180,
  "1Y": 365,
  "3Y": 365 * 3,
  "ALL": Infinity,
};

export function filterByRange(data, range) {
  const days = CUTOFFS_DAYS[range] ?? Infinity;
  if (days === Infinity) return data;
  const cutoff = new Date(Date.now() - days * 86400000);
  return data.filter((d) => new Date(d.date) >= cutoff);
}
