let currentTopicId = null;

const ROLES = {
    user: { title: 'Пользователь', class: 'role-user' },
    admin: { title: 'Администратор', class: 'role-admin' },
    tester: { title: 'Тестер', class: 'role-tester' },
    dev: { title: 'Разработчик', class: 'role-dev' },
    support: { title: 'Агент поддержки', class: 'role-support' }
};

function getRoleBadgeHtml(roleKey) {
    const role = ROLES[roleKey] || ROLES.user;
    return `<span class="role-badge ${role.class}">${role.title}</span>`;
}

const defaultState = {
    currentUser: { 
        login: 'requiem', 
        role: 'dev',
        rep: 21, 
        posts: 1, 
        regDate: 'Сегодня',
        avatar: 'https://i.imgur.com/8Km9tLL.png',
        cover: '',
        warns: 0,
        banUntil: null
    },
    orders: [
        { id: 101, email: 'user@example.com', status: 'Оплачено (150 ₽)' }
    ],
    users: [
        { login: 'requiem', role: 'dev', rep: 21, warns: 0, banUntil: null },
        { login: '-812', role: 'admin', rep: 12, warns: 0, banUntil: null },
        { login: 'Tester_John', role: 'tester', rep: 5, warns: 0, banUntil: null },
        { login: 'Support_Alex', role: 'support', rep: 14, warns: 0, banUntil: null }
    ],
    topics: [
        { 
            id: 1, 
            title: 'Тестовая тема форума', 
            author: 'requiem', 
            posts: [
                { id: 1001, author: 'requiem', text: 'Добро пожаловать в обновленный форум REQ-Client!', date: 'Только что', likes: [] }
            ]
        }
    ],
    reports: []
};

