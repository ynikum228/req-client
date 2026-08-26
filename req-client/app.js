let currentTopicId = null;

// Список ролей и их настроек
const ROLES = {
    user: { title: 'Пользователь', class: 'role-user' },
    admin: { title: 'Администратор', class: 'role-admin' },
    tester: { title: 'Тестер', class: 'role-tester' },
    dev: { title: 'Разработчик', class: 'role-dev' },
    support: { title: 'Агент поддержки', class: 'role-support' }
};

// Функция отрисовки плашки роли
function getRoleBadgeHtml(roleKey) {
    const role = ROLES[roleKey] || ROLES.user;
    return `<span class="role-badge ${role.class}">${role.title}</span>`;
}

// Базовые данные по умолчанию
const defaultState = {
    currentUser: { 
        login: 'requiem', 
        role: 'dev',
        rep: 21, 
        posts: 1, 
        regDate: 'Сегодня',
        avatar: 'https://i.imgur.com/8Km9tLL.png',
        cover: ''
    },
    orders: [
        { id: 101, email: 'user@example.com', status: 'Оплачено (150 ₽)' }
    ],
    users: [
        { login: 'requiem', role: 'dev', rep: 21 },
        { login: '-812', role: 'admin', rep: 12 },
        { login: 'Tester_John', role: 'tester', rep: 5 },
        { login: 'Support_Alex', role: 'support', rep: 14 }
    ],
    topics: [
        { 
            id: 1, 
            title: 'вфы', 
            author: 'requiem', 
            likes: 0,
            posts: [
                { author: 'requiem', text: 'Первое тестовое сообщение темы.', date: 'Только что' }
            ]
        },
        { 
            id: 2, 
            title: 'Оптимизация FPS в CS2 на слабых ПК', 
            author: '-812', 
            likes: 18,
            posts: [
                { author: '-812', text: 'Инструкция по настройке параметров запуска и системного конфига.', date: '10 августа' }
            ] 
        }
    ]
};

// Сброс старого localStorage при обновлении версий ролей
(function checkVersion() {
    if (!localStorage.getItem('req_v2')) {
        localStorage.removeItem('req_state');
        localStorage.setItem('req_v2', 'true');
    }
})();

function getState() {
    const data = localStorage.getItem('req_state');
    return data ? JSON.parse(data) : defaultState;
}

function saveState(state) {
    localStorage.setItem('req_state', JSON.stringify(state));
    render();
}

function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Переключение вкладок
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`tab-${tabName}`);
    if (target) target.classList.add('active');
}

// Управление модалками
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function openPaymentModal() { openModal('payModal'); }

// Просмотр тем (Исправлено переключение)
function openTopic(id) {
    currentTopicId = Number(id);
    switchTab('topic-view');
    renderTopicView();
}

