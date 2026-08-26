import React, { useState } from 'react';
import { 
  Shield, ThumbsUp, Terminal, Users, AlertTriangle, 
  MessageSquare, Star, Lock, CornerDownRight, Plus
} from 'lucide-react';

// Доступные роли
const ROLES = {
  user: { name: 'Пользователь', color: 'text-gray-400', bg: 'bg-gray-800' },
  tester: { name: 'Тестер', color: 'text-cyan-400', bg: 'bg-cyan-950/50 border-cyan-800' },
  support: { name: 'Агент поддержки', color: 'text-blue-400', bg: 'bg-blue-950/50 border-blue-800' },
  developer: { name: 'Разработчик', color: 'text-purple-400', bg: 'bg-purple-950/50 border-purple-800' },
  admin: { name: 'Администратор', color: 'text-red-400', bg: 'bg-red-950/50 border-red-800' }
};

const INITIAL_USERS = {
  '-812': { id: 1, username: '-812', role: 'admin', reputation: 0, warningPoints: 0, likedReviews: {} },
  'Pablo_Moore': { id: 2, username: 'Pablo_Moore', role: 'support', reputation: 12, warningPoints: 0, likedReviews: {} },
  'twelvest': { id: 3, username: 'twelvest', role: 'tester', reputation: 5, warningPoints: 0, likedReviews: {} }
};

