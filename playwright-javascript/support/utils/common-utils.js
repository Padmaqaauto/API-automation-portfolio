export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function redactSecrets(value) {
  const clone = typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
  const redact = (node) => {
    if (!node || typeof node !== 'object') return;
    for (const key of Object.keys(node)) {
      if (/password|token|authorization|api[_-]?key/i.test(key)) node[key] = '[REDACTED]';
      else redact(node[key]);
    }
  };
  redact(clone);
  return clone;
}

export function normalizeExpectedStatus(value) {
  return Number(value);
}
