// ===== Load popup HTML into modal-container =====
function login_popup() {
    loadPopup(() => {
        hideAllPopups();
        document.getElementById('login-popup').style.display = 'flex';
    });
}

function register_popup() {
    loadPopup(() => {
        hideAllPopups();
        document.getElementById('register-popup').style.display = 'flex';
    });
}

function manager_login_popup() {
    loadPopup(() => {
        hideAllPopups();
        document.getElementById('manager-login-popup').style.display = 'flex';
    });
}

function manager_register_popup() {
    loadPopup(() => {
        hideAllPopups();
        document.getElementById('manager-register-popup').style.display = 'flex';
    });
}

function forgot_password_popup() {
    loadPopup(() => {
        hideAllPopups();
        document.getElementById('forgot-password-popup').style.display = 'flex';
    });
}

function showPopup(id) {
    hideAllPopups();
    document.getElementById(id).style.display = 'flex';
}

function hideAllPopups() {
    const ids = [
        'login-popup', 'register-popup',
        'manager-login-popup', 'manager-register-popup',
        'forgot-password-popup', 'reset-password-popup'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function loadPopup(callback) {
    const container = document.getElementById('modal-container');
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


// ===== Toggle password visibility =====
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const eyeIcon    = btn.querySelector('.eye-icon');
    const eyeOffIcon = btn.querySelector('.eye-off-icon');

    if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.style.display    = 'none';
        eyeOffIcon.style.display = 'inline';
    } else {
        input.type = 'password';
        eyeIcon.style.display    = 'inline';
        eyeOffIcon.style.display = 'none';
    }
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
            document.getElementById(`${prefix}-popup`).style.display = 'none';
            const loginId = role === 'manager' ? 'manager-login-popup' : 'login-popup';
            document.getElementById(loginId).style.display = 'flex';
        } else {
            errorEl.textContent = data.message;
            errorEl.style.display = 'block';
        }
    });
}


// ===== Forgot Password: Step 1 — request reset code =====
function submitForgotPassword() {
    const email   = document.getElementById('forgot-email').value.trim();
    const errorEl = document.getElementById('forgot-error');
    const successEl = document.getElementById('forgot-success');

    errorEl.style.display   = 'none';
    successEl.style.display = 'none';

    if (!email) {
        errorEl.textContent = 'Please enter your email.';
        errorEl.style.display = 'block';
        return;
    }

    fetch('/api/forgot_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            successEl.textContent = 'Reset code sent! Check your email.';
            successEl.style.display = 'block';
            // After a short delay, move to step 2
            setTimeout(() => {
                hideAllPopups();
                document.getElementById('reset-password-popup').style.display = 'flex';
            }, 1500);
        } else {
            errorEl.textContent = data.message;
            errorEl.style.display = 'block';
        }
    });
}


// ===== Forgot Password: Step 2 — submit new password =====
function submitResetPassword() {
    const code     = document.getElementById('reset-code').value.trim();
    const password = document.getElementById('reset-new-password').value.trim();
    const confirm  = document.getElementById('reset-confirm-password').value.trim();
    const errorEl  = document.getElementById('reset-error');

    errorEl.style.display = 'none';

    if (!code || !password || !confirm) {
        errorEl.textContent = 'All fields are required.';
        errorEl.style.display = 'block';
        return;
    }
    if (password !== confirm) {
        errorEl.textContent = 'Passwords do not match.';
        errorEl.style.display = 'block';
        return;
    }

    fetch('/api/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code, new_password: password })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            hideAllPopups();
            // Re-open login with a brief success hint
            document.getElementById('login-popup').style.display = 'flex';
            const errorLogin = document.getElementById('login-error');
            if (errorLogin) {
                errorLogin.style.color  = 'green';
                errorLogin.textContent  = 'Password reset! Please log in.';
                errorLogin.style.display = 'block';
            }
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
            if (window.location.pathname.includes('my_restaurant')) {
                window.location.href = '/';
            } else {
                applySessionUI(null, null);
                document.getElementById('settingMenu').style.display = 'none';
            }
        });
}


// ===== Apply UI based on role =====
function applySessionUI(role, email) {
    const managerBtn = document.getElementById('manager-button');
    const myStoreBtn = document.getElementById('mystore-button');
    const loginBtn   = document.getElementById('login-button');
    const settingMenu = document.getElementById('settingMenu');

    if (role === null) {
        if (loginBtn) loginBtn.dataset.loggedIn = 'false';
        if (managerBtn) managerBtn.style.display = 'inline-block';
        if (myStoreBtn) myStoreBtn.style.display = 'none';
        if (settingMenu) settingMenu.style.display = 'none';
        return;
    }

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

document.addEventListener('click', (e) => {
    const menu     = document.getElementById('settingMenu');
    const loginBtn = document.getElementById('login-button');
    if (menu && loginBtn && !loginBtn.contains(e.target) && !menu.contains(e.target)) {
        menu.style.display = 'none';
    }
});


// ===== Check session on page load =====
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-button');
    if (loginBtn) {
        loginBtn.dataset.loggedIn = 'false';
        loginBtn.onclick = () => {
            if (loginBtn.dataset.loggedIn === 'true') {
                toggleSettingMenu();
            } else {
                login_popup();
            }
        };
    }

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