function renderTopicView() {
    const state = getState();
    const topic = state.topics.find(t => t.id === currentTopicId);
    if (!topic) return;

    const titleEl = document.getElementById('viewTopicTitle');
    const metaEl = document.getElementById('viewTopicMeta');
    
    if (titleEl) titleEl.textContent = topic.title;
    if (metaEl) metaEl.innerHTML = `Автор: <strong>${escapeHtml(topic.author)}</strong> | Сообщений: ${topic.posts.length}`;

    const container = document.getElementById('topicRepliesContainer');
    if (!container) return;

    container.innerHTML = topic.posts.map(p => {
        const authorObj = state.users.find(u => u.login === p.author) || { role: 'user' };
        return `
            <div class="post-card">
                <div class="post-author-box">
                    <img src="https://i.imgur.com/8Km9tLL.png" class="post-author-avatar">
                    <div class="post-author-name">${escapeHtml(p.author)}</div>
                    <div>${getRoleBadgeHtml(authorObj.role)}</div>
                </div>
                <div class="post-content-box">
                    <div class="post-text">${escapeHtml(p.text)}</div>
                    <div class="post-footer">
                        <span>Опубликовано: ${p.date || 'Недавно'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function submitReply() {
    const input = document.getElementById('newReplyText');
    const text = input.value.trim();
    if (!text) return alert('Введите текст ответа!');

    const state = getState();
    const topic = state.topics.find(t => t.id === currentTopicId);
    const authorName = state.currentUser ? state.currentUser.login : 'Гость';

    if (topic) {
        topic.posts.push({
            author: authorName,
            text: text,
            date: 'Только что'
        });

        if (state.currentUser) {
            state.currentUser.posts = (state.currentUser.posts || 0) + 1;
        }

        saveState(state);
        input.value = '';
        renderTopicView();
    }
}

// Изменение профиля
function changeAvatar() {
    const url = prompt('Введите URL новой аватарки:');
    if (url) {
        const state = getState();
        if (state.currentUser) {
            state.currentUser.avatar = url;
            saveState(state);
        }
    }
}

function changeCover() {
    const url = prompt('Введите URL обложки профиля:');
    if (url) {
        const state = getState();
        if (state.currentUser) {
            state.currentUser.cover = `url('${url}')`;
            saveState(state);
        }
    }
}

// Создание тем и лайки
function createTopic() {
    const title = document.getElementById('topicTitle').value.trim();
    const body = document.getElementById('topicBody').value.trim() || title;
    const state = getState();
    
    if(!title) return alert('Заполните заголовок!');

    const authorName = state.currentUser ? state.currentUser.login : 'Гость';

    state.topics.unshift({
        id: Date.now(),
        title: title,
        author: authorName,
        likes: 0,
        posts: [
            { author: authorName, text: body, date: 'Только что' }
        ]
    });

    if (state.currentUser) {
        state.currentUser.posts = (state.currentUser.posts || 0) + 1;
    }

    saveState(state);
    closeModal('createTopicModal');
    document.getElementById('topicTitle').value = '';
    document.getElementById('topicBody').value = '';
}

function likeTopic(topicId, event) {
    if (event) event.stopPropagation();
    const state = getState();
    const topic = state.topics.find(t => t.id === topicId);
    
    if (topic) {
        topic.likes = (topic.likes || 0) + 1;
        const author = state.users.find(u => u.login === topic.author);
        if (author) author.rep = (author.rep || 0) + 1;
        if (state.currentUser && state.currentUser.login === topic.author) {
            state.currentUser.rep = (state.currentUser.rep || 0) + 1;
        }
        saveState(state);
    }
}

// Авторизация
function openAuth(type) {
    document.getElementById('authModalTitle').textContent = type === 'login' ? 'Авторизация' : 'Регистрация';
    document.getElementById('authSubmitBtn').textContent = type === 'login' ? 'Войти' : 'Зарегистрироваться';
    openModal('authModal');
}

function handleAuth() {
    const login = document.getElementById('authLogin').value.trim();
    if(!login) return alert('Введите логин!');

    const state = getState();
    let userObj = state.users.find(u => u.login.toLowerCase() === login.toLowerCase());
    
    if (!userObj) {
        userObj = { login: login, role: 'user', rep: 0 };
        state.users.push(userObj);
    }

    state.currentUser = {
        login: userObj.login,
        role: userObj.role || 'user',
        rep: userObj.rep || 0,
        posts: 0,
        regDate: 'Сегодня',
        avatar: 'https://i.imgur.com/8Km9tLL.png'
    };

    saveState(state);
    closeModal('authModal');
}

function logout() {
    const state = getState();
    state.currentUser = null;
    saveState(state);
}

function deleteOrder(id) {
    const state = getState();
    state.orders = state.orders.filter(o => o.id !== id);
    saveState(state);
}

// Смена роли пользователя в Админке
function changeUserRole(login, newRole) {
    const state = getState();
    const u = state.users.find(x => x.login === login);
    if(u) {
        u.role = newRole;
        if (state.currentUser && state.currentUser.login === login) {
            state.currentUser.role = newRole;
        }
        saveState(state);
    }
}

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
    alert('Оплата на 150 ₽ прошла успешно!');
}

// Главный рендер интерфейса
function render() {
    const state = getState();
    const user = state.currentUser || { login: 'Гость', role: 'user', rep: 0, posts: 0, regDate: '-' };

    // 1. Шапка авторизации
    const authNav = document.getElementById('navAuth');
    if (authNav) {
        if (state.currentUser) {
            authNav.innerHTML = `
                <a href="#" onclick="switchTab('profile'); return false;" style="color:var(--yellow); font-size:13px; font-weight:700; text-decoration:none;">
                    <i class="fas fa-user-circle"></i> ${escapeHtml(state.currentUser.login)}
                </a>
                <button class="btn btn-outline btn-sm" onclick="logout()">Выйти</button>
            `;
        } else {
            authNav.innerHTML = `
                <button class="btn btn-outline btn-sm" onclick="openAuth('login')">Войти</button>
                <button class="btn btn-primary btn-sm" onclick="openAuth('reg')">Регистрация</button>
            `;
        }
    }

    // 2. Рендер Профиля (Отображение роли под ником)
    if (document.getElementById('profUsername')) {
        document.getElementById('profUsername').textContent = user.login;
        document.getElementById('profGroup').innerHTML = getRoleBadgeHtml(user.role);
        document.getElementById('profPosts').textContent = user.posts || 0;
        document.getElementById('profReg').textContent = user.regDate || '2 августа';
        document.getElementById('profRepScore').textContent = user.rep || 0;
        
        if (user.avatar) document.getElementById('profAvatar').src = user.avatar;
        if (user.cover) document.getElementById('profCover').style.background = user.cover;

        const repScore = user.rep || 0;
        let status = 'Нейтральная';
        if (repScore > 0 && repScore <= 10) status = 'Положительная';
        if (repScore > 10) status = 'Высокая';
        document.getElementById('profRepStatus').textContent = status;
    }

    // 3. Список тем на Форуме (Клик на тему открывает её)
    const forumContainer = document.getElementById('topicsContainer');
    if (forumContainer) {
        forumContainer.innerHTML = state.topics.map(t => `
            <div class="topic-item">
                <div class="topic-clickable" onclick="openTopic(${t.id})">
                    <div class="topic-info">
                        <h4>${escapeHtml(t.title)}</h4>
                        <p>Автор: <strong>${escapeHtml(t.author)}</strong> | Лайков: <span style="color:var(--accent); font-weight:700;">+${t.likes || 0}</span></p>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <button class="btn btn-outline btn-sm" onclick="likeTopic(${t.id}, event)">
                        <i class="fas fa-heart" style="color:#e67e22;"></i> +1
                    </button>
                    <span style="color:var(--yellow); font-size:13px; font-weight:700;">${t.posts ? t.posts.length : 0} ответов</span>
                </div>
            </div>
        `).join('');
    }

    // 4. Лента активности профиля
    const activityFeed = document.getElementById('profileActivityFeed');
    if (activityFeed) {
        const userTopics = state.topics.filter(t => t.author === user.login);
        if (userTopics.length === 0) {
            activityFeed.innerHTML = '<p class="empty-text">Сообщение не может быть отображено т.к. находится в защищенном разделе или нет активности.</p>';
        } else {
            activityFeed.innerHTML = userTopics.map(t => `
                <div class="act-item" onclick="openTopic(${t.id})" style="cursor:pointer;">
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

    // 5. Админ-Панель (Управление 5-ю ролями)
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

    const usersTbody = document.getElementById('adminUsersTable');
    if (usersTbody) {
        usersTbody.innerHTML = state.users.map(u => `
            <tr>
                <td>${escapeHtml(u.login)}</td>
                <td>${getRoleBadgeHtml(u.role)}</td>
                <td>
                    <select class="admin-select" onchange="changeUserRole('${u.login}', this.value)">
                        ${Object.keys(ROLES).map(r => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${ROLES[r].title}</option>`).join('')}
                    </select>
                </td>
            </tr>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', render);
