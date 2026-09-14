import { describe, expect, it } from 'vitest';
import { validateSearchQuery } from '../../lib/validateSearchQuery';

describe('validateSearchQuery', () => {
  it('accepts and normalizes supported search terms', () => {
    expect(validateSearchQuery(' cocoa%20beans ')).toEqual({ ok: true, value: 'cocoa beans' });
    expect(validateSearchQuery('Côte-d-Ivoire')).toEqual({ ok: true, value: 'Côte-d-Ivoire' });
  });

  it('rejects encoded command-injection payloads', () => {
    expect(validateSearchQuery('%2524%2528curl%2520example.com%2529')).toEqual({
      ok: false,
      error: 'Invalid search query',
    });
    expect(validateSearchQuery('coffee; rm -rf /')).toEqual({
      ok: false,
      error: 'Invalid search query',
    });
  });

  it('rejects malformed, unsupported, and oversized values', () => {
    expect(validateSearchQuery(['cocoa'])).toEqual({ ok: false, error: 'Invalid search query' });
    expect(validateSearchQuery('coffee@market')).toEqual({ ok: false, error: 'Invalid search query' });
    expect(validateSearchQuery('a'.repeat(101))).toEqual({
      ok: false,
      error: 'Search query too long',
    });
  });
});
