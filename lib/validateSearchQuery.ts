/**
 * Strict allowlist validation for search query parameters.
 * Never pass raw user input to shell, SQL string concat, or system calls.
 */

const MAX_LENGTH = 100;

/** Allowed: letters, numbers, spaces, common punctuation for trade/product search */
const ALLOWED_QUERY = /^[\p{L}\p{N}\s.,\-_]+$/u;

const BLOCKED_SUBSTRINGS = [
  ';',
  '|',
  '&',
  '`',
  '$',
  '(',
  ')',
  '{',
  '}',
  '<',
  '>',
  '\\',
  '\n',
  '\r',
  '\0',
  '%00',
  '$(', 
  '${',
  '||',
  '&&',
];

const BLOCKED_KEYWORDS =
  /\b(sleep|curl|wget|bash|sh|cmd|powershell|exec|eval|system|popen|proc_open|passthru|shell_exec|ping|nc|node|python|php|perl|ruby|java)\b/i;

export type SearchValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

function decodeSafely(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

function containsBlockedContent(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return false;

  for (const token of BLOCKED_SUBSTRINGS) {
    if (normalized.includes(token)) return true;
  }

  if (BLOCKED_KEYWORDS.test(normalized)) return true;

  return false;
}

/**
 * Validates and normalizes a search query from user input.
 */
export function validateSearchQuery(raw: unknown): SearchValidationResult {
  if (raw === undefined || raw === null) {
    return { ok: true, value: '' };
  }

  if (Array.isArray(raw)) {
    return { ok: false, error: 'Invalid search query' };
  }

  if (typeof raw !== 'string') {
    return { ok: false, error: 'Invalid search query' };
  }

  const once = decodeSafely(raw.trim());
  const twice = decodeSafely(once);

  for (const candidate of [raw.trim(), once, twice]) {
    if (candidate.length > MAX_LENGTH) {
      return { ok: false, error: 'Search query too long' };
    }
    if (containsBlockedContent(candidate)) {
      return { ok: false, error: 'Invalid search query' };
    }
  }

  const value = twice;
  if (value && !ALLOWED_QUERY.test(value)) {
    return { ok: false, error: 'Invalid search query' };
  }

  return { ok: true, value };
}
