// ==========================================
// 1. ИНИЦИАЛИЗАЦИЯ И ХРАНЕНИЕ ДАННЫХ
// ==========================================

const defaultState = {
    currentUser: { 
        login: '-812', 
        gameNick: 'Rom_Roysfield', 
        city: 'Нет информации',
        rep: 12, 
        posts: 6, 
        regDate: '2 августа' 
    },
    orders: [
        { id: 101, email: 'user@example.com', status: 'Оплачено (150 ₽)' }
    ],
    users: [
        { login: '-812', role: 'user', rep: 12 },
        { login: 'Admin', role: 'admin', rep: 99 }
    ],
    topics: [
        { id: 1, title: '[Семья Roysfield] Заявление на трудоустройство в ЧОП "КитКат"', author: '-812', replies: 52, likes: 4 },
        { id: 2, title: 'Forum Games | Никнеймы', author: '-812', replies: 33, likes: 2 },
        { id: 3, title: 'Оптимизация FPS в CS2 на слабых ПК', author: 'Admin', replies: 12, likes: 18 }
    ]
};

// Загрузка состояния из LocalStorage
function getState() {
    const data = localStorage.getItem('req_state');
    return data ? JSON.parse(data) : defaultState;
}

// Сохранение состояния и автоматический перерендер
function saveState(state) {
    localStorage.setItem('req_state', JSON.stringify(state));
    render();
}

// Экранирование XSS
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ==========================================
// 2. НАВИГАЦИЯ И МОДАЛЬНЫЕ ОКНА
// ==========================================

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
}

function openModal(id) { 
    document.getElementById(id).classList.add('open'); 
}

function closeModal(id) { 
    document.getElementById(id).classList.remove('open'); 
}

function openPaymentModal() { 
    openModal('payModal'); 
}

// ==========================================
// 3. ЛОГИКА ФУНКЦИОНАЛА
// ==========================================

// Оплата подписки на 150 ₽
function processPayment() {
    const email = document.getElementById('payEmail').value;
    if (!email) return alert('Введите ваш Email!');

    const state = getState();
    state.orders.push({
        id: Math.floor(100 + Math.random() * 900),
        email: email,
        status: 'Оплачено (150 ₽)'
    });
    
    saveState(state);
    closeModal('payModal');
    alert('Оплата на 150 ₽ успешно выполнена! Подписка активирована.');
}

// Создание темы на форуме
function createTopic() {
    const title = document.getElementById('topicTitle').value;
    const state = getState();
    
    if(!title) return alert('Заполните заголовок темы!');

    const authorName = state.currentUser ? state.currentUser.login : 'Гость';

    state.topics.unshift({
        id: Date.now(),
        title: title,
        author: authorName,
        replies: 0,
        likes: 0
    });

    // Увеличение счетчика постов текущего юзера
    if (state.currentUser) {
        state.currentUser.posts = (state.currentUser.posts || 0) + 1;
    }

    saveState(state);
    closeModal('createTopicModal');
    document.getElementById('topicTitle').value = '';
    document.getElementById('topicBody').value = '';
}

// Система репутации (Лайк темы)
function likeTopic(topicId) {
    const state = getState();
    const topic = state.topics.find(t => t.id === topicId);
    
    if (topic) {
        topic.likes = (topic.likes || 0) + 1;
        
        // Поиск автора и начисление репутации
        const author = state.users.find(u => u.login === topic.author);
        if (author) {
            author.rep = (author.rep || 0) + 1;
        }
        
        // Если автор — текущий вошедший пользователь
        if (state.currentUser && state.currentUser.login === topic.author) {
            state.currentUser.rep = (state.currentUser.rep || 0) + 1;
        }
        
        saveState(state);
    }
}

// Авторизация
let authType = 'login';
function openAuth(type) {
    authType = type;
    document.getElementById('authModalTitle').textContent = type === 'login' ? 'Вход в аккаунт' : 'Регистрация';
    document.getElementById('authSubmitBtn').textContent = type === 'login' ? 'Войти' : 'Зарегистрироваться';
    openModal('authModal');
}

function handleAuth() {
    const login = document.getElementById('authLogin').value;
    if(!login) return alert('Введите логин!');

    const state = getState();
    
    // Если пользователя нет в базе — создаем
    let userObj = state.users.find(u => u.login === login);
    if (!userObj) {
        userObj = { login: login, role: 'user', rep: 0 };
        state.users.push(userObj);
    }

    state.currentUser = {
        login: userObj.login,
        gameNick: userObj.login,
        city: 'Не указан',
        rep: userObj.rep || 0,
        posts: 0,
        regDate: 'Сегодня'
    };

    saveState(state);
    closeModal('authModal');
}

function logout() {
    const state = getState();
    state.currentUser = null;
    saveState(state);
}

// Админ-панель: Управление заказом и ролями
function deleteOrder(id) {
    const state = getState();
    state.orders = state.orders.filter(o => o.id !== id);
    saveState(state);
}

