import { motion } from 'motion/react';
import { Clock, Info } from 'lucide-react';

interface FooterProps {
  type: 'lockers' | 'telecentro';
}

export default function Footer({ type }: FooterProps) {
  const tips = type === 'lockers' 
    ? [
        'Verificar armários não utilizados há 24h',
        'A liberação deve acompanhar a devolução física',
        'Mantenha registro no sistema'
      ]
    : [
        'Realizar o check-in dos usuários antes de liberar o equipamento',
        'Monitorar o tempo de uso conforme limite da sessão',
        'Orientar o usuário a desligar o computador ao final do uso'
      ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8"
    >
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Info className="text-primary" size={16} />
          </div>
          <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
            Orientações
          </h4>
          {type === 'telecentro' && (
            <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-primary bg-blue-50 px-2 py-1 rounded-full">
              <Clock size={12} />
              <span>30min por sessão</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-3">
          {tips.map((tip, i) => (
            <div
              key={i}
              className="text-sm text-slate-600 flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
              {tip}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}