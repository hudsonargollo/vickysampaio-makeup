export interface Env {
  DB: D1Database;
  CONFIG: KVNamespace;
  FRONTEND_URL: string;
}

// ── CORS helper ────────────────────────────────────────────────────────────
function cors(env: Env) {
  return {
    'Access-Control-Allow-Origin': env.FRONTEND_URL,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function json(data: unknown, status = 200, env?: Env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(env ? cors(env) : {}),
    },
  });
}

function err(message: string, status = 400, env?: Env) {
  return json({ error: message }, status, env);
}

// ── ID generator ───────────────────────────────────────────────────────────
function uid() {
  return crypto.randomUUID();
}

// ── Router ─────────────────────────────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(env) });
    }

    // ── GET /api/slots?date=2024-05-14 ──────────────────────────────────
    if (method === 'GET' && path === '/api/slots') {
      const date = url.searchParams.get('date');
      if (!date) return err('date required', 400, env);

      // All time slots for the day
      const ALL_SLOTS = [
        '08:00','09:00','10:00','11:00',
        '13:00','14:00','15:00','16:00','17:00','18:00',
      ];

      // Booked slots for this date
      const booked = await env.DB.prepare(
        `SELECT time FROM appointments WHERE date = ? AND status != 'cancelled'`
      ).bind(date).all<{ time: string }>();

      // Manually blocked slots
      const blocked = await env.DB.prepare(
        `SELECT time FROM blocked_slots WHERE date = ?`
      ).bind(date).all<{ time: string }>();

      const unavailable = new Set([
        ...booked.results.map(r => r.time),
        ...blocked.results.map(r => r.time),
      ]);

      const slots = ALL_SLOTS.map((time, i) => ({
        id: `t${i + 1}`,
        time,
        available: !unavailable.has(time),
      }));

      return json(slots, 200, env);
    }

    // ── POST /api/appointments ───────────────────────────────────────────
    if (method === 'POST' && path === '/api/appointments') {
      let body: {
        clientName: string;
        clientPhone: string;
        serviceId: string;
        serviceName: string;
        servicePrice: number;
        serviceDuration: number;
        date: string;
        time: string;
      };

      try {
        body = await request.json();
      } catch {
        return err('Invalid JSON', 400, env);
      }

      const { clientName, clientPhone, serviceId, serviceName, servicePrice, serviceDuration, date, time } = body;

      if (!clientName || !clientPhone || !serviceId || !date || !time) {
        return err('Missing required fields', 400, env);
      }

      // Check slot is still available
      const existing = await env.DB.prepare(
        `SELECT id FROM appointments WHERE date = ? AND time = ? AND status != 'cancelled'`
      ).bind(date, time).first();

      if (existing) return err('Slot no longer available', 409, env);

      const id = uid();
      await env.DB.prepare(
        `INSERT INTO appointments (id, client_name, client_phone, service_id, service_name, service_price, service_duration, date, time, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
      ).bind(id, clientName, clientPhone, serviceId, serviceName, servicePrice, serviceDuration, date, time).run();

      return json({ id, status: 'pending' }, 201, env);
    }

    // ── GET /api/appointments ────────────────────────────────────────────
    // Admin: list all appointments (optionally filter by date or status)
    if (method === 'GET' && path === '/api/appointments') {
      const date = url.searchParams.get('date');
      const status = url.searchParams.get('status');

      let query = `SELECT * FROM appointments WHERE 1=1`;
      const params: string[] = [];

      if (date) { query += ` AND date = ?`; params.push(date); }
      if (status) { query += ` AND status = ?`; params.push(status); }
      query += ` ORDER BY date ASC, time ASC`;

      const result = await env.DB.prepare(query).bind(...params).all();
      return json(result.results, 200, env);
    }

    // ── PATCH /api/appointments/:id ──────────────────────────────────────
    if (method === 'PATCH' && path.startsWith('/api/appointments/')) {
      const id = path.split('/')[3];
      let body: { status: string };

      try {
        body = await request.json();
      } catch {
        return err('Invalid JSON', 400, env);
      }

      const validStatuses = ['pending', 'confirmed', 'done', 'cancelled'];
      if (!validStatuses.includes(body.status)) {
        return err('Invalid status', 400, env);
      }

      const result = await env.DB.prepare(
        `UPDATE appointments SET status = ? WHERE id = ?`
      ).bind(body.status, id).run();

      if (result.meta.changes === 0) return err('Appointment not found', 404, env);
      return json({ id, status: body.status }, 200, env);
    }

    // ── GET /api/appointments/client/:phone ──────────────────────────────
    // Loyalty: count visits by phone number
    if (method === 'GET' && path.startsWith('/api/client/')) {
      const phone = decodeURIComponent(path.split('/')[3]);
      const result = await env.DB.prepare(
        `SELECT COUNT(*) as visits FROM appointments WHERE client_phone = ? AND status = 'done'`
      ).bind(phone).first<{ visits: number }>();

      return json({ phone, visits: result?.visits ?? 0 }, 200, env);
    }

    // ── POST /api/slots/block ────────────────────────────────────────────
    if (method === 'POST' && path === '/api/slots/block') {
      let body: { date: string; time: string };
      try { body = await request.json(); } catch { return err('Invalid JSON', 400, env); }

      await env.DB.prepare(
        `INSERT OR IGNORE INTO blocked_slots (id, date, time) VALUES (?, ?, ?)`
      ).bind(uid(), body.date, body.time).run();

      return json({ blocked: true }, 200, env);
    }

    // ── DELETE /api/slots/block ──────────────────────────────────────────
    if (method === 'DELETE' && path === '/api/slots/block') {
      let body: { date: string; time: string };
      try { body = await request.json(); } catch { return err('Invalid JSON', 400, env); }

      await env.DB.prepare(
        `DELETE FROM blocked_slots WHERE date = ? AND time = ?`
      ).bind(body.date, body.time).run();

      return json({ unblocked: true }, 200, env);
    }

    return err('Not found', 404, env);
  },
};
