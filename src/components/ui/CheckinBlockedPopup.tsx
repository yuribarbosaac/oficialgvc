import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, User, AlertTriangle } from 'lucide-react';

interface BlockedInfo {
  visitorName: string;
  cpf: string;
  currentSpace: string;
  checkinTime: string;
  remainingMinutes: number;
}

interface CheckinBlockedPopupProps {
  blockedInfo: BlockedInfo;
  onClose: () => void;
}

export const CheckinBlockedPopup: React.FC<CheckinBlockedPopupProps> = ({ blockedInfo, onClose }) => {
  const [countdown, setCountdown] = useState(blockedInfo.remainingMinutes * 60);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCheckinHour = (): string => {
    const date = new Date(blockedInfo.checkinTime);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[100] transition-all duration-500 ease-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-red-100 w-96 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">Check-in Bloqueado</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{blockedInfo.visitorName}</p>
              <p className="text-sm text-gray-500">CPF: {blockedInfo.cpf}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-700">Atualmente em:</p>
              <p className="font-semibold text-amber-900">{blockedInfo.currentSpace}</p>
              <p className="text-xs text-amber-600 mt-0.5">Check-in realizado às {getCheckinHour()}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Disponível para novo check-in em:</p>
            <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl">
              <Clock className="w-5 h-5 text-red-400" />
              <span className="text-3xl font-mono font-bold tracking-wider">
                {formatTime(countdown)}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              O visitante poderá fazer check-in em outro espaço após 60 minutos
            </p>
          </div>
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};