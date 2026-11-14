CREATE TABLE IF NOT EXISTS patient_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  value NUMERIC(14, 4) NOT NULL CHECK (value >= 0),
  unit VARCHAR(24) NOT NULL,
  measured_at TIMESTAMPTZ NOT NULL,
  note VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS patient_measurements_owner_date_idx
  ON patient_measurements (user_id, measured_at DESC, id DESC);
