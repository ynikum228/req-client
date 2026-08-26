import React, { useState } from 'react';
import { 
  Shield, User, MessageSquare, ThumbsUp, Lock, Plus, 
  Terminal, Users, AlertTriangle, Key, Copy, Check, 
  Search, Pin, ChevronRight, Crown, Sparkles, CheckCircle2,
  ShoppingCart, CreditCard, Settings, Flame
} from 'lucide-react';

// === РОЛИ И СТИЛИ ===
const ROLES = {
  owner: { name: 'OWNER', color: 'text-amber-400', bg: 'bg-amber-950/70 border-amber-600' },
  admin: { name: 'ADMIN', color: 'text-red-400', bg: 'bg-red-950/60 border-red-700/50' },
  developer: { name: 'DEV', color: 'text-purple-400', bg: 'bg-purple-950/60 border-purple-700/50' },
  user: { name: 'USER', color: 'text-gray-400', bg: 'bg-gray-800/60 border-gray-700' }
};

// Единственный аккаунт Morphezy с UID #1
const INITIAL_USERS = {
  'morphezy': { 
    uid: 1,
    username: 'morphezy', 
    role: 'owner', 
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
    reputation: 999, 
    postsCount: 12, 
    joined: '26.08.2026', 
    subscription: 'Lifetime (Unlimited)',
    warningPoints: 0,
    likedPosts: {} 
  }
};

const INITIAL_TOPICS = [
  {
    id: 1,
    title: 'Релиз REQUIEM.FUN v2.0 — Обновление под последний патч CS2',
    category: 'Обновления',
    isPinned: true,
    author: 'morphezy',
    date: 'Сегодня, 04:20',
    views: 1337,
    posts: [
      { 
        id: 101, 
        author: 'morphezy', 
        date: 'Сегодня, 04:20', 
        content: 'Переработали весь визуал, оптимизировали обход VACnet, выровняли плавность аима. Все подписки возобновлены.', 
        likes: 24 
      }
    ]
  },
  {
    id: 2,
    title: 'Правила форума и техническая поддержка',
    category: 'Информация',
    isPinned: true,
    author: 'morphezy',
    date: 'Вчера',
    views: 450,
    posts: [
      { id: 201, author: 'morphezy', date: 'Вчера', content: 'Уважайте участников сообщества. По всем вопросам обращайтесь в тикеты.', likes: 10 }
    ]
  }
];

