/**
 * Supabase can use HTTP 422 for several signup failures (for example, an
 * unapproved redirect URL). Only classify errors with an explicit duplicate
 * account message as an existing-account error.
 */
export function isExistingAccountError(error: { message?: unknown }): boolean {
  if (typeof error.message !== 'string') return false;
  return /(?:user|email|account)\s+(?:is\s+)?already\s+(?:registered|exists)/i.test(
    error.message
  );
}
