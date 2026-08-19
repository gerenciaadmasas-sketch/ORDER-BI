-- Tabla para guardar transacciones Wompi pendientes/procesadas
CREATE TABLE IF NOT EXISTS wompi_transacciones_pendientes (
  id                   SERIAL PRIMARY KEY,
  reference            TEXT UNIQUE NOT NULL,
  plan                 TEXT NOT NULL,                   -- chispa / fuego / cosmos
  billing              TEXT NOT NULL DEFAULT 'mensual', -- mensual / anual
  nombre               TEXT,
  apellido             TEXT,
  email                TEXT,
  empresa              TEXT,
  telefono             TEXT,
  cedula               TEXT,
  actividad_economica  TEXT,
  amount_in_cents      INTEGER,
  wompi_transaction_id TEXT,
  estado               TEXT DEFAULT 'pendiente',        -- pendiente / procesado / fallido
  usuario_admin        TEXT,
  password_admin       TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_wompi_reference ON wompi_transacciones_pendientes (reference);
CREATE INDEX IF NOT EXISTS idx_wompi_estado    ON wompi_transacciones_pendientes (estado);

-- RLS: habilitar. La lectura directa de la tabla queda restringida a superadmin.
-- El acceso público (cliente que acaba de pagar) NUNCA lee la tabla directamente:
-- pasa por la función get_onboarding_credentials(reference), que es SECURITY DEFINER
-- y solo devuelve la fila que coincide exactamente con esa referencia.
-- (Antes existía aquí una política "USING (true)" que permitía leer TODA la tabla,
-- incluida password_admin en texto plano, sin autenticarse — fue corregida el 2026-08-19).
ALTER TABLE wompi_transacciones_pendientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wompi_solo_superadmin"
  ON wompi_transacciones_pendientes
  FOR SELECT
  TO public
  USING (es_superadmin());