export default function App() {
  const [currentUserKey] = useState('morphezy'); 
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' | 'forum' | 'topic' | 'profile' | 'keygen' | 'admin'
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');

  // Состояние подписки при покупке
  const [subscriptionDays, setSubscriptionDays] = useState(30);

  // Данные
  const [users, setUsers] = useState(INITIAL_USERS);
  const [topics, setTopics] = useState(INITIAL_TOPICS);
  const [generatedKeys, setGeneratedKeys] = useState([]);

  // Формы
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('Обсуждение');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [replyText, setReplyText] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  // Keygen
  const [keyDuration, setKeyDuration] = useState('lifetime');
  const [keyAmount, setKeyAmount] = useState(1);
  const [keyNote, setKeyNote] = useState('');

  const currentUser = users[currentUserKey];

  // Расчет цены
  const calculatePrice = (days) => {
    if (days === 10) return 490;
    if (days === 30) return 1490;
    if (days === 90) return 3290;
    return 1490;
  };

  // Форум
  const handleCreateTopic = (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return;

    const topicId = Date.now();
    const topic = {
      id: topicId,
      title: newTopicTitle,
      category: newTopicCategory,
      isPinned: false,
      author: currentUser.username,
      date: 'Только что',
      views: 1,
      posts: [{ id: Date.now() + 1, author: currentUser.username, date: 'Только что', content: newTopicContent, likes: 0 }]
    };

    setTopics([topic, ...topics]);
    setUsers({ ...users, [currentUser.username]: { ...currentUser, postsCount: currentUser.postsCount + 1 } });
    setNewTopicTitle('');
    setNewTopicContent('');
    setSelectedTopicId(topicId);
    setActiveTab('topic');
  };

  const handleAddReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setTopics(topics.map(t => {
      if (t.id === selectedTopicId) {
        return {
          ...t,
          posts: [...t.posts, { id: Date.now(), author: currentUser.username, date: 'Только что', content: replyText, likes: 0 }]
        };
      }
      return t;
    }));

    setUsers({ ...users, [currentUser.username]: { ...currentUser, postsCount: currentUser.postsCount + 1 } });
    setReplyText('');
  };

  // Keygen
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
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: keyNote || 'Без заметки'
      });
    }
    setGeneratedKeys([...newKeys, ...generatedKeys]);
    setKeyNote('');
  };

  const copyToClipboard = (text, keyId) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredTopics = topics.filter(t => {
    const matchesCat = selectedCategory === 'Все' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const currentTopic = topics.find(t => t.id === selectedTopicId);

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-gray-300 font-sans">
      
      {/* ─── ШАПКА ─── */}
      <header className="bg-[#12131a]/90 backdrop-blur-md border-b border-gray-800/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-8">
            {/* Логотип */}
            <div onClick={() => setActiveTab('buy')} className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-600/30 group-hover:scale-105 transition">
                <Flame className="text-white fill-white" size={18} />
              </div>
              <span className="font-black text-xl text-white tracking-wider">
                REQUIEM<span className="text-orange-500">.FUN</span>
              </span>
            </div>

            {/* Навигация */}
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

          {/* Аккаунтmorhpezy */}
          <div className="flex items-center gap-3">
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

        </div>
      </header>

      {/* ─── ОСНОВНОЙ КОНТЕНТ ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* ================= 1. СТРАНИЦА КУПИТЬ ================= */}
        {activeTab === 'buy' && (
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

                {/* Селектор тарифов */}
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

              {/* Итоговая цена и кнопка */}
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
        )}

        {/* ================= 2. ФОРУМ ================= */}
        {activeTab === 'forum' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="space-y-6">
              <div className="bg-[#12131a] p-4 rounded-2xl border border-gray-800/80 space-y-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-gray-500" />
                  <input 
                    type="text"
                    placeholder="Поиск по темам..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0b0b0e] border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
                  />
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[10px] uppercase font-mono text-gray-500 px-2 tracking-wider">Категории</span>
                  {['Все', 'Обновления', 'Информация', 'Обсуждение', 'Вопросы'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${selectedCategory === cat ? 'bg-orange-600/10 text-orange-400 border border-orange-500/20' : 'text-gray-400 hover:bg-gray-800/40 hover:text-white'}`}
                    >
                      <span>{cat}</span>
                      <ChevronRight size={14} className={selectedCategory === cat ? 'opacity-100' : 'opacity-0'} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              {/* Создание темы */}
              <div className="bg-[#12131a] border border-gray-800/80 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={14} className="text-orange-500" /> Создать обсуждение
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input 
                    type="text"
                    placeholder="Заголовок темы..."
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    className="sm:col-span-2 bg-[#0b0b0e] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50"
                  />
                  <select 
                    value={newTopicCategory}
                    onChange={(e) => setNewTopicCategory(e.target.value)}
                    className="bg-[#0b0b0e] border border-gray-800 text-xs text-gray-300 rounded-xl px-3 py-2 outline-none cursor-pointer"
                  >
                    <option value="Обсуждение">Обсуждение</option>
                    <option value="Обновления">Обновления</option>
                    <option value="Вопросы">Вопросы</option>
                  </select>
                </div>

                <textarea 
                  placeholder="Текст вашего сообщения..."
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  className="w-full bg-[#0b0b0e] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500/50 h-20 resize-none"
                ></textarea>

                <div className="flex justify-end">
                  <button 
                    onClick={handleCreateTopic}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-5 py-2 rounded-xl text-xs transition shadow-lg shadow-orange-600/20"
                  >
                    Опубликовать
                  </button>
                </div>
              </div>

              {/* Список тем */}
              <div className="bg-[#12131a] border border-gray-800/80 rounded-2xl overflow-hidden divide-y divide-gray-800/50">
                {filteredTopics.map(topic => (
                  <div 
                    key={topic.id} 
                    onClick={() => { setSelectedTopicId(topic.id); setActiveTab('topic'); }}
                    className="p-5 flex items-center justify-between hover:bg-gray-800/20 cursor-pointer transition group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {topic.isPinned && (
                          <span className="flex items-center gap-1 text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-md font-medium">
                            <Pin size={10} /> Закреплено
                          </span>
                        )}
                        <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md font-mono">
                          {topic.category}
                        </span>
                        <h4 className="text-sm font-semibold text-white group-hover:text-orange-400 transition">
                          {topic.title}
                        </h4>
                      </div>

                      <div className="text-xs text-gray-500 flex items-center gap-3">
                        <span>Автор: <strong className="text-amber-400">morphezy (UID #1)</strong></span>
                        <span>• {topic.date}</span>
                      </div>
                    </div>

                    <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. ПРОСМОТР ТЕМЫ ================= */}
        {activeTab === 'topic' && currentTopic && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <button onClick={() => setActiveTab('forum')} className="text-xs text-orange-400 hover:underline flex items-center gap-1">
              ← Вернуться на форум
            </button>

            <div className="bg-[#12131a] border border-gray-800/80 p-6 rounded-2xl">
              <h1 className="text-xl font-bold text-white">{currentTopic.title}</h1>
            </div>

            <div className="space-y-4">
              {currentTopic.posts.map((post) => (
                <div key={post.id} className="bg-[#12131a] border border-gray-800/80 rounded-2xl p-6 flex gap-4">
                  <img src={currentUser.avatar} alt="Avatar" className="w-12 h-12 rounded-full border border-amber-500 object-cover" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{currentUser.username}</span>
                        <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                          UID #{currentUser.uid}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{post.date}</span>
                    </div>
                    <div className="text-xs text-gray-300 leading-relaxed">{post.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 4. ГЕНЕРАТОР КЛЮЧЕЙ ================= */}
        {activeTab === 'keygen' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-[#12131a] border border-purple-900/40 p-5 rounded-2xl flex items-center justify-between">
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="text-purple-400" size={18} /> Генерация лицензионных ключей (Owner)
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
        )}

        {/* ================= 5. ПРОФИЛЬ MORPHEZY ================= */}
        {activeTab === 'profile' && (
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
        )}

        {/* ================= 6. ПАНЕЛЬ ================= */}
        {activeTab === 'admin' && (
          <div className="max-w-4xl mx-auto bg-[#12131a] border border-red-950/40 p-6 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="text-red-500" size={18} /> Управление системой и правами
            </h2>
            <div className="p-4 bg-[#0b0b0e] border border-amber-500/30 rounded-xl text-xs flex justify-between items-center">
              <div>
                <span className="font-mono text-amber-400 font-bold mr-2">UID #1</span>
                <span className="text-white font-bold">morphezy</span>
              </div>
              <span className="text-amber-400 font-bold">Полные права доступа (Root)</span>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
