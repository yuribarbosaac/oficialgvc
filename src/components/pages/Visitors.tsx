import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Visitor, OperationType } from '../../types';
import { 
  Search, 
  UserPlus, 
  Filter, 
  Edit,
  Trash2,
  IdCard,
  ChevronLeft,
  ChevronRight,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import CheckInModal from '../modals/CheckInModal';
import { useAuth } from '../../contexts/AuthContext';

export default function Visitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [spaces, setSpaces] = useState<{id: string, nome: string}[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visitorToEdit, setVisitorToEdit] = useState<Visitor | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { userData } = useAuth();

  const fetchVisitors = async () => {
    try {
      const { data, error } = await supabase.from('visitors').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      const mapped = data.map(d => ({
        id: d.id,
        fullName: d.full_name,
        cpf: d.cpf,
        passport: d.passport,
        isForeigner: d.is_foreigner,
        gender: d.gender,
        category: d.category,
        photoUrl: d.photo_url,
        createdAt: d.created_at,
        email: d.email,
        phone: d.phone,
        birthDate: d.birth_date,
        address: d.address
      })) as Visitor[];
      setVisitors(mapped);
    } catch (err) {
      console.error("Erro ao carregar visitantes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();

    const channel = supabase.channel('visitors-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visitors' }, () => {
        fetchVisitors();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (userData?.espacoId === 'todos') {
      supabase.from('espacos').select('id, nome').then(({ data }) => {
        if (data) setSpaces(data);
      });
    }
  }, [userData]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o registro de ${name}?`)) {
      try {
        await supabase.from('visitors').delete().eq('id', id);
      } catch (error) {
        console.error("Erro ao deletar", error);
      }
    }
  };

  const handleEdit = (visitor: Visitor) => {
    setVisitorToEdit(visitor);
    setIsModalOpen(true);
  };

  const handleCheckIn = async (visitor: Visitor) => {
    if (saving) return;
    
    let espacoId = userData?.espacoId;
    let espacoNome = userData?.espacoNome;

    if (userData?.espacoId === 'todos') {
      if (!selectedSpaceId) {
        alert("Por favor, selecione um espaço no seletor acima antes de fazer o check-in.");
        return;
      }
      espacoId = selectedSpaceId;
      espacoNome = spaces.find(s => s.id === selectedSpaceId)?.nome || "Entrada Principal";
    }
    
    setSaving(true);
    try {
      // TRAVA DE CHECK-IN ATIVO
      const { data: activeVisits } = await supabase
        .from('visits')
        .select('id')
        .eq('visitor_id', visitor.id)
        .in('status', ['Ativo', 'active']);
      
      if (activeVisits && activeVisits.length > 0) {
        alert("Visitante já possui check-in ativo no sistema.");
        setSaving(false);
        return;
      }

      const { error } = await supabase.from('visits').insert({
        visitor_id: visitor.id,
        nome: visitor.fullName,
        perfil: visitor.category || 'general',
        local: espacoNome || 'Entrada Principal',
        espaco_id: espacoId === 'todos' ? null : espacoId,
        status: 'Ativo'
      });

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao realizar checkin:", error);
    } finally {
      setSaving(false);
    }
  };

  const filteredVisitors = visitors.filter(v => {
    const searchLower = searchTerm.toLowerCase();
    const cleanSearch = searchTerm.replace(/[^\d]/g, '');
    const searchTokens = searchLower.split(/\s+/).filter(t => t.length > 0);
    
    const nameMatches = searchTokens.length > 0 && searchTokens.every(token => 
      v.fullName.toLowerCase().includes(token)
    );
    
    return (
      (searchTokens.length === 0 || nameMatches) ||
      (v.cpf && cleanSearch && v.cpf.includes(cleanSearch)) ||
      (v.passport && searchLower && v.passport.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-8 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg z-[100] flex items-center gap-3"
        >
          <CheckCircle2 size={20} />
          <span className="font-bold text-sm">Check-in realizado com sucesso!</span>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Registro de Visitantes</h1>
          <p className="text-gray-500 max-w-2xl">Localize indivíduos registrados, verifique credenciais e emita acesso temporário a salas de leitura ou galerias restritas.</p>
        </div>
        <div className="flex items-end gap-4 border-blue-100 hidden sm:flex">
          {userData?.espacoId === 'todos' && (
            <div className="bg-white border text-sm border-gray-200 px-4 py-2 rounded-lg">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Local de Check-in</span>
               <select 
                 value={selectedSpaceId} 
                 onChange={e => setSelectedSpaceId(e.target.value)}
                 className="bg-transparent font-bold text-primary outline-none"
               >
                 <option value="" disabled>Selecione um local</option>
                 {spaces.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
               </select>
            </div>
          )}
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Data Atual</p>
            <p className="text-sm font-mono font-bold text-primary">
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por Nome, CPF ou Afiliação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-inner"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={() => { setVisitorToEdit(null); setIsModalOpen(true); }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-900 transition-colors shadow-sm"
            >
              <UserPlus size={20} />
              Novo Visitante
            </button>
            <button className="p-3 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-2">
            <IdCard className="text-primary" size={20} />
            <h3 className="font-display font-bold text-gray-900">Resultados do Registro</h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Mostrando {filteredVisitors.length} resultados</span>
            <div className="flex items-center border border-gray-200 rounded overflow-hidden">
              <button className="p-1.5 hover:bg-gray-50 border-r border-gray-200 disabled:opacity-30" disabled><ChevronLeft size={16} /></button>
              <button className="p-1.5 hover:bg-gray-50 disabled:opacity-30" disabled><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identificação do Visitante</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Último Acesso</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVisitors.length > 0 ? filteredVisitors.map((visitor) => (
                <tr key={visitor.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold border border-blue-50 overflow-hidden">
                        {visitor.photoUrl ? (
                          <img src={visitor.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{visitor.fullName[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{visitor.fullName}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-mono text-gray-400">
                            {visitor.isForeigner 
                              ? `PASS: ${visitor.passport}` 
                              : `CPF: ${visitor.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}`}
                          </p>
                          {visitor.isForeigner && <Globe size={12} className="text-blue-400" />}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-50 text-green-700 border border-green-100 text-[10px] font-bold uppercase">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div> Registrado
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{visitor.createdAt ? new Date(visitor.createdAt).toLocaleDateString('pt-BR') : 'Sem registro'}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Membro</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleCheckIn(visitor)}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded font-bold text-[10px] uppercase hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {saving ? '...' : 'Check-in'}
                       </button>
                       <div className="w-px h-6 bg-gray-200 mx-1"></div>
                       <button 
                        onClick={() => handleEdit(visitor)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded transition-all"
                       >
                         <Edit size={16} />
                       </button>
                       <button 
                        onClick={() => handleDelete(visitor.id, visitor.fullName)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                    Nenhum visitante encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <CheckInModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        visitorToEdit={visitorToEdit} 
      />
    </div>
  );
}
