import React, { useState } from 'react';
import { 
  Shield, User, MessageSquare, ThumbsUp, Lock, Plus, 
  Terminal, Users, AlertTriangle, Key, Copy, Check, 
  Search, Pin, ChevronRight, Crown, Sparkles, CheckCircle2
} from 'lucide-react';

// === РОЛИ И СТИЛИ ===
const ROLES = {
  owner: { name: 'Owner', color: 'text-amber-400', bg: 'bg-amber-950/70 border-amber-600' },
  admin: { name: 'Администратор', color: 'text-red-400', bg: 'bg-red-950/60 border-red-700/50' },
  developer: { name: 'Разработчик', color: 'text-purple-400', bg: 'bg-purple-950/60 border-purple-700/50' },
  support: { name: 'Агент поддержки', color: 'text-blue-400', bg: 'bg-blue-950/60 border-blue-700/50' },
  tester: { name: 'Тестер', color: 'text-cyan-400', bg: 'bg-cyan-950/60 border-cyan-700/50' },
  user: { name: 'Пользователь', color: 'text-gray-400', bg: 'bg-gray-800/60 border-gray-700' }
};

// Единственный аккаунт Morphezy с UID #1
const INITIAL_USERS = {
  'morphezy': { 
    uid: 1,
    username: 'morphezy', 
    role: 'owner', 
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
    reputation: 999, 
    postsCount: 1, 
    joined: '26.08.2026', 
    subscription: 'Owner Access (Unlimited)',
    warningPoints: 0,
    likedPosts: {} 
  }
};

const INITIAL_TOPICS = [
  {
    id: 1,
    title: 'Добро пожаловать в обновленный HUB req-client',
    category: 'Обновления',
    isPinned: true,
    author: 'morphezy',
    date: 'Сегодня',
    views: 1,
    posts: [
      { 
        id: 101, 
        author: 'morphezy', 
        date: 'Сегодня', 
        content: 'Система полностью обновлена. Все прошлые профили сброшены. Внедрена система UID.', 
        likes: 1 
      }
    ]
  }
];

