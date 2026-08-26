import React from 'react';

export default function ProfileTab({ currentUser }) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-[#12131a] border border-gray-800/80 rounded-2xl p-6 flex items-center gap-6">
        <img src={currentUser.avatar} alt="Avatar" className="w-20 h-20 rounded-2xl border-2 border-amber-500 object-cover" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white">{currentUser.username}</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-md border border-amber-600 bg-amber-950/70 text-amber-400 font-bold">
              OWNER
            </span>
          </div>
          <div className="text-xs font-mono text-amber-400 font-bold">Уникальный идентификатор: UID #{currentUser.uid}</div>
          <div className="text-xs text-gray-500">Подписка: {currentUser.subscription}</div>
        </div>
      </div>
    </div>
  );
}