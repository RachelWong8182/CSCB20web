from flask import Flask, render_template, request, jsonify, session
import sqlite3
import hashlib

app = Flask(__name__, template_folder='html', static_folder='.', static_url_path='')
app.secret_key = 'your-secret-key-change-this'  # Change this to a random string in production

DB_PATH = 'database.db'

# ===== Database Setup =====
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user'
        )
    ''')
    conn.commit()
    conn.close()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


# ===== Page Routes =====
@app.route('/')
def mainpage():
    return render_template('mainpage.html')

@app.route('/pop_up.html')
def popup():
    return render_template('pop_up.html')

@app.route('/restaurant_italian.html')
def italianFood():
    return render_template('restaurant_italian.html')


# ===== Auth API Routes =====

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    confirm = data.get('confirm_password', '').strip()
    role = data.get('role', 'user')  # 'user' or 'manager'

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'})

    if password != confirm:
        return jsonify({'success': False, 'message': 'Passwords do not match.'})

    if role not in ('user', 'manager'):
        return jsonify({'success': False, 'message': 'Invalid role.'})

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            (email, hash_password(password), role)
        )
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Account created successfully.'})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Email already registered.'})


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        'SELECT id, email, role FROM users WHERE email = ? AND password = ?',
        (email, hash_password(password))
    )
    user = cursor.fetchone()
    conn.close()

    if user:
        session['user_id'] = user[0]
        session['email'] = user[1]
        session['role'] = user[2]
        return jsonify({'success': True, 'role': user[2], 'email': user[1]})
    else:
        return jsonify({'success': False, 'message': 'Invalid email or password.'})


@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})


@app.route('/api/session')
def get_session():
    if 'user_id' in session:
        return jsonify({
            'logged_in': True,
            'role': session['role'],
            'email': session['email']
        })
    return jsonify({'logged_in': False})


if __name__ == '__main__':
    init_db()
    app.run(debug=True)