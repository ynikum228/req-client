import React from 'react';
import { ShoppingCart, MessageSquare, Key, Shield, Flame, Crown } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, currentUser }) {
  return (
    <header className="bg-[#12131a]/90 backdrop-blur-md border-b border-gray-800/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div onClick={() => setActiveTab('buy')} className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-600/30 group-hover:scale-105 transition">
              <Flame className="text-white fill-white" size={18} />
            </div>
            <span className="font-black text-xl text-white tracking-wider">
              REQUIEM<span className="text-orange-500">.FUN</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-gray-900/80 p-1 rounded-xl border border-gray-800/80 text-xs font-semibold">
            <button 
              onClick={() => setActiveTab('buy')} 
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeTab === 'buy' ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20' : 'hover:text-white hover:bg-gray-800/50'}`}
            >
              <ShoppingCart size={14} /> Купить
            </button>

            <button 
              onClick={() => setActiveTab('forum')} 
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeTab === 'forum' || activeTab === 'topic' ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20' : 'hover:text-white hover:bg-gray-800/50'}`}
            >
              <MessageSquare size={14} /> Форум
            </button>

            <button 
              onClick={() => setActiveTab('keygen')} 
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeTab === 'keygen' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-400 hover:bg-purple-950/30'}`}
            >
              <Key size={14} /> Ключи
            </button>

            <button 
              onClick={() => setActiveTab('admin')} 
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeTab === 'admin' ? 'bg-red-600 text-white shadow-md' : 'text-red-400 hover:bg-red-950/30'}`}
            >
              <Shield size={14} /> Панель
            </button>
          </nav>
        </div>

        <button 
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-2.5 bg-gray-900/90 px-3 py-1.5 rounded-xl border border-gray-800 hover:border-gray-700 transition"
        >
          <img src={currentUser.avatar} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-amber-500" />
          <div className="text-left">
            <div className="text-xs font-bold text-white leading-none flex items-center gap-1">
              {currentUser.username} <Crown size={10} className="text-amber-400" />
            </div>
            <div className="text-[9px] text-amber-400 font-mono font-bold">UID #{currentUser.uid}</div>
          </div>
        </button>
      </div>
    </header>
  );
}