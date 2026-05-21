const FAILURES_KEY = 'afritrade_login_failures';
const LOCKOUT_UNTIL_KEY = 'afritrade_login_lockout_until';

const MAX_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export function getLoginLockoutMessage(): string | null {
  const lockUntil = Number(localStorage.getItem(LOCKOUT_UNTIL_KEY) || 0);
  if (!lockUntil || Date.now() >= lockUntil) {
    if (lockUntil) {
      localStorage.removeItem(LOCKOUT_UNTIL_KEY);
      localStorage.removeItem(FAILURES_KEY);
    }
    return null;
  }

  const minutesLeft = Math.ceil((lockUntil - Date.now()) / 60000);
  return `Too many failed login attempts. Try again in ${minutesLeft} minute(s).`;
}

export function recordLoginFailure(): void {
  const failures = Number(localStorage.getItem(FAILURES_KEY) || 0) + 1;
  localStorage.setItem(FAILURES_KEY, String(failures));

  if (failures >= MAX_FAILURES) {
    localStorage.setItem(LOCKOUT_UNTIL_KEY, String(Date.now() + LOCKOUT_MS));
  }
}

export function clearLoginFailures(): void {
  localStorage.removeItem(FAILURES_KEY);
  localStorage.removeItem(LOCKOUT_UNTIL_KEY);
}
