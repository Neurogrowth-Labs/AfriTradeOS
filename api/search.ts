import { validateSearchQuery } from '../lib/validateSearchQuery';

/**
 * Safe search API — JSON only, no shell/OS execution.
 * Replaces any unsafe handler that might interpret `q` as a system command.
 */
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405, headers: { Allow: 'GET' } }
    );
  }

  const url = new URL(request.url);
  const validation = validateSearchQuery(url.searchParams.get('q'));

  if (validation.ok === false) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const query = validation.value;

  // Parameterized data access only — extend with Supabase .ilike() using `query`, never string exec.
  return Response.json(
    {
      query,
      results: [],
      message: query ? 'No matches' : 'Provide ?q= search term',
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  );
}
