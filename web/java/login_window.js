// ===== Load popup HTML into modal-container =====
function login_popup() {
    loadPopup(() => {
        document.getElementById('login-popup').style.display = 'flex';
    });
}

function register_popup() {
    loadPopup(() => {
        document.getElementById('login-popup').style.display = 'none';
        document.getElementById('register-popup').style.display = 'flex';
    });
}

function manager_login_popup() {
    loadPopup(() => {
        document.getElementById('manager-login-popup').style.display = 'flex';
    });
}

function manager_register_popup() {
    loadPopup(() => {
        document.getElementById('manager-login-popup').style.display = 'none';
        document.getElementById('manager-register-popup').style.display = 'flex';
    });
}

function loadPopup(callback) {
    const container = document.getElementById('modal-container');
    // If already loaded, just run callback
    if (container.innerHTML.trim() !== '') {
        callback();
        return;
    }
    fetch('/pop_up.html')
        .then(r => r.text())
        .then(html => {
            container.innerHTML = html;
            callback();
        });
}


// ===== Submit Login (General User) =====
function submitLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errorEl = document.getElementById('login-error');

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            document.getElementById('login-popup').style.display = 'none';
            applySessionUI(data.role, data.email);
            location.reload();
        } else {
            errorEl.textContent = data.message;
            errorEl.style.display = 'block';
        }
    });
}


// ===== Submit Login (Manager) =====
function submitManagerLogin() {
    const email = document.getElementById('manager-login-email').value.trim();
    const password = document.getElementById('manager-login-password').value.trim();
    const errorEl = document.getElementById('manager-login-error');

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            if (data.role !== 'manager') {
                errorEl.textContent = 'This account is not a manager account.';
                errorEl.style.display = 'block';
                return;
            }
            document.getElementById('manager-login-popup').style.display = 'none';
            applySessionUI(data.role, data.email);
        } else {
            errorEl.textContent = data.message;
            errorEl.style.display = 'block';
        }
    });
}


// ===== Submit Register (User or Manager) =====
function submitRegister(role) {
    const prefix = role === 'manager' ? 'manager-register' : 'register';
    const email = document.getElementById(`${prefix}-email`).value.trim();
    const password = document.getElementById(`${prefix}-password`).value.trim();
    const confirm = document.getElementById(`${prefix}-confirm`).value.trim();
    const errorEl = document.getElementById(`${prefix}-error`);

    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirm_password: confirm, role })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            // Close register popup, open login popup
            document.getElementById(`${prefix}-popup`).style.display = 'none';
            const loginId = role === 'manager' ? 'manager-login-popup' : 'login-popup';
            document.getElementById(loginId).style.display = 'flex';
        } else {
            errorEl.textContent = data.message;
            errorEl.style.display = 'block';
        }
    });
}


// ===== Logout =====
function logout() {
    fetch('/api/logout', { method: 'POST' })
        .then(() => {
            // If on a manager-only page, redirect to mainpage
            if (window.location.pathname.includes('my_restaurant')) {
                window.location.href = '/';
            } else {
                applySessionUI(null, null);
                document.getElementById('settingMenu').style.display = 'none';
            }
        });
}


// ===== Apply UI based on role =====
// role: 'manager', 'user', or null (logged out)
function applySessionUI(role, email) {
    const managerBtn = document.getElementById('manager-button');
    const myStoreBtn = document.getElementById('mystore-button');
    const loginBtn = document.getElementById('login-button');
    const settingMenu = document.getElementById('settingMenu');

    if (role === null) {
        // Logged out state
        if (loginBtn) loginBtn.dataset.loggedIn = 'false';
        if (managerBtn) managerBtn.style.display = 'inline-block';
        if (myStoreBtn) myStoreBtn.style.display = 'none';
        if (settingMenu) settingMenu.style.display = 'none';
        return;
    }

    // Logged in
    if (loginBtn) loginBtn.dataset.loggedIn = 'true';

    if (role === 'manager') {
        if (managerBtn) managerBtn.style.display = 'none';
        if (myStoreBtn) myStoreBtn.style.display = 'inline-block';
    } else {
        if (managerBtn) managerBtn.style.display = 'inline-block';
        if (myStoreBtn) myStoreBtn.style.display = 'none';
    }

    if (settingMenu) {
        settingMenu.innerHTML = `
            <a href="#">Profile (${email})</a>
            <a href="#" onclick="logout()">Logout</a>
        `;
    }
}


// ===== Toggle setting dropdown =====
function toggleSettingMenu() {
    const menu = document.getElementById('settingMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('settingMenu');
    const loginBtn = document.getElementById('login-button');
    if (menu && loginBtn && !loginBtn.contains(e.target) && !menu.contains(e.target)) {
        menu.style.display = 'none';
    }
});


// ===== Check session on page load =====
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-button');
    if (loginBtn) {
        loginBtn.dataset.loggedIn = 'false'; // default
        loginBtn.onclick = () => {
            if (loginBtn.dataset.loggedIn === 'true') {
                toggleSettingMenu();  // logged in → show dropdown
            } else {
                login_popup();        // not logged in → show login popup
            }
        };
    }

    // Wire up manager button to open manager login popup
    const managerBtn = document.getElementById('manager-button');
    if (managerBtn) {
        managerBtn.onclick = manager_login_popup;
    }

    const likesBtn = document.getElementById('likes-button');
    if (likesBtn) {
        likesBtn.onclick = () => {
            window.location.href = '/liked_restaurants.html';
        };
    }

    // Check existing session
    fetch('/api/session')
        .then(r => r.json())
        .then(data => {
            if (data.logged_in) {
                applySessionUI(data.role, data.email);
            } else {
                applySessionUI(null, null);
            }
        });
});