-- ====================================================================
-- SCRIPT DE EXPORTAÇÃO DE DADOS - SUPABASE GVC
-- ====================================================================
-- Execute este script no SQL Editor do Supabase atual (Produção)
-- Copie os resultados de cada SELECT e salve como dados.sql
-- ====================================================================

-- ====================================================================
-- 1. ESPACOS (execute primeiro --dependências)
-- ====================================================================
SELECT 
    id, nome, email, endereco, municipio, horario_funcionamento,
    capacidade_visitantes, mensagem_boas_vindas, tempo_limite_excedido,
    ativo, perfil_armarios, perfil_telecentro, perfil_agendamento,
    total_armarios, total_computadores, tempo_limite_computador,
    capacidade_agendamento, has_auditorio, qtd_auditorio,
    has_sala_estudos, qtd_sala_estudos, has_teatro, qtd_teatro,
    has_filmoteca, qtd_filmoteca, has_espaco_aberto, qtd_espaco_aberto,
    has_visita_guiada, qtd_visita_guiada
FROM espacos;

-- ====================================================================
-- 2. USUARIOS
-- ====================================================================
SELECT 
    id, auth_uid, nome, email, perfil, espaco_id, espaco_nome, ativo
FROM usuarios;

-- ====================================================================
-- 3. VISITORS
-- ====================================================================
SELECT 
    id, full_name, cpf, passport, is_foreigner, gender, birth_date,
    email, phone, address, category, photo_url
FROM visitors;

-- ====================================================================
-- 4. VISITS (pode ser grande, filtre por data se necessário)
-- ====================================================================
-- Por padrão, últimos 30 dias. Ajuste conforme necessário:
SELECT 
    id, visitor_id, nome, perfil, local, espaco_id, checkin, checkout, status, armario
FROM visits 
WHERE checkin >= NOW() - INTERVAL '30 days';

-- ====================================================================
-- 5. LOCKERS
-- ====================================================================
SELECT 
    id, number, status, visitor_id, visitor_name, espaco_id
FROM lockers;

-- ====================================================================
-- 6. COMPUTADORES
-- ====================================================================
SELECT 
    id, numero, status, usuario_id, usuario_nome, espaco_id, espaco_nome
FROM computadores;

-- ====================================================================
-- 7. CONFIGURACOES
-- ====================================================================
SELECT 
    id, institution_name, data
FROM configuracoes;

-- ====================================================================
-- 8. AGENDAMENTOS (ativos e recentes)
-- ====================================================================
SELECT 
    id, espaco_id, solicitante_nome, solicitante_email, solicitante_telefone,
    solicitante_documento, tipo_solicitante, tipo_espaco, espaco_solicitado,
    data_pretendida, horario_inicio, horario_fim, numero_participantes,
    descricao_evento, natureza_evento, gratuito, valor_ingresso, status,
    termo_aceito, resposta_coordenador, coordenador_id, respondido_em,
    created_at, updated_at
FROM agendamentos 
WHERE created_at >= NOW() - INTERVAL '90 days';

-- ====================================================================
-- 9. AUDITORIA (últimos 90 dias)
-- ====================================================================
SELECT 
    id, usuario, perfil, acao, detalhes, entidade_id, created_at
FROM auditoria 
WHERE created_at >= NOW() - INTERVAL '90 days';

-- ====================================================================
-- 10. ASSINATURAS DIGITAIS
-- ====================================================================
SELECT 
    id, visitor_id, nome_assinante, cpf_assinante, tipo_documento,
    documento_id, documento_hash, data_hora, ip_publico,
    cpf_validado, cpf_status, termo_hash
FROM assinaturas_digitais
WHERE data_hora >= NOW() - INTERVAL '90 days';

-- ====================================================================
-- INSTRUÇÕES DE IMPORTAÇÃO
-- ====================================================================
-- Após exportar, você terá os resultados dos SELECT.
-- Para importar no banco destino, use INSERT:
--
-- INSERT INTO espacos (id, nome, ...) VALUES
-- ('uuid-1', 'Nome do Espaço', ...),
-- ('uuid-2', 'Outro Espaço', ...);
--
-- Ou use COPY se preferir:
-- COPY espacos FROM '/caminho/arquivo.csv' WITH (FORMAT csv, HEADER);
--
-- Importar na ordem:
-- 1. espacos (sem dependências)
-- 2. usuarios (depends on auth.users - pode pular)
-- 3. visitors (tabela base)
-- 4. lockers, computadores (depends on espacos, visitors)
-- 5. visits (depends on visitors, espacos)
-- 6. agendamentos (depends on espacos)
-- 7. auditoria, assinaturas_digitais
-- ====================================================================