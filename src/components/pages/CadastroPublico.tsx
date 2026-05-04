import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Building2, User, Mail, Phone, Lock, AlertCircle, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CadastroForm {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  senha: string;
  confirmarSenha: string;
  tipo: string;
  termos: boolean;
}

const initialFormData: CadastroForm = {
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
  senha: '',
  confirmarSenha: '',
  tipo: 'cidadao',
  termos: false,
};

const tipoOptions = [
  { value: 'cidadao', label: 'Cidadão' },
  { value: 'escola', label: 'Escola' },
  { value: 'universidade', label: 'Universidade' },
  { value: 'ong', label: 'ONG' },
  { value: 'empresa', label: 'Empresa' },
];

export default function CadastroPublico() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CadastroForm>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateFormData = (field: keyof CadastroForm, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.nome.trim()) return 'Nome completo é obrigatório';
    if (!formData.email.trim()) return 'Email é obrigatório';
    if (!formData.email.includes('@')) return 'Email inválido';
    if (!formData.telefone.trim()) return 'Telefone é obrigatório';
    if (!formData.senha) return 'Senha é obrigatória';
    if (formData.senha.length < 8) return 'Senha deve ter pelo menos 8 caracteres';
    if (formData.senha !== formData.confirmarSenha) return 'As senhas não coincidem';
    if (!formData.termos) return 'Você deve aceitar os termos de uso';
    return null;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.senha,
      options: {
        data: {
          nome: formData.nome,
          telefone: formData.telefone,
          cpf: formData.cpf,
          tipo: formData.tipo,
        },
      },
    });

    if (authError) {
      if (authError.message.includes('User already registered')) {
        setError('Este email já está cadastrado. Faça login ou recupere sua senha.');
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={40} className="text-emerald-600" />
          </motion.div>
          <h1 className="text-2xl font-display font-bold text-slate-900 mb-4">
            Cadastro Realizado!
          </h1>
          <p className="text-slate-600 mb-6">
            Enviamos um email de confirmação para <strong>{formData.email}</strong>. 
            Clique no link do email para ativar sua conta.
          </p>
          <button
            onClick={() => navigate('/login-publico')}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            Voltar para Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg w-full relative z-10"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 pb-6 text-center bg-gradient-to-b from-indigo-50 to-white">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-500/25 rotate-3"
            >
              <Building2 size={36} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-display font-black text-slate-900 mb-1"
            >
              Criar Conta
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 text-sm"
            >
              Faça seu cadastro para solicitar agendamentos
            </motion.p>
          </div>

          <div className="p-8 pt-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2"
              >
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                  Nome Completo *
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.nome}
                    onChange={(e) => updateFormData('nome', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                  Email *
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Telefone *
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={(e) => updateFormData('telefone', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => updateFormData('cpf', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl py-3.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                  Tipo de Usuário *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => updateFormData('tipo', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl py-3.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 outline-none transition-all"
                >
                  {tipoOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                  Senha *
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={formData.senha}
                    onChange={(e) => updateFormData('senha', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                  Confirmar Senha *
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirme sua senha"
                    value={formData.confirmarSenha}
                    onChange={(e) => updateFormData('confirmarSenha', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 mt-4">
                <input
                  type="checkbox"
                  checked={formData.termos}
                  onChange={(e) => updateFormData('termos', e.target.checked)}
                  className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600">
                  Eu declaro que li e aceito os{' '}
                  <a href="#" className="text-indigo-600 hover:underline">Termos de Uso</a>{' '}
                  e a{' '}
                  <a href="#" className="text-indigo-600 hover:underline">Política de Privacidade</a>.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Já tem conta?{' '}
                <button
                  onClick={() => navigate('/login-publico')}
                  className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
                >
                  Entrar
                </button>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/agendamento-publico')}
          className="mt-4 mx-auto flex items-center gap-2 text-indigo-200 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar sem conta
        </button>
      </motion.div>
    </div>
  );
}