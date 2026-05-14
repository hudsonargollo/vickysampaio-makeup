-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id          TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_id  TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_price INTEGER NOT NULL,
  service_duration INTEGER NOT NULL,
  date        TEXT NOT NULL,   -- "2024-05-14"
  time        TEXT NOT NULL,   -- "10:00"
  status      TEXT NOT NULL DEFAULT 'pending',  -- pending | confirmed | done | cancelled
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Blocked slots (manually blocked by admin)
CREATE TABLE IF NOT EXISTS blocked_slots (
  id    TEXT PRIMARY KEY,
  date  TEXT NOT NULL,
  time  TEXT NOT NULL,
  UNIQUE(date, time)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments(client_phone);
