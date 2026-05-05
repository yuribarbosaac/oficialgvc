import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, User, CheckCircle } from 'lucide-react';

interface SuccessInfo {
  visitorName: string;
  space: string;
  checkinTime: string;
}

interface CheckinSuccessPopupProps {
  info: SuccessInfo;
  onClose: () => void;
}

export const CheckinSuccessPopup: React.FC<CheckinSuccessPopupProps> = ({ info, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const getCheckinHour = (): string => {
    const date = new Date(info.checkinTime);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-[100] transition-all duration-500 ease-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 w-80 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">Check-in Confirmado</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-emerald-600">Visitante</p>
              <p className="font-semibold text-gray-900">{info.visitorName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Local</p>
              <p className="font-semibold text-gray-900">{info.space}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Horário</p>
              <p className="font-semibold text-gray-900">{getCheckinHour()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};