export default function ReqClientApp() {
  const [currentUserKey] = useState('morphezy'); // Единственный пользователь
  const [activeTab, setActiveTab] = useState('forum'); // 'forum' | 'topic' | 'profile' | 'keygen' | 'admin'
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');

  // Состояние данных
  const [users, setUsers] = useState(INITIAL_USERS);
  const [topics, setTopics] = useState(INITIAL_TOPICS);
  const [generatedKeys, setGeneratedKeys] = useState([]);
  
  // Формы
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('Обсуждение');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [replyText, setReplyText] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  // Настройки генератора ключей
  const [keyDuration, setKeyDuration] = useState('lifetime');
  const [keyAmount, setKeyAmount] = useState(1);
  const [keyNote, setKeyNote] = useState('');

  const currentUser = users[currentUserKey];

  // Полные права для Owner
  const hasFullAccess = ['owner', 'admin', 'developer'].includes(currentUser.role);

  // --- ЛОГИКА ФОРУМА ---
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
      posts: [
        { id: Date.now() + 1, author: currentUser.username, date: 'Только что', content: newTopicContent, likes: 0 }
      ]
    };

    setTopics([topic, ...topics]);
    setUsers({
      ...users,
      [currentUser.username]: { ...currentUser, postsCount: currentUser.postsCount + 1 }
    });
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

    setUsers({
      ...users,
      [currentUser.username]: { ...currentUser, postsCount: currentUser.postsCount + 1 }
    });
    setReplyText('');
  };

  const handleLikePost = (postId, authorUsername) => {
    const userLikes = currentUser.likedPosts || {};
    const hasLiked = userLikes[postId];

    setTopics(topics.map(t => ({
      ...t,
      posts: t.posts.map(p => {
        if (p.id === postId) {
          return { ...p, likes: hasLiked ? p.likes - 1 : p.likes + 1 };
        }
        return p;
      })
    })));

    setUsers({
      ...users,
      [currentUser.username]: { ...currentUser, likedPosts: { ...userLikes, [postId]: !hasLiked } }
    });
  };

  // --- ГЕНЕРАТОР КЛЮЧЕЙ ---
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
        createdAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
    <div className="min-h-screen bg-[#0d0e12] text-gray-300 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* ─── НАВИГАЦИЯ / HEADER ─── */}
      <header className="bg-[#13141c]/80 backdrop-blur-md border-b border-gray-800/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-8">
            <div onClick={() => setActiveTab('forum')} className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
                <Terminal className="text-black stroke-[2.5]" size={20} />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-wider block leading-none">REQ<span className="text-amber-500">.CLIENT</span></span>
                <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Community & Hub</span>
              </div>
            </div>

            {/* Меню навигации */}
            <nav className="hidden md:flex items-center gap-1 bg-gray-900/60 p-1 rounded-xl border border-gray-800/60 text-xs font-medium">
              <button 
                onClick={() => setActiveTab('forum')} 
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeTab === 'forum' || activeTab === 'topic' ? 'bg-amber-600 text-white shadow-md' : 'hover:text-white hover:bg-gray-800/50'}`}
              >
                <MessageSquare size={14} /> Форум
              </button>
              
              <button 
                onClick={() => setActiveTab('profile')} 
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeTab === 'profile' ? 'bg-amber-600 text-white shadow-md' : 'hover:text-white hover:bg-gray-800/50'}`}
              >
                <User size={14} /> Профиль
              </button>

              <button 
                onClick={() => setActiveTab('keygen')} 
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeTab === 'keygen' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-400 hover:bg-purple-950/30'}`}
              >
                <Key size={14} /> Генератор ключей
              </button>

              <button 
                onClick={() => setActiveTab('admin')} 
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeTab === 'admin' ? 'bg-red-600 text-white shadow-md' : 'text-red-400 hover:bg-red-950/30'}`}
              >
                <Shield size={14} /> Управление
              </button>
            </nav>
          </div>

          {/* Карточка пользователя в шапке */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-gray-900/80 px-3 py-1.5 rounded-xl border border-gray-800 text-xs">
              <span className="font-mono text-amber-400 font-bold">UID #{currentUser.uid}</span>
              <span className="text-white font-semibold">{currentUser.username}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-amber-600 bg-amber-950/70 text-amber-400 flex items-center gap-1">
                <Crown size={10} /> OWNER
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* ─── ОСНОВНОЙ КОНТЕНТ ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ================= 1. ФОРУМ ================= */}
        {activeTab === 'forum' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            <div className="space-y-6">
              <div className="bg-[#13141c] p-4 rounded-2xl border border-gray-800/80 space-y-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-gray-500" />
                  <input 
                    type="text"
                    placeholder="Поиск по темам..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[10px] uppercase font-mono text-gray-500 px-2 tracking-wider">Категории</span>
                  {['Все', 'Обновления', 'Обсуждение', 'Отзывы', 'Вопросы'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${selectedCategory === cat ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20' : 'text-gray-400 hover:bg-gray-800/40 hover:text-white'}`}
                    >
                      <span>{cat}</span>
                      <ChevronRight size={14} className={selectedCategory === cat ? 'opacity-100' : 'opacity-0'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#13141c] p-4 rounded-2xl border border-gray-800/80 space-y-3 text-xs">
                <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">Информация HUB</span>
                <div className="flex justify-between py-1 border-b border-gray-800/60">
                  <span className="text-gray-400">Владелец:</span>
                  <span className="font-mono text-amber-400 font-bold">morphezy (UID #1)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800/60">
                  <span className="text-gray-400">Всего аккаунтов:</span>
                  <span className="font-mono text-white">1</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Доступ:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Full Root Access
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <div className="bg-[#13141c] border border-gray-800/80 p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" /> Опубликовать новую тему
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input 
                    type="text"
                    placeholder="Заголовок темы..."
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    className="sm:col-span-2 bg-[#0d0e12] border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                  <select 
                    value={newTopicCategory}
                    onChange={(e) => setNewTopicCategory(e.target.value)}
                    className="bg-[#0d0e12] border border-gray-800 text-xs text-gray-300 rounded-xl px-3 py-2 outline-none cursor-pointer"
                  >
                    <option value="Обсуждение">Обсуждение</option>
                    <option value="Обновления">Обновления</option>
                    <option value="Отзывы">Отзывы</option>
                    <option value="Вопросы">Вопросы</option>
                  </select>
                </div>

                <textarea 
                  placeholder="Содержимое темы..."
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  className="w-full bg-[#0d0e12] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50 h-24 resize-none"
                ></textarea>

                <div className="flex justify-end">
                  <button 
                    onClick={handleCreateTopic}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold px-5 py-2 rounded-xl text-xs transition shadow-lg shadow-amber-600/20"
                  >
                    Создать тему
                  </button>
                </div>
              </div>

              <div className="bg-[#13141c] border border-gray-800/80 rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-800/80 text-xs font-semibold text-gray-400">
                  Все темы форума
                </div>

                <div className="divide-y divide-gray-800/50">
                  {filteredTopics.map(topic => (
                    <div 
                      key={topic.id} 
                      onClick={() => { setSelectedTopicId(topic.id); setActiveTab('topic'); }}
                      className="p-5 flex items-center justify-between hover:bg-gray-800/20 cursor-pointer transition group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          {topic.isPinned && (
                            <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md font-medium">
                              <Pin size={10} /> Закреплено
                            </span>
                          )}
                          <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md font-mono">
                            {topic.category}
                          </span>
                          <h4 className="text-sm font-semibold text-white group-hover:text-amber-400 transition">
                            {topic.title}
                          </h4>
                        </div>

                        <div className="text-xs text-gray-500 flex items-center gap-3">
                          <span>Автор: <strong className="text-amber-400">morphezy (UID #1)</strong></span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] border border-amber-600 bg-amber-950/70 text-amber-400 font-bold">Owner</span>
                          <span>• {topic.date}</span>
                        </div>
                      </div>

                      <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= 2. ПРОСМОТР ТЕМЫ ================= */}
        {activeTab === 'topic' && currentTopic && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <button onClick={() => setActiveTab('forum')} className="text-xs text-amber-400 hover:underline flex items-center gap-1">
              ← Назад к темам
            </button>

            <div className="bg-[#13141c] border border-gray-800/80 p-6 rounded-2xl">
              <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-md font-medium">
                {currentTopic.category}
              </span>
              <h1 className="text-xl font-bold text-white mt-2">{currentTopic.title}</h1>
            </div>

            <div className="space-y-4">
              {currentTopic.posts.map((post, index) => (
                <div key={post.id} className="bg-[#13141c] border border-gray-800/80 rounded-2xl overflow-hidden flex flex-col md:flex-row">
                  <div className="w-full md:w-56 bg-[#0f1017] p-5 flex flex-col items-center border-r border-gray-800/60 text-center">
                    <img src={currentUser.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/40 mb-3" />
                    <span className="text-sm font-bold text-white flex items-center gap-1">
                      {currentUser.username} <Crown size={12} className="text-amber-400" />
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold mb-1">UID #{currentUser.uid}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-amber-600 bg-amber-950/70 text-amber-400">
                      Owner
                    </span>
                  </div>

                  <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                    <div className="text-sm text-gray-200 leading-relaxed">{post.content}</div>
                    <div className="flex justify-end pt-3 border-t border-gray-800/40">
                      <button 
                        onClick={() => handleLikePost(post.id, currentUser.username)}
                        className="px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                      >
                        <ThumbsUp size={13} />
                        <span className="font-mono">{post.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddReply} className="bg-[#13141c] border border-gray-800/80 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ответить</h3>
              <textarea 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Ваш ответ..."
                className="w-full bg-[#0d0e12] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/50 h-24 resize-none"
              ></textarea>
              <div className="flex justify-end">
                <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2 rounded-xl text-xs transition">
                  Отправить
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= 3. ГЕНЕРАТОР КЛЮЧЕЙ ================= */}
        {activeTab === 'keygen' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-[#13141c] border border-purple-900/40 p-6 rounded-2xl flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  <Key className="text-purple-400" size={22} /> Генератор лицензий (Owner Access)
                </h1>
                <p className="text-xs text-gray-400 mt-1">Полный доступ ко всем функциям создания подписок</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <form onSubmit={handleGenerateKeys} className="bg-[#13141c] border border-gray-800/80 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gray-800/60 pb-2">Параметры</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">Срок действия</label>
                  <select 
                    value={keyDuration}
                    onChange={(e) => setKeyDuration(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-gray-800 text-xs text-white rounded-xl p-2.5 outline-none"
                  >
                    <option value="lifetime">Lifetime (Навсегда)</option>
                    <option value="30_days">30 Дней</option>
                    <option value="1_day">1 День</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">Количество</label>
                  <input 
                    type="number" min="1" max="50" value={keyAmount}
                    onChange={(e) => setKeyAmount(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-gray-800 text-xs text-white rounded-xl p-2.5 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">Заметка</label>
                  <input 
                    type="text" placeholder="Метка ключа..." value={keyNote}
                    onChange={(e) => setKeyNote(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-gray-800 text-xs text-white rounded-xl p-2.5 outline-none"
                  />
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl text-xs transition">
                  Сгенерировать
                </button>
              </form>

              <div className="md:col-span-2 bg-[#13141c] border border-gray-800/80 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gray-800/60 pb-2">
                  Созданные ключи ({generatedKeys.length})
                </h3>
                <div className="space-y-2 max-h-[340px] overflow-y-auto">
                  {generatedKeys.length === 0 ? (
                    <div className="text-xs text-gray-500 py-12 text-center">Список пуст</div>
                  ) : (
                    generatedKeys.map(k => (
                      <div key={k.id} className="p-3 bg-[#0d0e12] border border-gray-800 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold text-purple-300 tracking-wider">{k.key}</span>
                          <span className="ml-2 text-[10px] bg-purple-950/60 text-purple-400 border border-purple-800 px-1.5 py-0.2 rounded">{k.duration}</span>
                        </div>
                        <button onClick={() => copyToClipboard(k.key, k.id)} className="p-2 bg-gray-800 text-gray-300 rounded-lg">
                          {copiedKey === k.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. ПРОФИЛЬ (OWNER) ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-[#13141c] border border-gray-800/80 rounded-2xl overflow-hidden">
              <div className="h-36 bg-gradient-to-r from-amber-950/50 via-orange-950/40 to-gray-900 border-b border-gray-800/80"></div>
              
              <div className="px-6 pb-6 relative flex flex-col md:flex-row items-start md:items-end justify-between gap-4 -mt-12">
                <div className="flex items-end gap-4">
                  <img src={currentUser.avatar} alt="Avatar" className="w-24 h-24 rounded-2xl border-4 border-[#13141c] object-cover bg-gray-900 shadow-xl" />
                  <div className="mb-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">{currentUser.username}</h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-md border border-amber-600 bg-amber-950/70 text-amber-400 font-bold flex items-center gap-1">
                        <Crown size={12} /> OWNER
                      </span>
                    </div>
                    <span className="text-xs text-amber-400 font-mono font-semibold">UID #{currentUser.uid}</span>
                  </div>
                </div>

                <div className="bg-[#0d0e12] border border-amber-500/30 px-4 py-2 rounded-xl text-center">
                  <div className="text-[10px] text-gray-500 uppercase">Статус доступа</div>
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Root Owner (Full Control)
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#13141c] border border-gray-800/80 p-5 rounded-2xl text-center">
                <div className="text-xs text-gray-500 uppercase">Уникальный UID</div>
                <div className="text-2xl font-black text-amber-400 font-mono">#{currentUser.uid}</div>
              </div>
              <div className="bg-[#13141c] border border-gray-800/80 p-5 rounded-2xl text-center">
                <div className="text-xs text-gray-500 uppercase">Репутация</div>
                <div className="text-2xl font-black text-white font-mono">{currentUser.reputation}</div>
              </div>
              <div className="bg-[#13141c] border border-gray-800/80 p-5 rounded-2xl text-center">
                <div className="text-xs text-gray-500 uppercase">Уровень привилегий</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">MAX</div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. УПРАВЛЕНИЕ АКТИВАЦИЯМИ ================= */}
        {activeTab === 'admin' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-[#13141c] border border-amber-600/30 p-5 rounded-2xl flex justify-between items-center">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Crown className="text-amber-400" size={20} /> Панель Владельца (Owner Root Control)
              </h2>
              <span className="text-xs font-mono text-gray-400">Система UID активна</span>
            </div>

            <div className="bg-[#13141c] border border-gray-800/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Список аккаунтов в системе</h3>
              <div className="p-3 bg-[#0d0e12] border border-amber-500/40 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-amber-400 font-bold bg-amber-950/60 px-2 py-1 rounded border border-amber-800">
                    UID #{currentUser.uid}
                  </span>
                  <span className="font-bold text-white">{currentUser.username}</span>
                </div>
                <span className="text-amber-400 font-bold border border-amber-600 bg-amber-950/70 px-2.5 py-1 rounded text-[10px]">
                  System Owner
                </span>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
