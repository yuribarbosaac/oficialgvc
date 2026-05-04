import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  User,
  MapPin,
  Clock,
  FileText,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Building,
  Users,
  AlertCircle,
  Upload,
  Mail,
  Phone,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { spaceService, Space } from '../../services/spaceService';
import { useCreateAgendamento } from '../../hooks/useAgendamentos';
import { usePublicAuth } from '../../contexts/PublicAuthContext';

interface FormData {
  solicitante_nome: string;
  solicitante_email: string;
  solicitante_telefone: string;
  solicitante_documento: string;
  tipo_solicitante: string;
  espaco_id: string;
  tipo_espaco: string;
  espaco_solicitado: string;
  data_pretendida: string;
  horario_inicio: string;
  horario_fim: string;
  numero_participantes: number;
  descricao_evento: string;
  natureza_evento: string;
  gratuito: boolean;
  valor_ingresso: string;
  necessita_equipamentos: string;
  observacoes: string;
  termo_aceito: boolean;
  responsabhilidade_evento: boolean;
  danos_patrimonio: boolean;
  respeito_lotacao: boolean;
  autorizo_divulgacao: boolean;
}

const initialFormData: FormData = {
  solicitante_nome: '',
  solicitante_email: '',
  solicitante_telefone: '',
  solicitante_documento: '',
  tipo_solicitante: 'pessoa_fisica',
  espaco_id: '',
  tipo_espaco: '',
  espaco_solicitado: '',
  data_pretendida: '',
  horario_inicio: '',
  horario_fim: '',
  numero_participantes: 0,
  descricao_evento: '',
  natureza_evento: 'cultural',
  gratuito: true,
  valor_ingresso: '',
  necessita_equipamentos: '',
  observacoes: '',
  termo_aceito: false,
  responsabhilidade_evento: false,
  danos_patrimonio: false,
  respeito_lotacao: false,
  autorizo_divulgacao: false,
};

const steps = [
  { id: 1, title: 'Dados Pessoais', icon: User },
  { id: 2, title: 'Espaço', icon: MapPin },
  { id: 3, title: 'Data e Hora', icon: Clock },
  { id: 4, title: 'Evento', icon: FileText },
  { id: 5, title: 'Termos', icon: CheckCircle },
  { id: 6, title: 'Confirmação', icon: CheckCircle },
];

const tipoEspacos = [
  { value: 'auditorio', label: 'Auditório', minParticipantes: 20 },
  { value: 'sala_reuniao', label: 'Sala de Reunião', minParticipantes: 5 },
  { value: 'area_externa', label: 'Área Externa', minParticipantes: 10 },
  { value: 'visita_guiada', label: 'Visita Guiada', minParticipantes: 15 },
  { value: 'outro', label: 'Outro', minParticipantes: 1 },
];

const naturezaOptions = [
  { value: 'cultural', label: 'Cultural' },
  { value: 'educacional', label: 'Educacional' },
  { value: 'corporativo', label: 'Corporativo' },
  { value: 'comunitario', label: 'Comunitário' },
  { value: 'outro', label: 'Outro' },
];

const tipoSolicitanteOptions = [
  { value: 'pessoa_fisica', label: 'Pessoa Física' },
  { value: 'escola', label: 'Escola' },
  { value: 'universidade', label: 'Universidade' },
  { value: 'ong', label: 'ONG' },
  { value: 'empresa', label: 'Empresa' },
];

