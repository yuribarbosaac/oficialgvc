-- =====================================================
-- ADICIONAR CAMPOS DO TERMO DE COMPROMISSO
-- Portaria nº 169/2023
-- =====================================================

-- Campos para o Termo de Compromisso Digital
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS termo_compromisso_assinado BOOLEAN DEFAULT false;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS termo_compromisso_data TIMESTAMP;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS termo_compromisso_ip TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS razao_social TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS nome_instituicao TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS secretaria_governo TEXT;
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS unidade_governo TEXT;

-- =====================================================
-- TABELA: agendamentos_rascunho
-- Para persistência de rascunhos no banco de dados
-- =====================================================
CREATE TABLE IF NOT EXISTS agendamentos_rascunho (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  
  -- Dados do Solicitante
  solicitante_nome TEXT,
  solicitante_email TEXT,
  solicitante_telefone TEXT,
  solicitante_documento TEXT,
  tipo_solicitante TEXT,
  razao_social TEXT,
  nome_instituicao TEXT,
  secretaria_governo TEXT,
  unidade_governo TEXT,
  
  -- Dados do Agendamento
  espaco_id UUID,
  tipo_espaco TEXT,
  espaco_solicitado TEXT,
  data_pretendida TEXT,
  horario_inicio TEXT,
  horario_fim TEXT,
  numero_participantes INTEGER,
  
  -- Detalhes do Evento
  descricao_evento TEXT,
  natureza_evento TEXT,
  gratuito BOOLEAN DEFAULT true,
  valor_ingresso TEXT,
  necessita_equipamentos TEXT,
  observacoes TEXT,
  
  -- Termos
  termo_aceito BOOLEAN DEFAULT false,
  responsabhilidade_evento BOOLEAN DEFAULT false,
  danos_patrimonio BOOLEAN DEFAULT false,
  respeito_lotacao BOOLEAN DEFAULT false,
  autorizo_divulgacao BOOLEAN DEFAULT false,
  
  -- Termo de Compromisso Digital
  termo_compromisso_assinado BOOLEAN DEFAULT false,
  termo_compromisso_data TIMESTAMP,
  termo_compromisso_ip TEXT,
  
  -- Controle
  current_step INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_rascunho_session_id ON agendamentos_rascunho(session_id);
CREATE INDEX IF NOT EXISTS idx_rascunho_updated_at ON agendamentos_rascunho(updated_at DESC);

-- =====================================================
-- RLS para rascunhos
-- =====================================================
ALTER TABLE agendamentos_rascunho ENABLE ROW LEVEL SECURITY;

-- Policy: Qualquer um pode criar/ver seu próprio rascunho via session_id
CREATE POLICY "rascunho_own_session" ON agendamentos_rascunho FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- FUNÇÃO: buscar rascunho por session_id
-- =====================================================
CREATE OR REPLACE FUNCTION buscar_rascunho_agendamento(p_session_id TEXT)
RETURNS SETOF agendamentos_rascunho AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM agendamentos_rascunho
  WHERE session_id = p_session_id
  ORDER BY updated_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: salvar ou atualizar rascunho
-- =====================================================
CREATE OR REPLACE FUNCTION salvar_rascunho_agendamento(
  p_session_id TEXT,
  p_dados JSONB
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_existing UUID;
BEGIN
  -- Verificar se já existe rascunho para esta session
  SELECT id INTO v_existing
  FROM agendamentos_rascunho
  WHERE session_id = p_session_id
  ORDER BY updated_at DESC
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    -- Atualizar
    UPDATE agendamentos_rascunho
    SET 
      solicitante_nome = p_dados->>'solicitante_nome',
      solicitante_email = p_dados->>'solicitante_email',
      solicitante_telefone = p_dados->>'solicitante_telefone',
      solicitante_documento = p_dados->>'solicitante_documento',
      tipo_solicitante = p_dados->>'tipo_solicitante',
      razao_social = p_dados->>'razao_social',
      nome_instituicao = p_dados->>'nome_instituicao',
      espaco_id = NULLIF(p_dados->>'espaco_id', '')::UUID,
      tipo_espaco = p_dados->>'tipo_espaco',
      espaco_solicitado = p_dados->>'espaco_solicitado',
      data_pretendida = p_dados->>'data_pretendida',
      horario_inicio = p_dados->>'horario_inicio',
      horario_fim = p_dados->>'horario_fim',
      numero_participantes = (p_dados->>'numero_participantes')::INTEGER,
      descricao_evento = p_dados->>'descricao_evento',
      natureza_evento = p_dados->>'natureza_evento',
      gratuito = (p_dados->>'gratuito')::BOOLEAN,
      valor_ingresso = p_dados->>'valor_ingresso',
      necessita_equipamentos = p_dados->>'necessita_equipamentos',
      observacoes = p_dados->>'observacoes',
      termo_aceito = (p_dados->>'termo_aceito')::BOOLEAN,
      responsabhilidade_evento = (p_dados->>'responsabhilidade_evento')::BOOLEAN,
      danos_patrimonio = (p_dados->>'danos_patrimonio')::BOOLEAN,
      respeito_lotacao = (p_dados->>'respeito_lotacao')::BOOLEAN,
      autorizo_divulgacao = (p_dados->>'autorizo_divulgacao')::BOOLEAN,
      termo_compromisso_assinado = (p_dados->>'termo_compromisso_assinado')::BOOLEAN,
      termo_compromisso_data = NULLIF(p_dados->>'termo_compromisso_data', '')::TIMESTAMP,
      termo_compromisso_ip = p_dados->>'termo_compromisso_ip',
      current_step = (p_dados->>'current_step')::INTEGER,
      updated_at = NOW()
    WHERE id = v_existing
    RETURNING id INTO v_id;
  ELSE
    -- Criar novo
    INSERT INTO agendamentos_rascunho (
      session_id,
      solicitante_nome,
      solicitante_email,
      solicitante_telefone,
      solicitante_documento,
      tipo_solicitante,
      razao_social,
      nome_instituicao,
      espaco_id,
      tipo_espaco,
      espaco_solicitado,
      data_pretendida,
      horario_inicio,
      horario_fim,
      numero_participantes,
      descricao_evento,
      natureza_evento,
      gratuito,
      valor_ingresso,
      necessita_equipamentos,
      observacoes,
      termo_aceito,
      responsabhilidade_evento,
      danos_patrimonio,
      respeito_lotacao,
      autorizo_divulgacao,
      termo_compromisso_assinado,
      termo_compromisso_data,
      termo_compromisso_ip,
      current_step
    ) VALUES (
      p_session_id,
      p_dados->>'solicitante_nome',
      p_dados->>'solicitante_email',
      p_dados->>'solicitante_telefone',
      p_dados->>'solicitante_documento',
      p_dados->>'tipo_solicitante',
      p_dados->>'razao_social',
      p_dados->>'nome_instituicao',
      NULLIF(p_dados->>'espaco_id', '')::UUID,
      p_dados->>'tipo_espaco',
      p_dados->>'espaco_solicitado',
      p_dados->>'data_pretendida',
      p_dados->>'horario_inicio',
      p_dados->>'horario_fim',
      (p_dados->>'numero_participantes')::INTEGER,
      p_dados->>'descricao_evento',
      p_dados->>'natureza_evento',
      (p_dados->>'gratuito')::BOOLEAN,
      p_dados->>'valor_ingresso',
      p_dados->>'necessita_equipamentos',
      p_dados->>'observacoes',
      (p_dados->>'termo_aceito')::BOOLEAN,
      (p_dados->>'responsabhilidade_evento')::BOOLEAN,
      (p_dados->>'danos_patrimonio')::BOOLEAN,
      (p_dados->>'respeito_lotacao')::BOOLEAN,
      (p_dados->>'autorizo_divulgacao')::BOOLEAN,
      (p_dados->>'termo_compromisso_assinado')::BOOLEAN,
      NULLIF(p_dados->>'termo_compromisso_data', '')::TIMESTAMP,
      p_dados->>'termo_compromisso_ip',
      (p_dados->>'current_step')::INTEGER
    )
    RETURNING id INTO v_id;
  END IF;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: limpar rascunho após confirmação
-- =====================================================
CREATE OR REPLACE FUNCTION limpar_rascunho_agendamento(p_session_id TEXT)
RETURNS VOID AS $$
BEGIN
  DELETE FROM agendamentos_rascunho
  WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;