function toggleRole(login) {
    const state = getState();
    const u = state.users.find(x => x.login === login);
    if(u) {
        u.role = u.role === 'admin' ? 'user' : 'admin';
        saveState(state);
    }
}

// ==========================================
// 4. ОТРИСОВКА ИНТЕРФЕЙСА (RENDER)
// ==========================================

function render() {
    const state = getState();
    const user = state.currentUser || { login: 'Гость', rep: 0, posts: 0, gameNick: 'Не указан', regDate: '-' };

    // 1. Шапка навигации
    const authNav = document.getElementById('navAuth');
    if (authNav) {
        if (state.currentUser) {
            authNav.innerHTML = `
                <a href="#" onclick="switchTab('profile')" style="color:var(--yellow); font-size:13px; font-weight:700; text-decoration:none;">
                    <i class="fas fa-user-circle"></i> ${escapeHtml(state.currentUser.login)}
                </a>
                <button class="btn btn-outline" style="padding:5px 10px; font-size:12px;" onclick="logout()">Выйти</button>
            `;
        } else {
            authNav.innerHTML = `
                <button class="btn btn-outline" onclick="openAuth('login')">Войти</button>
                <button class="btn btn-primary" onclick="openAuth('reg')">Регистрация</button>
            `;
        }
    }

    // 2. Данные профиля (MTA Province Style)
    if (document.getElementById('profUsername')) {
        document.getElementById('profUsername').textContent = user.login;
        document.getElementById('profPosts').textContent = user.posts || 0;
        document.getElementById('profReg').textContent = user.regDate || '2 августа';
        document.getElementById('profRepScore').textContent = user.rep || 0;
        
        if (document.getElementById('profGameNick')) {
            document.getElementById('profGameNick').textContent = user.gameNick || 'Не указан';
        }

        // Статус репутации
        const repScore = user.rep || 0;
        let status = 'Нейтральная';
        if (repScore > 0 && repScore <= 10) status = 'Положительная';
        if (repScore > 10) status = 'Высокая';
        if (repScore < 0) status = 'Отрицательная';
        
        const repStatusEl = document.getElementById('profRepStatus');
        if (repStatusEl) repStatusEl.textContent = status;
    }

    // 3. Форум — Список тем и репутация
    const forumContainer = document.getElementById('topicsContainer');
    if (forumContainer) {
        forumContainer.innerHTML = state.topics.map(t => `
            <div class="topic-item">
                <div class="topic-info">
                    <h4>${escapeHtml(t.title)}</h4>
                    <p>Автор: <strong>${escapeHtml(t.author)}</strong> | Репутация темы: <span style="color:var(--accent); font-weight:700;">+${t.likes || 0}</span></p>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <button class="btn btn-outline" style="padding:6px 10px; font-size:12px;" onclick="likeTopic(${t.id})">
                        <i class="fas fa-heart" style="color:#e67e22;"></i> +1
                    </button>
                    <span style="color:var(--yellow); font-size:13px; font-weight:700;">${t.replies} ответов</span>
                </div>
            </div>
        `).join('');
    }

    // 4. Лента активности в профиле
    const activityFeed = document.getElementById('profileActivityFeed');
    if (activityFeed) {
        const userTopics = state.topics.filter(t => t.author === user.login);
        if (userTopics.length === 0) {
            activityFeed.innerHTML = '<p class="empty-text">Сообщение не может быть отображено или нет активности.</p>';
        } else {
            activityFeed.innerHTML = userTopics.map(t => `
                <div class="act-item">
                    <i class="fas fa-comment act-icon"></i>
                    <div class="act-body">
                        <h5>${escapeHtml(t.title)}</h5>
                        <p><strong>${escapeHtml(user.login)}</strong> ответил или создал тему на форуме</p>
                        <span class="act-date">Недавно</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // 5. Админка — Заказы (150 ₽)
    const ordersTbody = document.getElementById('adminOrdersTable');
    if (ordersTbody) {
        ordersTbody.innerHTML = state.orders.map(o => `
            <tr>
                <td>${escapeHtml(o.email)}</td>
                <td><span style="color:#4cd964">${o.status}</span></td>
                <td><button style="color:#ff4d4d; background:none; border:0; cursor:pointer; font-weight:700;" onclick="deleteOrder(${o.id})">Удалить</button></td>
            </tr>
        `).join('');
    }

    // 6. Админка — Пользователи
    const usersTbody = document.getElementById('adminUsersTable');
    if (usersTbody) {
        usersTbody.innerHTML = state.users.map(u => `
            <tr>
                <td>${escapeHtml(u.login)}</td>
                <td><strong>${u.role}</strong></td>
                <td><button class="btn btn-outline" style="padding:2px 8px; font-size:11px;" onclick="toggleRole('${u.login}')">Сменить роль</button></td>
            </tr>
        `).join('');
    }
}

// Запуск при загрузке DOM
document.addEventListener('DOMContentLoaded', render);