export default function AgendamentoPublico() {
  const navigate = useNavigate();
  const { user: publicUser, logout } = usePublicAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflitos, setConflitos] = useState<any[]>([]);
  const [checkingConflict, setCheckingConflict] = useState(false);

  useEffect(() => {
    if (!publicUser) {
      navigate('/login-publico', { replace: true });
    }
  }, [publicUser, navigate]);

  const { create, loading: creating } = useCreateAgendamento();

  useEffect(() => {
    const loadSpaces = async () => {
      const { data } = await spaceService.list();
      if (data) {
        setSpaces(data.filter((s) => s.perfil_agendamento));
      }
      setLoadingSpaces(false);
    };
    loadSpaces();
  }, []);

  useEffect(() => {
    if (publicUser) {
      setFormData((prev) => ({
        ...prev,
        solicitante_nome: publicUser.nome || prev.solicitante_nome,
        solicitante_email: publicUser.email || prev.solicitante_email,
        solicitante_telefone: publicUser.telefone || prev.solicitante_telefone,
      }));
    }
  }, [publicUser]);

  useEffect(() => {
    if (formData.espaco_id && formData.data_pretendida && formData.horario_inicio && formData.horario_fim) {
      checkConflitos();
    }
  }, [formData.espaco_id, formData.data_pretendida, formData.horario_inicio, formData.horario_fim]);

  const checkConflitos = async () => {
    setCheckingConflict(true);
    const { data } = await supabase
      .from('agendamentos')
      .select('id, horario_inicio, horario_fim, espaco_solicitado')
      .eq('espaco_id', formData.espaco_id)
      .eq('data_pretendida', formData.data_pretendida)
      .neq('status', 'rejeitado')
      .neq('status', 'cancelado')
      .or(`horario_inicio.lt.${formData.horario_fim},horario_fim.gt.${formData.horario_inicio}`);

    setConflitos(data || []);
    setCheckingConflict(false);
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return (
          formData.solicitante_nome.trim() !== '' &&
          formData.solicitante_email.trim() !== '' &&
          formData.solicitante_telefone.trim() !== '' &&
          formData.tipo_solicitante !== ''
        );
      case 2:
        return formData.espaco_id !== '' && formData.tipo_espaco !== '';
      case 3:
        return (
          formData.data_pretendida !== '' &&
          formData.horario_inicio !== '' &&
          formData.horario_fim !== '' &&
          formData.numero_participantes > 0 &&
          conflitos.length === 0
        );
      case 4:
        return (
          formData.natureza_evento !== '' &&
          formData.descricao_evento.trim() !== ''
        );
      case 5:
        return (
          formData.termo_aceito &&
          formData.responsabhilidade_evento &&
          formData.danos_patrimonio &&
          formData.respeito_lotacao
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const selectedSpace = spaces.find((s) => s.id === formData.espaco_id);

    const agendamento = {
      ...formData,
      espaco_solicitado: selectedSpace?.nome || formData.espaco_solicitado,
      valor_ingresso: formData.gratuito ? null : parseFloat(formData.valor_ingresso) || null,
    };

    const { data, error: createError } = await create(agendamento);

    if (createError) {
      setError(createError);
      setLoading(false);
      return;
    }

    if (data) {
      try {
        await supabase.functions.invoke('send-agendamento-email', {
          body: JSON.stringify({
            tipo: 'confirmacao',
            email_destino: formData.solicitante_email,
            nome_destino: formData.solicitante_nome,
            agendamento_id: data.id,
            dados: {
              espaco: selectedSpace?.nome,
              data: new Date(formData.data_pretendida).toLocaleDateString('pt-BR'),
              horario: `${formData.horario_inicio.slice(0, 5)} - ${formData.horario_fim.slice(0, 5)}`,
            },
          }),
        });
      } catch (e) {
        console.error('Erro ao enviar email:', e);
      }
    }

    setSuccess(true);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-4">
            Solicitação Enviada!
          </h1>
          <p className="text-slate-600 mb-6">
            Sua solicitação de agendamento foi recebida com sucesso. Você receberá uma resposta em até <strong>3 dias úteis</strong> no email cadastrado.
          </p>
          <div className="bg-slate-50 rounded-2xl p-4 text-left">
            <h3 className="font-semibold text-slate-900 mb-2">Resumo</h3>
            <p className="text-sm text-slate-600">
              <strong>Espaço:</strong> {spaces.find((s) => s.id === formData.espaco_id)?.nome}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Data:</strong> {formatDate(formData.data_pretendida)}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Horário:</strong> {formData.horario_inicio.slice(0, 5)} - {formData.horario_fim.slice(0, 5)}
            </p>
          </div>
          <button
            onClick={() => {
              setSuccess(false);
              setFormData(initialFormData);
              setCurrentStep(1);
            }}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Nova Solicitação
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl">
              <CalendarDays size={28} />
            </div>
            <h1 className="text-4xl font-display font-bold text-slate-900">
              Agendamento de Espaços
            </h1>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Solicite o uso de auditórios, salas de reunião, áreas externas e visitas guiadas nos espaços culturais da FEM.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isActive
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Dados do Solicitante</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={formData.solicitante_nome}
                        onChange={(e) => updateFormData('solicitante_nome', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Seu nome completo"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      E-mail *
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={formData.solicitante_email}
                        onChange={(e) => updateFormData('solicitante_email', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Telefone *
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={formData.solicitante_telefone}
                        onChange={(e) => updateFormData('solicitante_telefone', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      CPF ou CNPJ
                    </label>
                    <input
                      type="text"
                      value={formData.solicitante_documento}
                      onChange={(e) => updateFormData('solicitante_documento', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de Solicitante *
                    </label>
                    <select
                      value={formData.tipo_solicitante}
                      onChange={(e) => updateFormData('tipo_solicitante', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {tipoSolicitanteOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Escolha do Espaço</h2>
                {loadingSpaces ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : spaces.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">Nenhum espaço disponível para agendamento no momento.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Espaço Cultural *
                      </label>
                      <select
                        value={formData.espaco_id}
                        onChange={(e) => {
                          updateFormData('espaco_id', e.target.value);
                          updateFormData('tipo_espaco', '');
                        }}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Selecione um espaço</option>
                        {spaces.map((space) => (
                          <option key={space.id} value={space.id}>
                            {space.nome}
                          </option>
                        ))}
                      </select>
                      {formData.espaco_id && (
                        <div className="mt-3 p-4 bg-slate-50 rounded-xl">
                          <p className="text-sm text-slate-600">
                            <strong>Endereço:</strong> {spaces.find((s) => s.id === formData.espaco_id)?.endereco || 'Não informado'}
                          </p>
                          {spaces.find((s) => s.id === formData.espaco_id)?.horario_funcionamento && (
                            <p className="text-sm text-slate-600 mt-1">
                              <strong>Funcionamento:</strong> {spaces.find((s) => s.id === formData.espaco_id)?.horario_funcionamento}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tipo de Espaço *
                      </label>
                      <select
                        value={formData.tipo_espaco}
                        onChange={(e) => updateFormData('tipo_espaco', e.target.value)}
                        disabled={!formData.espaco_id}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        <option value="">Selecione o tipo</option>
                        {tipoEspacos.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label} (mín. {opt.minParticipantes} pessoas)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Data e Horário</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Data Pretendida *
                    </label>
                    <input
                      type="date"
                      value={formData.data_pretendida}
                      onChange={(e) => updateFormData('data_pretendida', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Número de Participantes *
                    </label>
                    <div className="relative">
                      <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        value={formData.numero_participantes || ''}
                        onChange={(e) => updateFormData('numero_participantes', parseInt(e.target.value) || 0)}
                        min={1}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Quantidade de pessoas"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Horário de Início *
                    </label>
                    <input
                      type="time"
                      value={formData.horario_inicio}
                      onChange={(e) => updateFormData('horario_inicio', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Horário de Término *
                    </label>
                    <input
                      type="time"
                      value={formData.horario_fim}
                      onChange={(e) => updateFormData('horario_fim', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                {conflitos.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="font-medium text-red-700 mb-2">Conflitos detectados!</p>
                    <p className="text-sm text-red-600">
                      Já existe agendamento para este horário: {conflitos[0].espaco_solicitado} (
                      {conflitos[0].horario_inicio?.slice(0, 5)} - {conflitos[0].horario_fim?.slice(0, 5)})
                    </p>
                  </div>
                )}
                {checkingConflict && (
                  <div className="text-sm text-slate-500">Verificando disponibilidade...</div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Detalhes do Evento</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Natureza do Evento *
                    </label>
                    <select
                      value={formData.natureza_evento}
                      onChange={(e) => updateFormData('natureza_evento', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {naturezaOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      O evento é gratuito? *
                    </label>
                    <select
                      value={formData.gratuito ? 'true' : 'false'}
                      onChange={(e) => updateFormData('gratuito', e.target.value === 'true')}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="true">Sim, gratuito</option>
                      <option value="false">Não, tem ingresso</option>
                    </select>
                  </div>
                  {!formData.gratuito && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Valor do Ingresso (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.valor_ingresso}
                        onChange={(e) => updateFormData('valor_ingresso', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="0,00"
                      />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Descrição do Evento *
                    </label>
                    <textarea
                      value={formData.descricao_evento}
                      onChange={(e) => updateFormData('descricao_evento', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Descreva o evento que será realizado..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Necessita de Equipamentos?
                    </label>
                    <textarea
                      value={formData.necessita_equipamentos}
                      onChange={(e) => updateFormData('necessita_equipamentos', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ex: projetor, som, cadeiras extras..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Observações Adicionais
                    </label>
                    <textarea
                      value={formData.observacoes}
                      onChange={(e) => updateFormData('observacoes', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Outras informações relevantes..."
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Termos e Condições</h2>
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Portaria nº 169/2023 - FEM</h3>
                  <div className="text-sm text-slate-600 space-y-3">
                    <p>
                      <strong>1.</strong> O uso dos espaços públicos culturais é regido pela Portaria nº 169/2023 da Fundação de Cultura Elias Mansour (FEM).
                    </p>
                    <p>
                      <strong>2.</strong> O solicitante é responsável pela organização e realização do evento, incluindo segurança e produção.
                    </p>
                    <p>
                      <strong>3.</strong> O solicitante responsabiliza-se por quaisquer danos ao patrimônio durante a realização do evento.
                    </p>
                    <p>
                      <strong>4.</strong> O número de participantes não pode exceder a lotação máxima do espaço solicitado.
                    </p>
                    <p>
                      <strong>5.</strong> A FEM pode solicitar documentos complementares e visitas técnicas antes da aprovação.
                    </p>
                    <p>
                      <strong>6.</strong> O prazo para resposta é de até 3 dias úteis após a submissão da solicitação.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.termo_aceito}
                      onChange={(e) => updateFormData('termo_aceito', e.target.checked)}
                      className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">
                      Declaro que li e aceito os termos da Portaria nº 169/2023 *
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.responsabhilidade_evento}
                      onChange={(e) => updateFormData('responsabhilidade_evento', e.target.checked)}
                      className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">
                      Responsabilizo-me pela segurança e produção do evento *
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.danos_patrimonio}
                      onChange={(e) => updateFormData('danos_patrimonio', e.target.checked)}
                      className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">
                      Responsabilizo-me por eventuais danos ao patrimônio *
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.respeito_lotacao}
                      onChange={(e) => updateFormData('respeito_lotacao', e.target.checked)}
                      className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">
                      Comprometo-me a respeitar a lotação máxima do espaço *
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.autorizo_divulgacao}
                      onChange={(e) => updateFormData('autorizo_divulgacao', e.target.checked)}
                      className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">
                      Autorizo a divulgação do evento com as marcas do Governo do Estado e FEM (opcional)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Confirmação</h2>
                <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                  <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-2">Dados do Solicitante</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><strong>Nome:</strong> {formData.solicitante_nome}</p>
                    <p><strong>E-mail:</strong> {formData.solicitante_email}</p>
                    <p><strong>Telefone:</strong> {formData.solicitante_telefone}</p>
                    <p><strong>Tipo:</strong> {tipoSolicitanteOptions.find((o) => o.value === formData.tipo_solicitante)?.label}</p>
                  </div>

                  <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-2 pt-2">Espaço</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><strong>Espaço:</strong> {spaces.find((s) => s.id === formData.espaco_id)?.nome}</p>
                    <p><strong>Tipo:</strong> {tipoEspacos.find((e) => e.value === formData.tipo_espaco)?.label}</p>
                  </div>

                  <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-2 pt-2">Data e Participantes</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><strong>Data:</strong> {formatDate(formData.data_pretendida)}</p>
                    <p><strong>Horário:</strong> {formData.horario_inicio?.slice(0, 5)} - {formData.horario_fim?.slice(0, 5)}</p>
                    <p><strong>Participantes:</strong> {formData.numero_participantes}</p>
                    <p><strong>Natureza:</strong> {naturezaOptions.find((n) => n.value === formData.natureza_evento)?.label}</p>
                  </div>

                  <h3 className="font-semibold text-slate-900 border-b border-slate-200 pb-2 pt-2">Evento</h3>
                  <div className="text-sm">
                    <p><strong>Descrição:</strong> {formData.descricao_evento}</p>
                    {formData.necessita_equipamentos && (
                      <p><strong>Equipamentos:</strong> {formData.necessita_equipamentos}</p>
                    )}
                    <p><strong>Valor:</strong> {formData.gratuito ? 'Gratuito' : `R$ ${formData.valor_ingresso}`}</p>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800">
                    <strong>Atenção:</strong> Ao enviar esta solicitação, você concorda com todos os termos da Portaria nº 169/2023. Você receberá uma resposta em até 3 dias úteis.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 px-8 py-6 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
              Voltar
            </button>
            {currentStep < 6 ? (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={!validateStep(currentStep)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || creating}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading || creating ? 'Enviando...' : 'Enviar Solicitação'}
                <CheckCircle size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}