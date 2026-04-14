// CF Pages Function: GET /api/symbols
// Query params: ?category=HVAC&subcategory=Equipment&search=chiller

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const category    = url.searchParams.get('category');
  const subcategory = url.searchParams.get('subcategory');
  const search      = url.searchParams.get('search');
  const id          = url.searchParams.get('id');

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=3600',
  };

  // Single symbol by ID
  if (id) {
    const row = await env.DB.prepare('SELECT * FROM symbols WHERE id = ?').bind(id).first();
    if (!row) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers });
    return new Response(JSON.stringify(row), { headers });
  }

  // Build query
  let sql = 'SELECT * FROM symbols';
  const conditions: string[] = [];
  const params: string[] = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (subcategory) {
    conditions.push('subcategory = ?');
    params.push(subcategory);
  }
  if (search) {
    conditions.push('(name LIKE ? OR keywords LIKE ? OR tag_prefix LIKE ?)');
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY category, subcategory, name';

  const stmt = env.DB.prepare(sql);
  const result = await (params.length > 0 ? stmt.bind(...params) : stmt).all();

  return new Response(JSON.stringify({
    symbols: result.results,
    count: result.results.length,
  }), { headers });
};
