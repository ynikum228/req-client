import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';

export default function BuyTab() {
  const [subscriptionDays, setSubscriptionDays] = useState(30);

  const calculatePrice = (days) => {
    if (days === 10) return 490;
    if (days === 30) return 1490;
    if (days === 90) return 3290;
    return 1490;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white tracking-wide">ПОКУПКА ПОДПИСКИ REQUIEM</h1>
        <p className="text-xs text-gray-400">Выберите подходящий тариф для получения моментального доступа</p>
      </div>

      <div className="bg-[#12131a] border border-gray-800/80 p-8 rounded-3xl space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-orange-400 block text-center">
            Выберите длительность подписки
          </label>

          <div className="grid grid-cols-3 gap-3">
            {[10, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setSubscriptionDays(days)}
                className={`p-4 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  subscriptionDays === days 
                    ? 'bg-orange-600/15 border-orange-500 text-white shadow-lg shadow-orange-600/10' 
                    : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className="text-lg font-black">{days} Дней</span>
                <span className="text-[10px] font-mono text-gray-500">{calculatePrice(days)} RUB</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500">Сумма к оплате:</div>
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {calculatePrice(subscriptionDays)}.00 <span className="text-orange-500 text-xl">RUB</span>
            </div>
          </div>

          <button className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold px-8 py-4 rounded-2xl text-sm transition shadow-xl shadow-orange-600/25 flex items-center justify-center gap-2">
            <CreditCard size={18} /> Оплатить и получить доступ
          </button>
        </div>
      </div>
    </div>
  );
}