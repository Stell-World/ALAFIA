CREATE TABLE IF NOT EXISTS patient_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(64) NOT NULL,
  location VARCHAR(180),
  reason VARCHAR(300) NOT NULL,
  reminder_channels TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS patient_appointments_owner_time_idx
  ON patient_appointments (user_id, starts_at, id);
