-- ====================================================================
-- BACKUP COMPLETO - GVC SUPABASE
-- Data: 2026-05-07
-- ====================================================================

-- ====================================================================
-- PARTE 1: ESTRUTURA (Tabelas, Funções, Triggers, RLS)
-- Copie o conteúdo de MIGRATION_COMPLETE.sql e execute
-- ====================================================================

-- ====================================================================
-- PARTE 2: DADOS ATuais
-- ====================================================================

-- ESPAÇOS
INSERT INTO espacos (id, nome, municipio, perfil_armarios, perfil_telecentro, perfil_agendamento, ativo) VALUES
('315c0b2f-8e6b-4148-b21c-2123cbdec803', 'BPE ADONAY BARBOSA', 'Rio Branco', true, true, true, true),
('1dfc77aa-8ad0-4307-a14c-e6428430d36d', 'MUSEU DOS POVOS ACREANOS', 'Rio Branco', true, false, true, true),
('69624d99-e661-4906-848e-18c0f28b8bf9', 'BPE DA FLORESTA', 'Rio Branco', true, true, true, true);

-- AGENDAMENTOS
INSERT INTO agendamentos (id, espaco_id, solicitante_nome, solicitante_email, status, data_pretendida, created_at) VALUES
('4f099b0d-7460-4a48-8a5d-c54f8e708a14', '1dfc77aa-8ad0-4307-a14c-e6428430d36d', 'teste', 'teste@exemplo.com', 'aprovado', '2026-05-08', '2026-05-04 20:00:02.490633+00'),
('ad49c4b0-2ef7-46cf-8647-82209ecee979', '1dfc77aa-8ad0-4307-a14c-e6428430d36d', 'teste', 'teste@exemplo.com', 'rejeitado', '2026-05-08', '2026-05-04 20:05:41.388563+00'),
('a96180de-97b5-4c70-ac4f-d9bcfc9cd13c', '1dfc77aa-8ad0-4307-a14c-e6428430d36d', 'teste', 'teste@exemplo.com', 'aprovado', '2026-05-07', '2026-05-04 20:15:03.892221+00'),
('0b5698d3-2b8b-4b08-a336-aecff8e1d8ef', '1dfc77aa-8ad0-4307-a14c-e6428430d36d', 'teste', 'teste@exemplo.com', 'pendente', '2026-05-08', '2026-05-06 21:51:30.993284+00');

-- ====================================================================
-- FIM DO BACKUP
-- Para restaurar: execute MIGRATION_COMPLETE.sql + este arquivo
-- ====================================================================