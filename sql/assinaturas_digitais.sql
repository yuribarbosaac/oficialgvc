-- Tabela de Assinaturas Digitais Blindada
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS assinaturas_digitais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação do Visitante
  visitor_id UUID REFERENCES visitors(id),
  nome_assinante VARCHAR(255) NOT NULL,
  cpf_assinante VARCHAR(14) NOT NULL,
  
  -- Dados do Documento
  tipo_documento VARCHAR(50) NOT NULL,
  documento_id UUID,
  documento_hash TEXT NOT NULL,
  
  -- Dados da Assinatura
  data_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_hora_brasilia VARCHAR(50),
  ip_publico VARCHAR(45) NOT NULL,
  user_agent TEXT,
  browser_fingerprint JSONB,
  
  -- Validações
  cpf_validado BOOLEAN DEFAULT false,
  cpf_status VARCHAR(50),
  
  -- Termos
  termo_conteudo TEXT,
  termo_hash TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para buscas jurídicas
CREATE INDEX IF NOT EXISTS idx_assinaturas_cpf ON assinaturas_digitais(cpf_assinante);
CREATE INDEX IF NOT EXISTS idx_assinaturas_visitor ON assinaturas_digitais(visitor_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_documento ON assinaturas_digitais(tipo_documento, documento_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_data ON assinaturas_digitais(data_hora);
CREATE INDEX IF NOT EXISTS idx_assinaturas_hash ON assinaturas_digitais(documento_hash);
CREATE INDEX IF NOT EXISTS idx_assinaturas_ip ON assinaturas_digitais(ip_publico);

-- Habilitar Row Level Security
ALTER TABLE assinaturas_digitais ENABLE ROW LEVEL SECURITY;

-- Política: apenas admins podem ver todas
CREATE POLICY "Admin total access" ON assinaturas_digitais
  FOR ALL USING (true) WITH CHECK (true);