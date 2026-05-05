import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { user, userData, isSuperadmin } = useAuth();

  const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(userData?.nome || 'Usuário');

  return (
    <header className="fixed top-0 right-0 left-72 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40 flex items-center justify-between px-8">
      <div className="flex items-center gap-4 flex-1">
        <h2 className="hidden lg:block text-xl font-black text-gray-900 ml-4 font-display">Gerenciamento de Visitantes Culturais</h2>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="h-8 w-px bg-gray-100 mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-900">{userData?.nome || 'Usuário'}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              {userData?.perfil === 'administrador' && 'Administrador Geral'}
              {userData?.perfil === 'coordenador' && 'Coordenador'}
              {userData?.perfil === 'funcionario' && 'Funcionário'}
              {userData?.espacoId !== 'todos' && userData?.espacoNome ? ` • ${userData.espacoNome}` : ''}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border-2 border-gray-100">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
