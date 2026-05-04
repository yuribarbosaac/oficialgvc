-- Adicionar campos de auditoria para assinatura digital
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS assinatura_id TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS ip_confirmacao TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Criar índice para auditoria
CREATE INDEX IF NOT EXISTS idx_agendamentos_assinatura_id ON agendamentos(assinatura_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_ip_confirmacao ON agendamentos(ip_confirmacao);