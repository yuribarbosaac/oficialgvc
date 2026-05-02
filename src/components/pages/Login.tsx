import { supabase } from '../../lib/supabase';
import { LayoutDashboard, LogIn, Mail, Lock, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (authErr) {
        if (authErr.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos.');
        } else {
          setError('Erro ao autenticar: ' + authErr.message);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Erro ao autenticar. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full relative z-10"
      >
        {/* Glassmorphism card */}
        <div className="bg-white/[0.07] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-black/20 overflow-hidden">
          
          {/* Header Section */}
          <div className="p-8 pb-2 text-center">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-500/25 rotate-3"
            >
              <LayoutDashboard size={36} />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-display font-black text-white mb-2 tracking-tight"
            >
              GVC
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-blue-200/60 text-sm font-medium"
            >
              Gerenciamento de Visitantes Culturais
            </motion.p>
          </div>

          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-8 pt-6"
          >
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold rounded-xl flex items-center gap-2.5 backdrop-blur-sm"
                >
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </motion.div>
              )}
              
              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-blue-200/50 uppercase tracking-widest pl-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors" size={18} />
                  <input 
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 outline-none transition-all focus:bg-white/[0.08]"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-blue-200/50 uppercase tracking-widest pl-1">
                  Senha
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors" size={18} />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 outline-none transition-all focus:bg-white/[0.08]"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-[0.98] shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    Entrar no Sistema
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Footer outside card */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center flex items-center justify-center gap-2"
        >
          <ShieldCheck size={12} className="text-blue-400/30" />
          <p className="text-[10px] text-blue-200/25 font-mono tracking-wider">
            GVC System v1.3.0 • Acesso Seguro
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
