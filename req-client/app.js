// Default State
const defaultState = {
    currentUser: { 
        login: '-812', 
        gameNick: 'Rom_Roysfield', 
        city: 'Приазовье',
        rep: 12, 
        posts: 6, 
        regDate: '2 августа',
        avatar: 'https://i.imgur.com/8Km9tLL.png',
        cover: 'linear-gradient(135deg, #2b1b36 0%, #150d1a 50%, #3d1b28 100%)'
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

function getState() {
    const data = localStorage.getItem('req_state');
    return data ? JSON.parse(data) : defaultState;
}

function saveState(state) {
    localStorage.setItem('req_state', JSON.stringify(state));
    render();
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Navigation & Modals
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`tab-${tabName}`);
    if (target) target.classList.add('active');
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function openPaymentModal() { openModal('payModal'); }

// Profile Customization
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

// Core Functions
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

function createTopic() {
    const title = document.getElementById('topicTitle').value;
    const state = getState();
    
    if(!title) return alert('Заполните заголовок!');

    const authorName = state.currentUser ? state.currentUser.login : 'Гость';

    state.topics.unshift({
        id: Date.now(),
        title: title,
        author: authorName,
        replies: 0,
        likes: 0
    });

    if (state.currentUser) {
        state.currentUser.posts = (state.currentUser.posts || 0) + 1;
    }

    saveState(state);
    closeModal('createTopicModal');
    document.getElementById('topicTitle').value = '';
    document.getElementById('topicBody').value = '';
}

function likeTopic(topicId) {
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

// Auth Logic
let authType = 'login';
function openAuth(type) {
    authType = type;
    document.getElementById('authModalTitle').textContent = type === 'login' ? 'Авторизация' : 'Регистрация';
    document.getElementById('authSubmitBtn').textContent = type === 'login' ? 'Войти' : 'Зарегистрироваться';
    openModal('authModal');
}

function handleAuth() {
    const login = document.getElementById('authLogin').value;
    const gameNick = document.getElementById('authGameNick').value || login;
    if(!login) return alert('Введите логин!');

    const state = getState();
    let userObj = state.users.find(u => u.login === login);
    if (!userObj) {
        userObj = { login: login, role: 'user', rep: 0 };
        state.users.push(userObj);
    }

    state.currentUser = {
        login: userObj.login,
        gameNick: gameNick,
        city: 'Не указан',
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

function toggleRole(login) {
    const state = getState();
    const u = state.users.find(x => x.login === login);
    if(u) {
        u.role = u.role === 'admin' ? 'user' : 'admin';
        saveState(state);
    }
}

// Render Engine
function render() {
    const state = getState();
    const user = state.currentUser || { login: 'Гость', rep: 0, posts: 0, gameNick: 'Не указан', regDate: '-' };

    // 1. Auth Header
    const authNav = document.getElementById('navAuth');
    if (authNav) {
        if (state.currentUser) {
            authNav.innerHTML = `
                <a href="#" onclick="switchTab('profile')" style="color:var(--yellow); font-size:13px; font-weight:700; text-decoration:none;">
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

    // 2. Profile View
    if (document.getElementById('profUsername')) {
        document.getElementById('profUsername').textContent = user.login;
        document.getElementById('profPosts').textContent = user.posts || 0;
        document.getElementById('profReg').textContent = user.regDate || '2 августа';
        document.getElementById('profRepScore').textContent = user.rep || 0;
        document.getElementById('profGameNick').textContent = user.gameNick || 'Rom_Roysfield';
        
        if (user.avatar) document.getElementById('profAvatar').src = user.avatar;
        if (user.cover) document.getElementById('profCover').style.background = user.cover;

        const repScore = user.rep || 0;
        let status = 'Нейтральная';
        if (repScore > 0 && repScore <= 10) status = 'Положительная';
        if (repScore > 10) status = 'Высокая';
        document.getElementById('profRepStatus').textContent = status;
    }

    // 3. Forum Topics
    const forumContainer = document.getElementById('topicsContainer');
    if (forumContainer) {
        forumContainer.innerHTML = state.topics.map(t => `
            <div class="topic-item">
                <div class="topic-info">
                    <h4>${escapeHtml(t.title)}</h4>
                    <p>Автор: <strong>${escapeHtml(t.author)}</strong> | Лайков: <span style="color:var(--accent); font-weight:700;">+${t.likes || 0}</span></p>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <button class="btn btn-outline btn-sm" onclick="likeTopic(${t.id})">
                        <i class="fas fa-heart" style="color:#e67e22;"></i> +1
                    </button>
                    <span style="color:var(--yellow); font-size:13px; font-weight:700;">${t.replies} ответов</span>
                </div>
            </div>
        `).join('');
    }

    // 4. Activity Feed
    const activityFeed = document.getElementById('profileActivityFeed');
    if (activityFeed) {
        const userTopics = state.topics.filter(t => t.author === user.login);
        if (userTopics.length === 0) {
            activityFeed.innerHTML = '<p class="empty-text">Сообщение не может быть отображено т.к. находится в защищенном разделе или нет активности.</p>';
        } else {
            activityFeed.innerHTML = userTopics.map(t => `
                <div class="act-item">
                    <i class="fas fa-comment act-icon"></i>
                    <div class="act-body">
                        <h5>${escapeHtml(t.title)}</h5>
                        <p><strong>${escapeHtml(user.login)}</strong> создал тему на форуме</p>
                        <span class="act-date">Недавно</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // 5. Admin Panel Tables
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
                <td><strong>${u.role}</strong></td>
                <td><button class="btn btn-outline btn-sm" onclick="toggleRole('${u.login}')">Сменить роль</button></td>
            </tr>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', render);
