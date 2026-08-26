// Инициализация локальных данных при первом запуске
const defaultState = {
    currentUser: null,
    orders: [
        { id: 101, email: 'user@example.com', status: 'Оплачено (150 ₽)' }
    ],
    users: [
        { login: 'Admin', role: 'admin' },
        { login: 'Player1', role: 'user' }
    ],
    topics: [
        { id: 1, title: 'Оптимизация FPS в CS2 на слабых ПК', author: 'Admin', replies: 12 },
        { id: 2, title: 'Пресеты автоконфигов для REQ-Client', author: 'Player1', replies: 5 }
    ]
};

// Загрузка или сохранение в LocalStorage
function getState() {
    const data = localStorage.getItem('req_state');
    return data ? JSON.parse(data) : defaultState;
}

function saveState(state) {
    localStorage.setItem('req_state', JSON.stringify(state));
    render();
}

// Переключение вкладок (Главная, Форум, Админка)
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// Управление модальными окнами
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function openPaymentModal() { openModal('payModal'); }

// Симуляция оплаты подписки на 150 ₽
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

// Добавление темы на форум
function createTopic() {
    const title = document.getElementById('topicTitle').value;
    const state = getState();
    
    if(!title) return alert('Заполните заголовок темы!');

    state.topics.unshift({
        id: Date.now(),
        title: title,
        author: state.currentUser ? state.currentUser.login : 'Гость',
        replies: 0
    });

    saveState(state);
    closeModal('createTopicModal');
    document.getElementById('topicTitle').value = '';
    document.getElementById('topicBody').value = '';
}

// Отрисовка элементов на странице
function render() {
    const state = getState();

    // Шапка авторизации
    const authNav = document.getElementById('navAuth');
    if (state.currentUser) {
        authNav.innerHTML = `
            <span style="font-size:13px; font-weight:600; color:var(--yellow);">${state.currentUser.login}</span>
            <button class="btn btn-outline" onclick="logout()">Выйти</button>
        `;
    } else {
        authNav.innerHTML = `
            <button class="btn btn-outline" onclick="openAuth('login')">Войти</button>
            <button class="btn btn-primary" onclick="openAuth('reg')">Регистрация</button>
        `;
    }

    // Рендер форума
    const forumContainer = document.getElementById('topicsContainer');
    forumContainer.innerHTML = state.topics.map(t => `
        <div class="topic-item">
            <div class="topic-info">
                <h4>${escapeHtml(t.title)}</h4>
                <p>Автор: ${escapeHtml(t.author)}</p>
            </div>
            <span style="color:var(--yellow); font-size:13px; font-weight:700;">${t.replies} ответов</span>
        </div>
    `).join('');

    // Рендер Админки (Заказы)
    const ordersTbody = document.getElementById('adminOrdersTable');
    ordersTbody.innerHTML = state.orders.map(o => `
        <tr>
            <td>${escapeHtml(o.email)}</td>
            <td><span style="color:#4cd964">${o.status}</span></td>
            <td><button style="color:red; background:none; border:0; cursor:pointer;" onclick="deleteOrder(${o.id})">Удалить</button></td>
        </tr>
    `).join('');

    // Рендер Админки (Пользователи)
    const usersTbody = document.getElementById('adminUsersTable');
    usersTbody.innerHTML = state.users.map(u => `
        <tr>
            <td>${escapeHtml(u.login)}</td>
            <td>${u.role}</td>
            <td><button class="btn btn-outline" style="padding:2px 8px; font-size:11px;" onclick="toggleRole('${u.login}')">Сменить роль</button></td>
        </tr>
    `).join('');
}

// Простая защита от XSS
function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Авторизация (Локальная)
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
    state.currentUser = { login: login };

    if (!state.users.some(u => u.login === login)) {
        state.users.push({ login: login, role: 'user' });
    }

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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', render);