export function buildQueryString(obj: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.set(k, v);
  });
  return params.toString();
}

export function parseNum(v?: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}