// Принудительный сброс старой структуры данных для применения исправлений
(function checkVersion() {
    if (localStorage.getItem('req_v3') !== 'true') {
        localStorage.removeItem('req_state');
        localStorage.setItem('req_v3', 'true');
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

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`tab-${tabName}`);
    if (target) target.classList.add('active');
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function openPaymentModal() { openModal('payModal'); }

// Расчет временных банов и постоянного закрытия форума
function checkBanStatus(user) {
    if (!user) return { isBanned: false };
    const warns = user.warns || 0;

    if (warns >= 80) {
        return { isBanned: true, isPermanent: true, reason: 'Форум закрыт навсегда (80+ баллов)' };
    }

    if (user.banUntil && user.banUntil !== 'PERMANENT' && new Date(user.banUntil) > new Date()) {
        const daysLeft = Math.ceil((new Date(user.banUntil) - new Date()) / (1000 * 60 * 60 * 24));
        return { isBanned: true, isPermanent: false, daysLeft: daysLeft };
    }

    return { isBanned: false };
}

// Открытие темы
function openTopic(id) {
    currentTopicId = Number(id);
    switchTab('topic-view');
    renderTopicView();
}

function renderTopicView() {
    const state = getState();
    const topic = state.topics.find(t => t.id === currentTopicId);
    if (!topic) return;

    document.getElementById('viewTopicTitle').textContent = topic.title;
    document.getElementById('viewTopicMeta').innerHTML = `Автор: <strong>${escapeHtml(topic.author)}</strong> | Сообщений: ${topic.posts.length}`;

    const container = document.getElementById('topicRepliesContainer');
    const user = state.currentUser;
    const banInfo = checkBanStatus(user);

    container.innerHTML = topic.posts.map(p => {
        const authorObj = state.users.find(u => u.login === p.author) || { role: 'user' };
        const likesArr = p.likes || [];
        const isLiked = user && likesArr.includes(user.login);

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
                        <div style="display:flex; gap:10px; align-items:center;">
                            <button class="btn btn-outline btn-sm ${isLiked ? 'active' : ''}" onclick="toggleLikePost(${topic.id}, ${p.id})">
                                <i class="fas fa-heart" style="color:${isLiked ? '#ff4d4d' : '#85705a'};"></i> ${likesArr.length}
                            </button>
                            <button class="btn btn-outline btn-sm" onclick="reportPost('${p.author}', '${escapeHtml(p.text.substring(0, 30))}')" style="color:#ff6b6b; border-color:rgba(255,107,107,0.3);">
                                <i class="fas fa-flag"></i> Жалоба
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Вывод формы ответа или уведомления об ограничении
    const replyCard = document.getElementById('replyFormContainer');
    if (replyCard) {
        if (banInfo.isBanned) {
            replyCard.innerHTML = `
                <div style="color:#ff4d4d; font-weight:700; text-align:center; padding:20px; border:1px solid rgba(255,77,77,0.3); border-radius:10px; background:rgba(255,77,77,0.05);">
                    <i class="fas fa-ban" style="font-size:24px; margin-bottom:10px; display:block;"></i>
                    Доступ к написанию сообщений ограничен! <br>
                    ${banInfo.isPermanent ? 'Доступ закрыт навсегда (80+ баллов).' : `Срок блокировки: ещё ${banInfo.daysLeft} дн.`}
                </div>`;
        } else {
            replyCard.innerHTML = `
                <h3>Оставить ответ</h3>
                <div class="form-group">
                    <textarea id="newReplyText" rows="4" placeholder="Напишите ваш ответ..."></textarea>
                </div>
                <button class="btn btn-primary" onclick="submitReply()"><i class="fas fa-paper-plane"></i> Отправить ответ</button>
            `;
        }
    }
}

// Защищенный лайк (1 лайк от 1 юзера)
function toggleLikePost(topicId, postId) {
    const state = getState();
    if (!state.currentUser) return alert('Авторизуйтесь!');

    const topic = state.topics.find(t => t.id === topicId);
    if (!topic) return;

    const post = topic.posts.find(p => p.id === postId);
    if (!post) return;

    if (!post.likes) post.likes = [];
    const userIndex = post.likes.indexOf(state.currentUser.login);
    const authorObj = state.users.find(u => u.login === post.author);

    if (userIndex === -1) {
        post.likes.push(state.currentUser.login);
        if (authorObj) authorObj.rep = (authorObj.rep || 0) + 1;
        if (state.currentUser.login === post.author) state.currentUser.rep += 1;
    } else {
        post.likes.splice(userIndex, 1);
        if (authorObj) authorObj.rep = Math.max(0, (authorObj.rep || 0) - 1);
        if (state.currentUser.login === post.author) state.currentUser.rep = Math.max(0, state.currentUser.rep - 1);
    }

    saveState(state);
    renderTopicView();
}

// Отправка ответа
function submitReply() {
    const state = getState();
    const user = state.currentUser;
    const banInfo = checkBanStatus(user);

    if (banInfo.isBanned) return alert('Ваш аккаунт заблокирован!');

    const input = document.getElementById('newReplyText');
    const text = input ? input.value.trim() : '';
    if (!text) return alert('Введите текст ответа!');

    const topic = state.topics.find(t => t.id === currentTopicId);

    if (topic) {
        topic.posts.push({
            id: Date.now(),
            author: user.login,
            text: text,
            date: 'Только что',
            likes: []
        });

        user.posts = (user.posts || 0) + 1;
        saveState(state);
        renderTopicView();
    }
}

// Жалобы
function reportPost(targetAuthor, previewText) {
    const state = getState();
    if (!state.currentUser) return alert('Авторизуйтесь!');

    const reason = prompt(`Причина жалобы на ${targetAuthor}:`);
    if (reason) {
        state.reports.push({
            id: Date.now(),
            sender: state.currentUser.login,
            target: targetAuthor,
            text: previewText,
            reason: reason,
            date: 'Только что'
        });
        saveState(state);
        alert('Жалоба передана модераторам!');
    }
}

// Выдача баллов и установка банов в Админке
function addWarnPoints(username, points) {
    const state = getState();
    const u = state.users.find(x => x.login === username);
    if (!u) return;

    u.warns = (u.warns || 0) + points;

    if (u.warns >= 80) {
        u.banUntil = 'PERMANENT';
    } else if (u.warns >= 30) {
        let date = new Date();
        date.setDate(date.getDate() + 30);
        u.banUntil = date.toISOString();
    } else if (u.warns >= 10) {
        let date = new Date();
        date.setDate(date.getDate() + 7);
        u.banUntil = date.toISOString();
    }

    if (state.currentUser && state.currentUser.login === username) {
        state.currentUser.warns = u.warns;
        state.currentUser.banUntil = u.banUntil;
    }

    saveState(state);
    alert(`Пользователю ${username} добавлено +${points} баллов! Всего: ${u.warns}`);
}

function dismissReport(id) {
    const state = getState();
    state.reports = state.reports.filter(r => r.id !== id);
    saveState(state);
}

// Создание тем
function createTopic() {
    const state = getState();
    const banInfo = checkBanStatus(state.currentUser);

    if (banInfo.isBanned) return alert('Ваш аккаунт заблокирован!');

    const title = document.getElementById('topicTitle').value.trim();
    const body = document.getElementById('topicBody').value.trim() || title;

    if(!title) return alert('Заполните заголовок!');

    const authorName = state.currentUser ? state.currentUser.login : 'Гость';

    state.topics.unshift({
        id: Date.now(),
        title: title,
        author: authorName,
        posts: [
            { id: Date.now() + 1, author: authorName, text: body, date: 'Только что', likes: [] }
        ]
    });

    if (state.currentUser) state.currentUser.posts = (state.currentUser.posts || 0) + 1;

    saveState(state);
    closeModal('createTopicModal');
    document.getElementById('topicTitle').value = '';
    document.getElementById('topicBody').value = '';
}

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
        userObj = { login: login, role: 'user', rep: 0, warns: 0, banUntil: null };
        state.users.push(userObj);
    }

    state.currentUser = {
        login: userObj.login,
        role: userObj.role || 'user',
        rep: userObj.rep || 0,
        posts: 0,
        regDate: 'Сегодня',
        avatar: 'https://i.imgur.com/8Km9tLL.png',
        warns: userObj.warns || 0,
        banUntil: userObj.banUntil || null
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
    alert('Оплата прошла успешно!');
}

function render() {
    const state = getState();
    const user = state.currentUser || { login: 'Гость', role: 'user', rep: 0, posts: 0, regDate: '-', warns: 0 };

    // Шапка
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

    // Профиль
    if (document.getElementById('profUsername')) {
        document.getElementById('profUsername').textContent = user.login;
        document.getElementById('profGroup').innerHTML = getRoleBadgeHtml(user.role);
        document.getElementById('profPosts').textContent = user.posts || 0;
        document.getElementById('profReg').textContent = user.regDate || '2 августа';
        document.getElementById('profRepScore').textContent = user.rep || 0;
        document.getElementById('profWarns').textContent = user.warns || 0;
        
        if (user.avatar) document.getElementById('profAvatar').src = user.avatar;
        if (user.cover) document.getElementById('profCover').style.background = user.cover;

        const repScore = user.rep || 0;
        let status = 'Нейтральная';
        if (repScore > 0 && repScore <= 10) status = 'Положительная';
        if (repScore > 10) status = 'Высокая';
        document.getElementById('profRepStatus').textContent = status;
    }

    // Форум
    const forumContainer = document.getElementById('topicsContainer');
    if (forumContainer) {
        forumContainer.innerHTML = state.topics.map(t => `
            <div class="topic-item">
                <div class="topic-clickable" onclick="openTopic(${t.id})">
                    <div class="topic-info">
                        <h4>${escapeHtml(t.title)}</h4>
                        <p>Автор: <strong>${escapeHtml(t.author)}</strong></p>
                    </div>
                </div>
                <div>
                    <span style="color:var(--yellow); font-size:13px; font-weight:700;">${t.posts ? t.posts.length : 0} ответов</span>
                </div>
            </div>
        `).join('');
    }

    // Активность
    const activityFeed = document.getElementById('profileActivityFeed');
    if (activityFeed) {
        const userTopics = state.topics.filter(t => t.author === user.login);
        if (userTopics.length === 0) {
            activityFeed.innerHTML = '<p class="empty-text">Нет активности.</p>';
        } else {
            activityFeed.innerHTML = userTopics.map(t => `
                <div class="act-item" onclick="openTopic(${t.id})" style="cursor:pointer;">
                    <i class="fas fa-comment act-icon"></i>
                    <div class="act-body">
                        <h5>${escapeHtml(t.title)}</h5>
                        <p><strong>${escapeHtml(user.login)}</strong> создал тему или ответ</p>
                        <span class="act-date">Недавно</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // Таблица Заказов в Админке
    const ordersTbody = document.getElementById('adminOrdersTable');
    if (ordersTbody) {
        ordersTbody.innerHTML = state.orders.map(o => `
            <tr>
                <td>${escapeHtml(o.email)}</td>
                <td><span style="color:#4cd964">${o.status}</span></td>
                <td><button style="color:#ff4d4d; background:none; border:0; cursor:pointer;" onclick="deleteOrder(${o.id})">Удалить</button></td>
            </tr>
        `).join('');
    }

    // Таблица Пользователей и ролей в Админке
    const usersTbody = document.getElementById('adminUsersTable');
    if (usersTbody) {
        usersTbody.innerHTML = state.users.map(u => `
            <tr>
                <td>${escapeHtml(u.login)}</td>
                <td>${getRoleBadgeHtml(u.role)}</td>
                <td><strong style="color:#ff6b6b">${u.warns || 0}</strong></td>
                <td>
                    <select class="admin-select" onchange="changeUserRole('${u.login}', this.value)">
                        ${Object.keys(ROLES).map(r => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${ROLES[r].title}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="addWarnPoints('${u.login}', 10)">+10 б.</button>
                    <button class="btn btn-outline btn-sm" onclick="addWarnPoints('${u.login}', 30)">+30 б.</button>
                </td>
            </tr>
        `).join('');
    }

    // Таблица Жалоб в Админке
    const reportsTbody = document.getElementById('adminReportsTable');
    if (reportsTbody) {
        reportsTbody.innerHTML = state.reports.length === 0 
            ? '<tr><td colspan="4" style="color:var(--text-muted); text-align:center;">Жалоб нет</td></tr>'
            : state.reports.map(r => `
            <tr>
                <td><strong>${escapeHtml(r.sender)}</strong></td>
                <td><span style="color:#ff6b6b">${escapeHtml(r.target)}</span></td>
                <td>${escapeHtml(r.reason)}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="addWarnPoints('${r.target}', 10); dismissReport(${r.id});">+10 б.</button>
                    <button class="btn btn-outline btn-sm" onclick="dismissReport(${r.id})">Отклонить</button>
                </td>
            </tr>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', render);
