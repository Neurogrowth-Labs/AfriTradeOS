import { validateSearchQuery } from './lib/validateSearchQuery';
import { checkRateLimit, getClientIp } from './lib/rateLimit';

const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_PER_IP = 30;

export const config = {
  matcher: ['/api/search', '/api/auth/login'],
};

export default function middleware(request: Request): Response | Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === '/api/auth/login' && request.method === 'POST') {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`auth-mw:ip:${ip}`, AUTH_MAX_PER_IP, AUTH_WINDOW_MS);
    if (limit.allowed === false) {
      return Response.json(
        { error: 'Too many authentication attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limit.retryAfterSec),
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      );
    }
    return fetch(request);
  }

  if (url.pathname === '/api/search') {
    const validation = validateSearchQuery(url.searchParams.get('q'));
    if (validation.ok === false) {
      return Response.json(
        { error: validation.error },
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      );
    }
  }

  return fetch(request);
}
