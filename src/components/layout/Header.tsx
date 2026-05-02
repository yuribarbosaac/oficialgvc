import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { user, userData, isSuperadmin } = useAuth();

  // For superadmin, use a gradient avatar instead of a photo URL
  const avatarUrl = isSuperadmin
    ? null
    : user?.photoURL || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100";

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
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-100 p-0.5 cursor-pointer hover:border-primary/30 transition-all">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="User" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {userData?.nome?.charAt(0)?.toUpperCase() || 'S'}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
