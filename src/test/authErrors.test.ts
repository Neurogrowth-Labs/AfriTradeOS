import { describe, expect, it } from 'vitest';
import { isExistingAccountError } from '../../lib/authErrors';

describe('isExistingAccountError', () => {
  it('identifies only explicit duplicate-account failures', () => {
    expect(isExistingAccountError({ message: 'User already registered' })).toBe(true);
    expect(isExistingAccountError({ message: 'Email already exists' })).toBe(true);
  });

  it('does not mislabel unrelated 422 errors as an existing account', () => {
    expect(isExistingAccountError({ message: 'Redirect URL is not allowed' })).toBe(false);
    expect(isExistingAccountError({ message: 'CAPTCHA verification failed' })).toBe(false);
    expect(isExistingAccountError({})).toBe(false);
  });
});
