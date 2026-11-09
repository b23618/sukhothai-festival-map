// Cloudflare Pages Function: GET returns the visit count, POST adds one. Needs a KV namespace bound as VISITS
// (Pages project > Settings > Bindings). Without the binding it answers { count: null } and the UI hides the counter.
interface KV { get(key: string): Promise<string | null>; put(key: string, value: string): Promise<void> }
const KEY = 'total', json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
export const onRequest = async ({ request, env }: { request: Request; env: { VISITS?: KV } }) => {
  const kv = env.VISITS; if (!kv) return json({ count: null });
  const n = Number(await kv.get(KEY)) || 0;
  if (request.method === 'POST') { await kv.put(KEY, String(n + 1)); return json({ count: n + 1 }); }
  return json({ count: n });
};