export default function ReqClientApp() {
  const [currentUserKey, setCurrentUserKey] = useState('-812');
  const [activeView, setActiveView] = useState('reviews_list'); // 'reviews_list' | 'review_detail' | 'admin'
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  const [users, setUsers] = useState(INITIAL_USERS);
  const [reports, setReports] = useState([]);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      title: 'Отличный клиент req-client, рекомендую!',
      author: 'Pablo_Moore',
      rating: 5,
      date: 'Вчера, 18:20',
      content: 'Пользуюсь продуктом уже около месяца. Все функции работают стабильно, оптимизация на высоте.',
      likes: 4,
      comments: [
        { id: 101, author: 'twelvest', date: 'Вчера, 19:00', content: 'Согласен, оптимизация действительно порадовала.' }
      ]
    }
  ]);

  // Формы
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [commentText, setCommentText] = useState('');

  const currentUser = users[currentUserKey];
  const hasAdminAccess = ['support', 'admin'].includes(currentUser.role);

  // Проверка ограничений за баллы
  const isBanned = currentUser.warningPoints >= 80 || currentUser.warningPoints >= 10;

  // Создание отзыва
  const handleCreateReview = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || isBanned) return;

    const reviewId = Date.now();
    const newReview = {
      id: reviewId,
      title: newTitle,
      author: currentUser.username,
      rating: Number(newRating),
      date: 'Только что',
      content: newContent,
      likes: 0,
      comments: []
    };

    setReviews([newReview, ...reviews]);
    setNewTitle('');
    setNewContent('');
    setNewRating(5);
    setSelectedReviewId(reviewId);
    setActiveView('review_detail');
  };

  // Добавление комментария к отзыву
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() || isBanned) return;

    setReviews(reviews.map(r => {
      if (r.id === selectedReviewId) {
        return {
          ...r,
          comments: [
            ...r.comments,
            { id: Date.now(), author: currentUser.username, date: 'Только что', content: commentText }
          ]
        };
      }
      return r;
    }));
    setCommentText('');
  };

  // Защита от накрутки лайков (1 лайк от 1 пользователя)
  const handleLike = (reviewId, authorUsername) => {
    if (currentUser.username === authorUsername) return;
    const userLikes = currentUser.likedReviews || {};

    if (userLikes[reviewId]) {
      // Снять лайк
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, likes: r.likes - 1 } : r));
      setUsers({
        ...users,
        [currentUser.username]: { ...currentUser, likedReviews: { ...userLikes, [reviewId]: false } }
      });
    } else {
      // Поставить лайк
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, likes: r.likes + 1 } : r));
      setUsers({
        ...users,
        [currentUser.username]: { ...currentUser, likedReviews: { ...userLikes, [reviewId]: true } }
      });
    }
  };

  // Пожаловаться
  const handleReport = (reviewId, author) => {
    const reason = prompt('Укажите причину жалобы на отзыв:');
    if (!reason) return;

    setReports([...reports, { id: Date.now(), reviewId, author, reportedBy: currentUser.username, reason }]);
    alert('Жалоба отправлена модераторам.');
  };

  // Наказания
  const addWarningPoints = (username, points) => {
    setUsers(prev => ({
      ...prev,
      [username]: { ...prev[username], warningPoints: prev[username].warningPoints + points }
    }));
  };

  const selectedReview = reviews.find(r => r.id === selectedReviewId);

  return (
    <div className="min-h-screen bg-[#16171d] text-[#b0b3b8] font-sans">
      
      {/* HEADER */}
      <header className="bg-[#1c1d24] border-b border-[#2a2b36] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div 
            onClick={() => setActiveView('reviews_list')} 
            className="flex items-center gap-2 cursor-pointer font-bold text-white tracking-wider text-lg"
          >
            <Terminal className="text-orange-500" size={20} />
            REQ-CLIENT <span className="text-xs bg-orange-600/20 text-orange-400 px-2 py-0.5 rounded font-normal">Отзывы</span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActiveView('reviews_list')} 
              className={`text-xs px-3 py-1.5 rounded transition ${activeView !== 'admin' ? 'bg-[#282936] text-white' : 'hover:text-white'}`}
            >
              Все отзывы
            </button>

            {hasAdminAccess && (
              <button 
                onClick={() => setActiveView('admin')} 
                className={`text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition ${activeView === 'admin' ? 'bg-orange-600 text-white' : 'text-orange-400 hover:bg-[#282936]'}`}
              >
                <Shield size={13} /> Админка
              </button>
            )}

            {/* Быстрая смена пользователя */}
            <select 
              value={currentUserKey} 
              onChange={(e) => setCurrentUserKey(e.target.value)}
              className="bg-[#16171d] border border-[#2a2b36] text-xs text-white rounded px-2 py-1 outline-none cursor-pointer"
            >
              {Object.keys(users).map(key => (
                <option key={key} value={key}>
                  {key} ({ROLES[users[key].role]?.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-5xl mx-auto px-4 py-6">

        {/* ПРЕДУПРЕЖДЕНИЕ О БАНЕ */}
        {isBanned && (
          <div className="mb-6 bg-red-950/40 border border-red-800 p-4 rounded flex items-center gap-3 text-red-200 text-xs">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
            <div>Ваш аккаунт заблокирован или превысил лимит предупреждений ({currentUser.warningPoints}/80 баллов). Функция публикаций ограничена.</div>
          </div>
        )}

        {/* ================= 1. СПИСОК ОТЗЫВОВ ================= */}
        {activeView === 'reviews_list' && (
          <div className="space-y-6">
            
            {/* Форма публикации нового отзыва */}
            {!isBanned && (
              <div className="bg-[#1c1d24] border border-[#2a2b36] p-4 rounded space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Plus size={16} className="text-orange-500" /> Оставить отзыв о req-client
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input 
                    type="text"
                    placeholder="Заголовок отзыва..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="md:col-span-3 bg-[#16171d] border border-[#2a2b36] rounded p-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                  <select 
                    value={newRating}
                    onChange={(e) => setNewRating(e.target.value)}
                    className="bg-[#16171d] border border-[#2a2b36] text-xs text-yellow-400 rounded p-2 outline-none cursor-pointer"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                    <option value="3">⭐⭐⭐ (3/5)</option>
                    <option value="2">⭐⭐ (2/5)</option>
                    <option value="1">⭐ (1/5)</option>
                  </select>
                </div>

                <textarea 
                  placeholder="Опишите ваши впечатления от использования..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-[#16171d] border border-[#2a2b36] rounded p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 h-20 resize-none"
                ></textarea>

                <button 
                  onClick={handleCreateReview}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded text-xs transition"
                >
                  Опубликовать отзыв
                </button>
              </div>
            )}

            {/* Список отзывов */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-white border-b border-[#2a2b36] pb-2">Все отзывы ({reviews.length})</h2>
              
              {reviews.map((rev) => {
                const authorInfo = users[rev.author] || {};
                const role = ROLES[authorInfo.role] || ROLES.user;

                return (
                  <div 
                    key={rev.id} 
                    onClick={() => { setSelectedReviewId(rev.id); setActiveView('review_detail'); }}
                    className="bg-[#1c1d24] border border-[#2a2b36] hover:border-gray-600 p-4 rounded cursor-pointer transition space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-white hover:text-orange-400 transition">{rev.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="font-semibold text-gray-200">{rev.author}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] border ${role.color} ${role.bg}`}>{role.name}</span>
                          <span className="text-gray-500">• {rev.date}</span>
                        </div>
                      </div>

                      {/* Оценка в звёздах */}
                      <div className="flex text-yellow-400 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "text-gray-600"} />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 line-clamp-2">{rev.content}</p>

                    <div className="flex items-center gap-4 pt-2 text-[11px] text-gray-500 border-t border-[#2a2b36]">
                      <span className="flex items-center gap-1"><MessageSquare size={12} /> {rev.comments.length} комментариев</span>
                      <span className="flex items-center gap-1"><ThumbsUp size={12} /> {rev.likes} лайков</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ================= 2. ОТКРЫТЫЙ ОТЗЫВ (ОТКРЫВАЕТСЯ КОРРЕКТНО) ================= */}
        {activeView === 'review_detail' && selectedReview && (
          <div className="space-y-4">
            <button 
              onClick={() => setActiveView('reviews_list')}
              className="text-xs text-orange-400 hover:underline mb-2 inline-block"
            >
              ← Назад ко всем отзывам
            </button>

            {/* Карточка открытого отзыва */}
            <div className="bg-[#1c1d24] border border-[#2a2b36] p-5 rounded space-y-4">
              <div className="flex justify-between items-start border-b border-[#2a2b36] pb-3">
                <div>
                  <h1 className="text-xl font-bold text-white">{selectedReview.title}</h1>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="font-semibold text-gray-200">{selectedReview.author}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] border ${ROLES[users[selectedReview.author]?.role]?.color || ROLES.user.color} ${ROLES[users[selectedReview.author]?.role]?.bg || ROLES.user.bg}`}>
                      {ROLES[users[selectedReview.author]?.role]?.name || 'Пользователь'}
                    </span>
                    <span className="text-gray-500">• {selectedReview.date}</span>
                  </div>
                </div>

                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < selectedReview.rating ? "currentColor" : "none"} className={i < selectedReview.rating ? "" : "text-gray-600"} />
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-200 leading-relaxed">
                {selectedReview.content}
              </div>

              {/* Панель лайков и жалоб */}
              <div className="flex justify-between items-center pt-3 border-t border-[#2a2b36] text-xs">
                <button 
                  onClick={() => handleReport(selectedReview.id, selectedReview.author)}
                  className="text-red-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <AlertTriangle size={12} /> Пожаловаться
                </button>

                <button 
                  onClick={() => handleLike(selectedReview.id, selectedReview.author)}
                  disabled={currentUser.username === selectedReview.author}
                  className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs transition ${
                    (currentUser.likedReviews || {})[selectedReview.id] 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-[#24252f] text-gray-300 hover:bg-[#323443]'
                  } ${currentUser.username === selectedReview.author ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ThumbsUp size={12} />
                  <span>{selectedReview.likes}</span>
                </button>
              </div>
            </div>

            {/* Блок комментариев */}
            <div className="bg-[#1c1d24] border border-[#2a2b36] p-4 rounded space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Комментарии ({selectedReview.comments.length})</h3>

              <div className="space-y-2">
                {selectedReview.comments.map(c => (
                  <div key={c.id} className="bg-[#16171d] p-3 rounded border border-[#2a2b36] text-xs space-y-1">
                    <div className="flex justify-between text-gray-400">
                      <span className="font-bold text-gray-200">{c.author}</span>
                      <span className="text-[10px]">{c.date}</span>
                    </div>
                    <p className="text-gray-300">{c.content}</p>
                  </div>
                ))}
              </div>

              {/* Форма добавления комментария */}
              {!isBanned && (
                <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-[#2a2b36]">
                  <input 
                    type="text"
                    placeholder="Написать ответ к отзыву..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 bg-[#16171d] border border-[#2a2b36] text-xs text-white rounded p-2 focus:outline-none focus:border-orange-500"
                  />
                  <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white text-xs px-4 py-2 rounded font-semibold transition">
                    Отправить
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ================= 3. АДМИН-ПАНЕЛЬ ================= */}
        {activeView === 'admin' && hasAdminAccess && (
          <div className="bg-[#1c1d24] border border-[#2a2b36] p-5 rounded space-y-5">
            <h1 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#2a2b36] pb-3">
              <Shield className="text-orange-500" size={18} /> Модерация отзывов и пользователей
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Управление баллами и ролями */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-white uppercase">Пользователи</h3>
                {Object.values(users).map(u => (
                  <div key={u.id} className="p-3 bg-[#16171d] border border-[#2a2b36] rounded text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-white">{u.username}</span>
                      <span className="text-red-400">{u.warningPoints} баллов</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => addWarningPoints(u.username, 10)} className="px-2 py-1 bg-yellow-950/40 text-yellow-400 border border-yellow-800 rounded text-[10px]">+10 б. (Мут)</button>
                      <button onClick={() => addWarningPoints(u.username, 80)} className="px-2 py-1 bg-red-950/40 text-red-400 border border-red-800 rounded text-[10px]">+80 б. (Бан)</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Жалобы */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-white uppercase">Поступившие жалобы ({reports.length})</h3>
                {reports.length === 0 ? (
                  <div className="text-xs text-gray-500">Жалоб нет</div>
                ) : (
                  reports.map(rep => (
                    <div key={rep.id} className="p-3 bg-[#16171d] border border-[#2a2b36] rounded text-xs space-y-1">
                      <div className="text-red-400 font-bold">На автора: {rep.author}</div>
                      <div className="text-gray-300">Причина: {rep.reason}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
