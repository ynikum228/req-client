import React, { useState } from 'react';
import { Key, Copy, Check } from 'lucide-react';

export default function KeygenTab({ currentUser }) {
  const [generatedKeys, setGeneratedKeys] = useState([]);
  const [keyDuration, setKeyDuration] = useState('lifetime');
  const [keyAmount, setKeyAmount] = useState(1);
  const [copiedKey, setCopiedKey] = useState(null);

  const generateLicenseKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    return `REQ-${segment()}-${segment()}-${segment()}`;
  };

  const handleGenerateKeys = (e) => {
    e.preventDefault();
    const newKeys = [];
    for (let i = 0; i < Number(keyAmount); i++) {
      newKeys.push({
        id: Date.now() + i,
        key: generateLicenseKey(),
        duration: keyDuration === '1_day' ? '1 День' : keyDuration === '30_days' ? '30 Дней' : 'Lifetime',
        createdBy: currentUser.username,
      });
    }
    setGeneratedKeys([...newKeys, ...generatedKeys]);
  };

  const copyToClipboard = (text, keyId) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-[#12131a] border border-purple-900/40 p-5 rounded-2xl flex items-center justify-between">
        <h1 className="text-base font-bold text-white flex items-center gap-2">
          <Key className="text-purple-400" size={18} /> Генерация лицензионных ключей (Owner Access)
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleGenerateKeys} className="bg-[#12131a] border border-gray-800/80 p-5 rounded-2xl space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Срок действия</label>
            <select 
              value={keyDuration}
              onChange={(e) => setKeyDuration(e.target.value)}
              className="w-full bg-[#0b0b0e] border border-gray-800 text-xs text-white rounded-xl p-2.5 outline-none"
            >
              <option value="lifetime">Lifetime (Навсегда)</option>
              <option value="30_days">30 Дней</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Количество</label>
            <input 
              type="number" min="1" max="20" value={keyAmount}
              onChange={(e) => setKeyAmount(e.target.value)}
              className="w-full bg-[#0b0b0e] border border-gray-800 text-xs text-white rounded-xl p-2.5 outline-none"
            />
          </div>

          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl text-xs transition">
            Сгенерировать
          </button>
        </form>

        <div className="md:col-span-2 bg-[#12131a] border border-gray-800/80 p-5 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">История ключей ({generatedKeys.length})</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {generatedKeys.map(k => (
              <div key={k.id} className="p-3 bg-[#0b0b0e] border border-gray-800 rounded-xl flex items-center justify-between text-xs">
                <span className="font-mono text-purple-300 font-bold">{k.key}</span>
                <button onClick={() => copyToClipboard(k.key, k.id)} className="p-1.5 bg-gray-800 rounded text-gray-300">
                  {copiedKey === k.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}