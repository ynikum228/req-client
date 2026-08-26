import React, { useState } from 'react';
import { 
  Shield, User, MessageSquare, ThumbsUp, Lock, Plus, 
  Settings, Share2, CornerDownRight, Terminal, Users, 
  FileText, AlertCircle, Ban, Code, Headphones, AlertTriangle
} from 'lucide-react';

// Доступные роли и их отображение
const ROLES = {
  user: { name: 'Пользователь', color: 'text-gray-400', bg: 'bg-gray-800' },
  tester: { name: 'Тестер', color: 'text-cyan-400', bg: 'bg-cyan-950/50 border-cyan-800' },
  support: { name: 'Агент поддержки', color: 'text-blue-400', bg: 'bg-blue-950/50 border-blue-800' },
  developer: { name: 'Разработчик', color: 'text-purple-400', bg: 'bg-purple-950/50 border-purple-800' },
  admin: { name: 'Администратор', color: 'text-red-400', bg: 'bg-red-950/50 border-red-800' }
};

// Инициализация пользователей
const INITIAL_USERS = {
  '-812': {
    id: 1,
    username: '-812',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    reputation: 0,
    postsCount: 0,
    joined: '2 августа',
    warningPoints: 0,
    bannedUntil: null,
    isPermanentBanned: false,
    likedPosts: {} // Защита от накрутки: { postId: true }
  },
  'Pablo_Moore': {
    id: 2,
    username: 'Pablo_Moore',
    role: 'support',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    reputation: 15,
    postsCount: 0,
    joined: '15 января',
    warningPoints: 0,
    bannedUntil: null,
    isPermanentBanned: false,
    likedPosts: {}
  },
  'twelvest': {
    id: 3,
    username: 'twelvest',
    role: 'tester',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150',
    reputation: 5,
    postsCount: 0,
    joined: '10 марта',
    warningPoints: 0,
    bannedUntil: null,
    isPermanentBanned: false,
    likedPosts: {}
  }
};

