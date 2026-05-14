const BASE = 'https://vickysampaio-api.hudsonargollo2.workers.dev/api';

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  service_id: string;
  service_name: string;
  service_price: number;
  service_duration: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'done' | 'cancelled';
  created_at: string;
}

export interface BookingPayload {
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  date: string;
  time: string;
}

// Format a Date to YYYY-MM-DD
export function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

// Get the next N working dates starting from today
export function getUpcomingDates(n = 4): { label: string; value: string }[] {
  const dates: { label: string; value: string }[] = [];
  const d = new Date();
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  let added = 0;
  let offset = 0;

  while (added < n) {
    const date = new Date(d);
    date.setDate(d.getDate() + offset);
    const dow = date.getDay();
    // Skip Sundays (0)
    if (dow !== 0) {
      const isToday = offset === 0;
      const isTomorrow = offset === 1;
      const label = isToday
        ? 'Hoje'
        : isTomorrow
        ? 'Amanhã'
        : `${dayNames[dow]} ${date.getDate()}`;
      dates.push({ label, value: formatDate(date) });
      added++;
    }
    offset++;
  }
  return dates;
}

// ── API calls ──────────────────────────────────────────────────────────────

export async function fetchSlots(date: string): Promise<TimeSlot[]> {
  const res = await fetch(`${BASE}/slots?date=${date}`);
  if (!res.ok) throw new Error('Failed to fetch slots');
  return res.json();
}

export async function createAppointment(payload: BookingPayload): Promise<{ id: string; status: string }> {
  const res = await fetch(`${BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json() as { error: string };
    throw new Error(err.error ?? 'Booking failed');
  }
  return res.json();
}

export async function fetchAppointments(params?: { date?: string; status?: string }): Promise<Appointment[]> {
  const qs = new URLSearchParams();
  if (params?.date) qs.set('date', params.date);
  if (params?.status) qs.set('status', params.status);
  const res = await fetch(`${BASE}/appointments?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
}

export async function updateAppointmentStatus(id: string, status: string): Promise<void> {
  const res = await fetch(`${BASE}/appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update appointment');
}

export async function fetchClientVisits(phone: string): Promise<number> {
  const res = await fetch(`${BASE}/client/${encodeURIComponent(phone)}`);
  if (!res.ok) return 0;
  const data = await res.json() as { visits: number };
  return data.visits;
}

export async function blockSlot(date: string, time: string): Promise<void> {
  await fetch(`${BASE}/slots/block`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, time }),
  });
}

export async function unblockSlot(date: string, time: string): Promise<void> {
  await fetch(`${BASE}/slots/block`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, time }),
  });
}
