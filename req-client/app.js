import React, { useState } from 'react';
import { 
  Shield, User, MessageSquare, ThumbsUp, Lock, Plus, 
  Settings, Eye, FileText, Share2, CornerDownRight, LogOut 
} from 'lucide-react';

// Мок текущего пользователя
const INITIAL_USER = {
  id: 1,
  username: '-812',
  role: 'user', // Варианты: 'user', 'support', 'owner'
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  reputation: 0,
  posts: 6,
  joined: '2 августа',
  ingameNick: 'Rom_Roysfield',
  ingameCity: 'Нет информации',
  warnings: 0
};

// Мок сообщений в теме
const INITIAL_POSTS = [
  {
    id: 11504,
    author: '-812',
    role: 'Пользователь',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    likes: 0,
    postsCount: 6,
    ingameNick: 'Rom_Roysfield',
    ingameCity: 'Нет информации',
    date: '16 августа',
    category: 'Жалоба',
    content: 'Реж'
  },
  {
    id: 11505,
    author: 'Pablo_Moore',
    role: 'Администратор #4',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    likes: 294,
    postsCount: 853,
    ingameNick: '-',
    ingameCity: 'Нет информации',
    date: '16 августа',
    category: 'Жалоба',
    content: 'Ростов на Дону',
    spoilerTitle: 'Трудовая книга',
    spoilerContent: 'Информация о фракциях и должностях...'
  },
  {
    id: 11506,
    author: 'twelvest',
    role: 'Пользователь',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150',
    likes: 829,
    postsCount: 4866,
    ingameServer: '#2, #3, #6, #7',
    ingameCity: 'Мирный',
    date: '17 августа',
    category: 'Жалоба',
    content: 'Уфа',
    spoilerTitle: 'gospartia / reborn',
    spoilerContent: 'Скрытый контент темы...'
  }
];