export default function ReqClientApp() {
  const [currentUserKey, setCurrentUserKey] = useState('-812');
  const [activeTab, setActiveTab] = useState('topics_list'); // 'topics_list' | 'topic_view' | 'profile' | 'admin'
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [viewingProfile, setViewingProfile] = useState('-812');

  const [users, setUsers] = useState(INITIAL_USERS);
  const [topics, setTopics] = useState([]); // Все темы очищены
  const [reports, setReports] = useState([]); // Жалобы

  // Создание новой темы
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newPostText, setNewPostText] = useState('');
  const [openSpoilers, setOpenSpoilers] = useState({});

  // Текущий пользователь
  const currentUser = users[currentUserKey];
  const profileUser = users[viewingProfile] || currentUser;

  // Проверка прав (support или admin)
  const hasAdminAccess = ['support', 'admin'].includes(currentUser.role);

  // --- ЛОГИКА БЛОКИРОВОК И БАЛЛОВ НАКАЗАНИЯ ---
  const checkBanStatus = (user) => {
    if (user.isPermanentBanned || user.warningPoints >= 80) {
      return { isBanned: true, reason: 'Форум закрыт навсегда (80+ баллов)', perm: true };
    }
    if (user.bannedUntil && new Date() < new Date(user.bannedUntil)) {
      return { isBanned: true, reason: `Мут/Блок до ${new Date(user.bannedUntil).toLocaleDateString()}`, perm: false };
    }
    return { isBanned: false };
  };

  const currentUserBan = checkBanStatus(currentUser);

  // Добавление предупреждений (Админ-панель)
  const addWarningPoints = (username, points) => {
    setUsers(prev => {
      const user = prev[username];
      const newPoints = user.warningPoints + points;
      let bannedUntil = user.bannedUntil;
      let isPermanentBanned = user.isPermanentBanned;

      const now = new Date();
      if (newPoints >= 80) {
        isPermanentBanned = true;
      } else if (newPoints >= 30) {
        const banDate = new Date();
        banDate.setDate(now.getDate() + 30);
        bannedUntil = banDate.toISOString();
      } else if (newPoints >= 10) {
        const banDate = new Date();
        banDate.setDate(now.getDate() + 7);
        bannedUntil = banDate.toISOString();
      }

      return {
        ...prev,
        [username]: {
          ...user,
          warningPoints: newPoints,
          bannedUntil,
          isPermanentBanned
        }
      };
    });
  };

  // --- ЛОГИКА ТЕМ И СООБЩЕНИЙ ---
  const handleCreateTopic = (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim() || currentUserBan.isBanned) return;

    const topicId = Date.now();
    const newTopic = {
      id: topicId,
      title: newTopicTitle,
      author: currentUser.username,
      date: 'Только что',
      posts: [
        {
          id: 1,
          author: currentUser.username,
          date: 'Только что',
          content: newTopicContent,
          likes: 0
        }
      ]
    };

    setTopics([...topics, newTopic]);
    setUsers(prev => ({
      ...prev,
      [currentUser.username]: { ...prev[currentUser.username], postsCount: prev[currentUser.username].postsCount + 1 }
    }));
    setNewTopicTitle('');
    setNewTopicContent('');
    setSelectedTopicId(topicId);
    setActiveTab('topic_view');
  };

  const handleAddPost = (e) => {
    e.preventDefault();
    if (!newPostText.trim() || currentUserBan.isBanned) return;

    setTopics(topics.map(t => {
      if (t.id === selectedTopicId) {
        return {
          ...t,
          posts: [
            ...t.posts,
            {
              id: Date.now(),
              author: currentUser.username,
              date: 'Только что',
              content: newPostText,
              likes: 0
            }
          ]
        };
      }
      return t;
    }));

    setUsers(prev => ({
      ...prev,
      [currentUser.username]: { ...prev[currentUser.username], postsCount: prev[currentUser.username].postsCount + 1 }
    }));
    setNewPostText('');
  };

  // --- ИСПРАВЛЕНИЕ БАГА РЕПУТАЦИИ (Один лайк от пользователя на сообщение) ---
  const handleLikePost = (postId, authorUsername) => {
    const userLikes = currentUser.likedPosts || {};
    
    // Защита: нельзя лайкать свои сообщения
    if (currentUser.username === authorUsername) return;

    // Если уже ставил лайк
    if (userLikes[postId]) {
      // Снимаем лайк
      setTopics(topics.map(t => ({
        ...t,
        posts: t.posts.map(p => p.id === postId ? { ...p, likes: p.likes - 1 } : p)
      })));
      setUsers(prev => ({
        ...prev,
        [authorUsername]: { ...prev[authorUsername], reputation: prev[authorUsername].reputation - 1 },
        [currentUser.username]: { 
          ...prev[currentUser.username], 
          likedPosts: { ...prev[currentUser.username].likedPosts, [postId]: false } 
        }
      }));
    } else {
      // Ставим 1 лайк
      setTopics(topics.map(t => ({
        ...t,
        posts: t.posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p)
      })));
      setUsers(prev => ({
        ...prev,
        [authorUsername]: { ...prev[authorUsername], reputation: prev[authorUsername].reputation + 1 },
        [currentUser.username]: { 
          ...prev[currentUser.username], 
          likedPosts: { ...prev[currentUser.username].likedPosts, [postId]: true } 
        }
      }));
    }
  };

  // --- СИСТЕМА ЖАЛОБ ---
  const handleReportPost = (postId, postContent, author) => {
    const reason = prompt('Укажите причину жалобы:');
    if (!reason) return;

    setReports([...reports, {
      id: Date.now(),
      postId,
      postContent,
      author,
      reportedBy: currentUser.username,
      reason
    }]);
    alert('Жалоба отправлена администрации!');
  };

  const openUserProfile = (username) => {
    setViewingProfile(username);
    setActiveTab('profile');
  };

  const currentTopic = topics.find(t => t.id === selectedTopicId);

  return (
    <div className="min-h-screen bg-[#16171d] text-[#b0b3b8] font-sans">
      
      {/* ─── HEADER ─── */}
      <header className="bg-[#1c1d24] border-b border-[#2a2b36] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div 
              onClick={() => setActiveTab('topics_list')} 
              className="flex items-center gap-2 cursor-pointer font-bold text-white tracking-wider text-lg"
            >
              <Terminal className="text-orange-500" size={20} />
              REQ-CLIENT
            </div>
            
            <nav className="flex space-x-2 text-sm font-medium">
              <button 
                onClick={() => setActiveTab('topics_list')} 
                className={`px-3 py-1.5 rounded transition ${activeTab === 'topics_list' || activeTab === 'topic_view' ? 'bg-[#282936] text-white' : 'hover:text-white'}`}
              >
                Форум
              </button>
              <button 
                onClick={() => openUserProfile(currentUser.username)} 
                className={`px-3 py-1.5 rounded transition ${activeTab === 'profile' ? 'bg-[#282936] text-white' : 'hover:text-white'}`}
              >
                Профиль
              </button>
              
              <button 
                onClick={() => setActiveTab('admin')} 
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition ${
                  activeTab === 'admin' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:bg-[#282936]'
                }`}
              >
                <Shield size={14} /> Админка
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-[#16171d] px-3 py-1.5 rounded border border-[#2a2b36]">
            <span className="text-gray-400">Аккаунт:</span>
            <select 
              value={currentUserKey} 
              onChange={(e) => setCurrentUserKey(e.target.value)}
              className="bg-transparent text-white font-semibold outline-none cursor-pointer"
            >
              {Object.keys(users).map(key => (
                <option key={key} value={key} className="bg-[#1c1d24] text-white">
                  {key} ({ROLES[users[key].role]?.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ─── ОСНОВНОЙ КОНТЕНТ ─── */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* ПРЕУПРЕЖДЕНИЕ О БЛОКИРОВКЕ */}
        {currentUserBan.isBanned && (
          <div className="mb-6 bg-red-950/40 border border-red-800 p-4 rounded flex items-center gap-3 text-red-200 text-xs">
            <AlertOctagon size={20} className="text-red-500 flex-shrink-0" />
            <div>
              <span className="font-bold">Ограничение доступа:</span> {currentUserBan.reason}. Публикация тем и сообщений заблокирована.
            </div>
          </div>
        )}

        {/* ================= 1. СПИСОК ТЕМ ================= */}
        {activeTab === 'topics_list' && (
          <div className="space-y-6">
            {/* Форма создания темы */}
            {!currentUserBan.isBanned && (
              <div className="bg-[#1c1d24] border border-[#2a2b36] p-4 rounded space-y-3">
                <h3 className="text-sm font-semibold text-white">Создать новую тему</h3>
                <input 
                  type="text"
                  placeholder="Заголовок темы..."
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className="w-full bg-[#16171d] border border-[#2a2b36] rounded p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
                <textarea 
                  placeholder="Содержимое темы..."
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  className="w-full bg-[#16171d] border border-[#2a2b36] rounded p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 h-20 resize-none"
                ></textarea>
                <button 
                  onClick={handleCreateTopic}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded text-xs transition"
                >
                  Опубликовать тему
                </button>
              </div>
            )}

            {/* Список всех тем */}
            <div className="bg-[#1c1d24] border border-[#2a2b36] rounded overflow-hidden">
              <div className="bg-[#191a21] px-4 py-3 border-b border-[#2a2b36] text-xs font-semibold text-white">
                Все темы
              </div>
              <div className="divide-y divide-[#2a2b36]">
                {topics.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500">
                    На форуме пока нет тем. Будьте первым, кто создаст тему!
                  </div>
                ) : (
                  topics.map(topic => {
                    const author = users[topic.author] || {};
                    const roleInfo = ROLES[author.role] || ROLES.user;

                    return (
                      <div 
                        key={topic.id} 
                        onClick={() => { setSelectedTopicId(topic.id); setActiveTab('topic_view'); }}
                        className="p-4 flex items-center justify-between hover:bg-[#20222c] cursor-pointer transition"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white hover:text-orange-400 transition mb-1">
                            {topic.title}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-2">
                            <span>Автор: <strong className="text-gray-200">{topic.author}</strong></span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${roleInfo.color} ${roleInfo.bg}`}>
                              {roleInfo.name}
                            </span>
                            <span>• {topic.date}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {topic.posts.length} ответов
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. ПРОСМОТР ТЕМЫ ================= */}
        {activeTab === 'topic_view' && currentTopic && (
          <div className="space-y-4">
            <button 
              onClick={() => setActiveTab('topics_list')}
              className="text-xs text-orange-400 hover:underline mb-2 inline-block"
            >
              ← Назад к списку тем
            </button>

            <div className="bg-[#1c1d24] p-4 border border-[#2a2b36] rounded">
              <h1 className="text-lg font-bold text-white">{currentTopic.title}</h1>
            </div>

            {/* Сообщения темы */}
            {currentTopic.posts.map((post) => {
              const author = users[post.author] || {
                username: post.author,
                role: 'user',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                reputation: 0,
                postsCount: 0
              };
              const roleInfo = ROLES[author.role] || ROLES.user;
              const hasLiked = (currentUser.likedPosts || {})[post.id];

              return (
                <div key={post.id} className="bg-[#1c1d24] border border-[#2a2b36] rounded flex flex-col md:flex-row overflow-hidden">
                  
                  {/* Профиль автора (слева) */}
                  <div className="w-full md:w-60 bg-[#191a21] p-4 flex flex-col items-center border-r border-[#2a2b36] text-center text-xs">
                    <img 
                      src={author.avatar} 
                      alt={author.username} 
                      onClick={() => openUserProfile(author.username)}
                      className="w-20 h-20 rounded-full object-cover border-2 border-[#2a2b36] mb-2 cursor-pointer hover:opacity-80 transition" 
                    />
                    
                    <span 
                      onClick={() => openUserProfile(author.username)}
                      className="text-sm font-bold text-[#4a8bf5] hover:underline cursor-pointer mb-1"
                    >
                      {author.username}
                    </span>
                    
                    {/* РОЛЬ ПОЛЬЗОВАТЕЛЯ */}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border mb-3 ${roleInfo.color} ${roleInfo.bg}`}>
                      {roleInfo.name}
                    </span>
                    
                    <div className="flex gap-4 my-1 text-gray-300">
                      <span className="flex items-center gap-1" title="Репутация"><ThumbsUp size={12} /> {author.reputation}</span>
                      <span className="flex items-center gap-1" title="Посты"><MessageSquare size={12} /> {author.postsCount}</span>
                    </div>

                    {author.warningPoints > 0 && (
                      <div className="mt-2 text-red-400 font-bold text-[10px] bg-red-950/30 px-2 py-1 rounded border border-red-900/40">
                        Баллы нарушений: {author.warningPoints}
                      </div>
                    )}
                  </div>

                  {/* Контент поста */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs text-gray-400 mb-4 border-b border-[#2a2b36] pb-2">
                        <span>Опубликовано {post.date}</span>
                        <button 
                          onClick={() => handleReportPost(post.id, post.content, author.username)}
                          className="text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                          <AlertTriangle size={12} /> Пожаловаться
                        </button>
                      </div>

                      <div className="text-white text-base font-medium mb-4">
                        {post.content}
                      </div>
                    </div>

                    <div className="flex justify-end items-center mt-6 pt-3 border-t border-[#2a2b36] text-xs">
                      {/* Кнопка лайка с защитой от накрутки */}
                      <button 
                        onClick={() => handleLikePost(post.id, author.username)}
                        disabled={currentUser.username === author.username}
                        className={`p-1.5 rounded-full transition flex items-center gap-1.5 px-3 ${
                          hasLiked 
                            ? 'bg-orange-600 text-white' 
                            : 'bg-[#24252f] text-gray-300 hover:bg-[#323443]'
                        } ${currentUser.username === author.username ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <ThumbsUp size={12} />
                        <span>{post.likes}</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}

            {/* Форма ответа (Если нет бана) */}
            {!currentUserBan.isBanned ? (
              <form onSubmit={handleAddPost} className="bg-[#1c1d24] border border-[#2a2b36] p-4 rounded space-y-3">
                <h3 className="text-sm font-semibold text-white">Написать ответ</h3>
                <textarea 
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="Ваш ответ в тему..."
                  className="w-full bg-[#16171d] border border-[#2a2b36] rounded p-3 text-sm text-white focus:outline-none focus:border-orange-500 h-24 resize-none"
                ></textarea>
                <button 
                  type="submit" 
                  className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded text-xs transition"
                >
                  Отправить
                </button>
              </form>
            ) : (
              <div className="bg-[#1c1d24] p-4 rounded text-center text-xs text-red-400 border border-red-900/30">
                Публикация ответов ограничена из-за баллов предупреждения.
              </div>
            )}
          </div>
        )}

        {/* ================= 3. ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-[#1c1d24] border border-[#2a2b36] rounded overflow-hidden">
              <div className="h-44 bg-gradient-to-r from-slate-900 via-zinc-900 to-orange-950 relative p-4 flex justify-end items-start"></div>
              
              <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[#2a2b36] gap-4">
                <div className="flex items-end gap-4 -mt-10">
                  <img 
                    src={profileUser.avatar} 
                    alt="Avatar" 
                    className="w-24 h-24 rounded-full border-4 border-[#1c1d24] object-cover bg-[#16171d]" 
                  />
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      {profileUser.username}
                      <span className={`text-xs px-2 py-0.5 rounded border ${ROLES[profileUser.role]?.color} ${ROLES[profileUser.role]?.bg}`}>
                        {ROLES[profileUser.role]?.name}
                      </span>
                    </h2>
                  </div>
                </div>
                
                <div className="flex gap-6 text-xs text-center border-t md:border-t-0 border-[#2a2b36] pt-3 md:pt-0 w-full md:w-auto justify-around">
                  <div>
                    <div className="text-gray-400 uppercase text-[10px]">Постов</div>
                    <div className="text-white text-lg font-bold">{profileUser.postsCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 uppercase text-[10px]">Зарегистрирован</div>
                    <div className="text-white text-lg font-bold">{profileUser.joined}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="bg-orange-600 text-black p-4 rounded text-center">
                  <div className="text-xs uppercase font-bold tracking-wider opacity-80">Репутация</div>
                  <div className="text-3xl font-black">{profileUser.reputation}</div>
                </div>

                <div className="bg-[#1c1d24] border border-[#2a2b36] p-4 rounded text-center">
                  <div className="text-2xl font-bold text-red-400 mb-1">{profileUser.warningPoints} / 80</div>
                  <div className="text-xs text-gray-400">Баллов предупреждений</div>
                </div>
              </div>

              <div className="md:col-span-2 bg-[#1c1d24] border border-[#2a2b36] p-4 rounded">
                <h3 className="text-sm font-semibold text-white mb-4 border-b border-[#2a2b36] pb-2">Статус аккаунта</h3>
                <div className="space-y-2 text-xs">
                  <div>Состояние: {profileUser.isPermanentBanned ? <span className="text-red-500 font-bold">Заблокирован навсегда</span> : <span className="text-green-400 font-bold">Активен</span>}</div>
                  {profileUser.bannedUntil && (
                    <div className="text-orange-400">Ограничение на публикацию действует до: {new Date(profileUser.bannedUntil).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. АДМИН-ПАНЕЛЬ ================= */}
        {activeTab === 'admin' && (
          <div>
            {!hasAdminAccess ? (
              <div className="bg-[#1c1d24] border border-red-900/50 p-8 rounded text-center max-w-md mx-auto mt-12 space-y-4">
                <Lock size={32} className="mx-auto text-red-500" />
                <h2 className="text-xl font-bold text-white">Доступ ограничен</h2>
                <p className="text-xs text-gray-400">Требуется роль Агента поддержки или Администратора.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-[#1c1d24] p-4 border border-[#2a2b36] rounded">
                  <h1 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="text-orange-500" size={20} /> Администрирование req-client
                  </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Управление ролями и предупреждениями */}
                  <div className="bg-[#1c1d24] p-4 border border-[#2a2b36] rounded space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-[#2a2b36] pb-2">
                      <Users size={16} /> Пользователи и выдача баллов
                    </h3>

                    <div className="space-y-3">
                      {Object.values(users).map((u) => (
                        <div key={u.id} className="p-3 bg-[#16171d] rounded border border-[#2a2b36] text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-bold">{u.username}</span>
                            <span className="text-red-400 font-semibold">{u.warningPoints} баллов</span>
                          </div>

                          <div className="flex gap-2">
                            {/* Выдача баллов */}
                            <button 
                              onClick={() => addWarningPoints(u.username, 10)}
                              className="px-2 py-1 bg-yellow-950/40 text-yellow-400 border border-yellow-800 rounded text-[10px]"
                            >
                              +10 баллов (7д мут)
                            </button>
                            <button 
                              onClick={() => addWarningPoints(u.username, 30)}
                              className="px-2 py-1 bg-orange-950/40 text-orange-400 border border-orange-800 rounded text-[10px]"
                            >
                              +30 баллов (30д мут)
                            </button>
                            <button 
                              onClick={() => addWarningPoints(u.username, 80)}
                              className="px-2 py-1 bg-red-950/40 text-red-400 border border-red-800 rounded text-[10px]"
                            >
                              +80 баллов (Бан)
                            </button>
                          </div>

                          {/* Изменение роли */}
                          <div className="flex items-center gap-2 pt-2 border-t border-[#2a2b36]">
                            <span className="text-gray-400">Роль:</span>
                            <select 
                              value={u.role} 
                              onChange={(e) => setUsers({
                                ...users,
                                [u.username]: { ...users[u.username], role: e.target.value }
                              })}
                              className="bg-[#24252f] text-white px-2 py-1 rounded border border-[#383a48] outline-none"
                            >
                              <option value="user">Пользователь</option>
                              <option value="tester">Тестер</option>
                              <option value="support">Агент поддержки</option>
                              <option value="developer">Разработчик</option>
                              <option value="admin">Администратор</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Жалобы */}
                  <div className="bg-[#1c1d24] p-4 border border-[#2a2b36] rounded space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-[#2a2b36] pb-2">
                      <AlertTriangle size={16} /> Поступившие жалобы ({reports.length})
                    </h3>

                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {reports.length === 0 ? (
                        <div className="text-xs text-gray-500 py-4 text-center">Жалоб нет</div>
                      ) : (
                        reports.map(rep => (
                          <div key={rep.id} className="p-3 bg-[#16171d] rounded border border-[#2a2b36] text-xs space-y-1">
                            <div className="text-red-400 font-bold">На нарушителя: {rep.author}</div>
                            <div className="text-gray-300">Причина: {rep.reason}</div>
                            <div className="text-gray-500 text-[10px]">Отправил: {rep.reportedBy}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