export default function ForumApp() {
  const [currentUser, setCurrentUser] = useState(INITIAL_USER);
  const [activeTab, setActiveTab] = useState('topic'); // 'topic' | 'profile' | 'admin'
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [openSpoilers, setOpenSpoilers] = useState({});

  // Переключение спойлеров
  const toggleSpoiler = (id) => {
    setOpenSpoilers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Проверка доступа к админ-панели
  const hasAdminAccess = ['support', 'owner'].includes(currentUser.role);

  return (
    <div className="min-h-screen bg-[#16171d] text-[#b0b3b8] font-sans">
      {/* Верхняя навигация */}
      <header className="bg-[#1c1d24] border-b border-[#2a2b36] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-xl font-bold text-white tracking-wider cursor-pointer" onClick={() => setActiveTab('topic')}>
              PROVINCE <span className="text-xs text-orange-500 font-normal">DEMO</span>
            </span>
            <nav className="flex space-x-4 text-sm font-medium">
              <button onClick={() => setActiveTab('topic')} className={`hover:text-white px-2 py-1 ${activeTab === 'topic' ? 'text-white border-b-2 border-orange-500' : ''}`}>
                Форумы
              </button>
              <button onClick={() => setActiveTab('profile')} className={`hover:text-white px-2 py-1 ${activeTab === 'profile' ? 'text-white border-b-2 border-orange-500' : ''}`}>
                Профиль
              </button>
              {hasAdminAccess && (
                <button onClick={() => setActiveTab('admin')} className={`hover:text-white px-2 py-1 flex items-center gap-1 ${activeTab === 'admin' ? 'text-white border-b-2 border-orange-500' : 'text-orange-400'}`}>
                  <Shield size={14} /> Админка
                </button>
              )}
            </nav>
          </div>

          {/* Быстрое переключение ролей для теста */}
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-gray-400">Текущая роль:</span>
            <select 
              value={currentUser.role} 
              onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
              className="bg-[#24252f] text-white px-2 py-1 rounded border border-[#383a48] outline-none"
            >
              <option value="user">User (Обычный)</option>
              <option value="support">Support (Техподдержка)</option>
              <option value="owner">Owner (Владелец)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* 1. ПРОСМОТР ТЕМЫ */}
        {activeTab === 'topic' && (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold text-white mb-4">Города | Форумная игра</h1>
            
            {posts.map((post) => (
              <div key={post.id} className="bg-[#1c1d24] border border-[#2a2b36] rounded flex flex-col md:flex-row overflow-hidden">
                {/* Левая колонка: Профиль автора */}
                <div className="w-full md:w-64 bg-[#191a21] p-4 flex flex-col items-center border-r border-[#2a2b36] text-center text-xs">
                  <span className="text-gray-400 font-mono mb-2">#{post.id}</span>
                  <img src={post.avatar} alt={post.author} className="w-20 h-20 rounded-full object-cover border-2 border-[#2a2b36] mb-2" />
                  <span className="text-sm font-semibold text-[#4a8bf5] mb-1">{post.author}</span>
                  <span className="text-gray-400 mb-3">{post.role}</span>
                  
                  <div className="flex gap-4 my-2 text-gray-300">
                    <span className="flex items-center gap-1"><ThumbsUp size={12} /> {post.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.postsCount}</span>
                  </div>

                  <div className="w-full text-left mt-3 pt-3 border-t border-[#2a2b36] space-y-1 text-gray-400">
                    {post.ingameNick && <div>Игровой ник: <span className="text-gray-200">{post.ingameNick}</span></div>}
                    {post.ingameServer && <div>Игровой сервер: <span className="text-gray-200">{post.ingameServer}</span></div>}
                    <div>Город в игре: <span className="text-gray-200">{post.ingameCity}</span></div>
                  </div>
                </div>

                {/* Правая колонка: Содержимое поста */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-4 border-b border-[#2a2b36] pb-2">
                      <span>Опубликовано {post.date} · <span className="hover:underline cursor-pointer">{post.category}</span></span>
                      <span className="flex items-center gap-1"><Share2 size={12}/> ID: #{post.id}</span>
                    </div>

                    <div className="text-white text-base font-medium mb-4">
                      {post.content}
                    </div>

                    {/* Спойлер / Скрытый блок */}
                    {post.spoilerTitle && (
                      <div className="mt-4 border border-[#2a2b36] rounded bg-[#16171d]">
                        <button 
                          onClick={() => toggleSpoiler(post.id)}
                          className="w-full px-4 py-2 bg-[#025a9e] text-white font-semibold text-xs text-center hover:bg-[#024a82] transition"
                        >
                          {post.spoilerTitle}
                        </button>
                        
                        <div className="p-3 bg-[#1e1f29] text-xs">
                          <button 
                            onClick={() => toggleSpoiler(post.id)}
                            className="flex items-center gap-2 text-gray-300 hover:text-white font-mono bg-[#282936] px-3 py-1.5 rounded w-full border border-[#383a48]"
                          >
                            <CornerDownRight size={14} /> Показать контент
                          </button>

                          {openSpoilers[post.id] && (
                            <div className="mt-3 p-3 bg-[#16171d] text-gray-300 rounded border border-[#2a2b36]">
                              {post.spoilerContent}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-3 border-t border-[#2a2b36] text-xs text-gray-400">
                    <button className="flex items-center gap-1 hover:text-white"><Plus size={14} /> Цитата</button>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 bg-[#025a9e] text-white rounded-full hover:bg-blue-600"><ThumbsUp size={12} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Обложка и Шапка профиля */}
            <div className="bg-[#1c1d24] border border-[#2a2b36] rounded overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-slate-700 via-purple-900 to-slate-800 relative p-4 flex justify-end items-start gap-2">
                <button className="bg-[#00000066] hover:bg-[#000000aa] text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 backdrop-blur-sm">
                  <Settings size={12} /> Изменить профиль
                </button>
              </div>
              <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[#2a2b36] gap-4">
                <div className="flex items-end gap-4 -mt-12">
                  <img src={currentUser.avatar} alt="Avatar" className="w-28 h-28 rounded-full border-4 border-[#1c1d24] object-cover" />
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-white">{currentUser.username}</h2>
                    <span className="text-sm text-gray-400">Пользователь</span>
                  </div>
                </div>
                <div className="flex gap-6 text-xs text-center border-t md:border-t-0 border-[#2a2b36] pt-3 md:pt-0 w-full md:w-auto justify-around">
                  <div>
                    <div className="text-gray-400 uppercase text-[10px]">Постов</div>
                    <div className="text-white text-lg font-bold">{currentUser.posts}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 uppercase text-[10px]">Зарегистрирован</div>
                    <div className="text-white text-lg font-bold">{currentUser.joined}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Сетка инфо + активность */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Левый сайдбар профиля */}
              <div className="space-y-4">
                <div className="bg-[#ff8c00] text-black p-4 rounded text-center">
                  <div className="text-xs uppercase font-bold tracking-wider">Репутация</div>
                  <div className="text-3xl font-black">{currentUser.reputation}</div>
                  <div className="text-xs font-semibold">Нейтральная</div>
                </div>

                <div className="bg-[#1c1d24] border border-[#2a2b36] p-4 rounded text-center">
                  <div className="text-2xl font-bold text-white mb-1">{currentUser.warnings} баллов</div>
                  <div className="text-xs text-gray-400">предупреждений</div>
                </div>

                <div className="bg-[#1c1d24] border border-[#2a2b36] p-4 rounded text-xs space-y-3">
                  <div className="font-semibold text-white border-b border-[#2a2b36] pb-2">Информация о персонаже</div>
                  <div><span className="text-gray-400">Игровой ник:</span> <span className="text-white font-medium">{currentUser.ingameNick}</span></div>
                  <div><span className="text-gray-400">Город проживания:</span> <span className="text-white font-medium">{currentUser.ingameCity}</span></div>
                </div>
              </div>

              {/* Правая часть: Активность */}
              <div className="md:col-span-2 bg-[#1c1d24] border border-[#2a2b36] p-4 rounded">
                <h3 className="text-sm font-semibold text-white mb-4 border-b border-[#2a2b36] pb-2">Недавняя активность</h3>
                <div className="space-y-3">
                  {posts.filter(p => p.author === currentUser.username).map((post) => (
                    <div key={post.id} className="p-3 bg-[#16171d] rounded border border-[#2a2b36] text-xs">
                      <div className="text-gray-400 mb-1">Ответил в теме <span className="text-blue-400 font-medium">Forum Games | Города</span></div>
                      <div className="text-white font-medium">{post.content}</div>
                      <div className="text-[10px] text-gray-500 mt-2">{post.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. АДМИН-ПАНЕЛЬ (Защищенная) */}
        {activeTab === 'admin' && (
          <div>
            {!hasAdminAccess ? (
              <div className="bg-[#1c1d24] border border-red-900/50 p-8 rounded text-center max-w-md mx-auto mt-12">
                <Lock size={48} className="mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Доступ запрещен</h2>
                <p className="text-xs text-gray-400 mb-4">
                  Админ-панель доступна только пользователям с ролями <span className="text-orange-400 font-semibold">Support</span> или <span className="text-orange-400 font-semibold">Owner</span>.
                </p>
                <div className="text-xs bg-[#16171d] p-2 rounded text-gray-500">Ваша текущая роль: {currentUser.role}</div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-[#1c1d24] p-4 border border-[#2a2b36] rounded">
                  <div>
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                      <Shield className="text-orange-500" size={20} /> Панель Администратора
                    </h1>
                    <p className="text-xs text-gray-400">Управление контентом и правами пользователей</p>
                  </div>
                  <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded font-mono uppercase">
                    Права: {currentUser.role}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Управление постами */}
                  <div className="bg-[#1c1d24] p-4 border border-[#2a2b36] rounded">
                    <h3 className="text-sm font-semibold text-white mb-3">Модерация постов</h3>
                    <div className="space-y-2">
                      {posts.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-2 bg-[#16171d] rounded text-xs">
                          <div>
                            <span className="text-gray-400">#{p.id}</span> <span className="text-white font-medium">{p.author}:</span> {p.content}
                          </div>
                          <button 
                            onClick={() => setPosts(posts.filter(x => x.id !== p.id))}
                            className="text-red-400 hover:text-red-300 font-semibold px-2 py-1 bg-red-950/30 rounded border border-red-900/40"
                          >
                            Удалить
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Системные настройки */}
                  <div className="bg-[#1c1d24] p-4 border border-[#2a2b36] rounded space-y-3">
                    <h3 className="text-sm font-semibold text-white border-b border-[#2a2b36] pb-2">Системные действия</h3>
                    <button className="w-full text-left text-xs bg-[#24252f] hover:bg-[#2e303d] text-white p-2 rounded transition border border-[#383a48]">
                      Очистить кэш форума
                    </button>
                    <button className="w-full text-left text-xs bg-[#24252f] hover:bg-[#2e303d] text-white p-2 rounded transition border border-[#383a48]">
                      Выгрузить логи действий
                    </button>
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
