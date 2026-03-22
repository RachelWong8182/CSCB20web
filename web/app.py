from flask import Flask, render_template, request, jsonify, session
import sqlite3
import hashlib
import os

app = Flask(__name__, template_folder='html', static_folder='.', static_url_path='')
app.secret_key = 'your-secret-key-change-this'

DB_PATH = 'database.db'
UPLOAD_FOLDER = 'store_photos'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            manager_id INTEGER UNIQUE NOT NULL,
            name TEXT,
            cuisine TEXT,
            address TEXT,
            price TEXT,
            hours TEXT,
            description TEXT,
            photo_url TEXT,
            FOREIGN KEY (manager_id) REFERENCES users(id)
        )
    ''')
    conn.commit()
    conn.close()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def manager_required():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in.'})
    if session.get('role') != 'manager':
        return jsonify({'success': False, 'message': 'Manager access only.'})
    return None

@app.route('/')
def mainpage():
    return render_template('mainpage.html')

@app.route('/pop_up.html')
def popup():
    return render_template('pop_up.html')

@app.route('/my_restaurant.html')
def my_restaurant():
    if session.get('role') != 'manager':
        return render_template('mainpage.html')
    return render_template('my_restaurant.html')

@app.route('/restaurant_italian.html')
def italianFood():
    return render_template('restaurant_italian.html')

@app.route('/restaurant_chinese.html')
def chineseFood():
    return render_template('restaurant_chinese.html')

@app.route('/restaurant_japanese.html')
def japaneseFood():
    return render_template('restaurant_japanese.html')

@app.route('/restaurant_korean.html')
def koreanFood():
    return render_template('restaurant_korean.html')

@app.route('/restaurant_french.html')
def frenchFood():
    return render_template('restaurant_french.html')

@app.route('/restaurant_thai.html')
def thaiFood():
    return render_template('restaurant_thai.html')

@app.route('/restaurant_indian.html')
def indianFood():
    return render_template('restaurant_indian.html')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email    = data.get('email', '').strip()
    password = data.get('password', '').strip()
    confirm  = data.get('confirm_password', '').strip()
    role     = data.get('role', 'user')
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'})
    if password != confirm:
        return jsonify({'success': False, 'message': 'Passwords do not match.'})
    if role not in ('user', 'manager'):
        return jsonify({'success': False, 'message': 'Invalid role.'})
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
                       (email, hash_password(password), role))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Account created successfully.'})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Email already registered.'})

@app.route('/api/login', methods=['POST'])
def login():
    data     = request.get_json()
    email    = data.get('email', '').strip()
    password = data.get('password', '').strip()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT id, email, role FROM users WHERE email = ? AND password = ?',
                   (email, hash_password(password)))
    user = cursor.fetchone()
    conn.close()
    if user:
        session['user_id'] = user[0]
        session['email']   = user[1]
        session['role']    = user[2]
        return jsonify({'success': True, 'role': user[2], 'email': user[1]})
    return jsonify({'success': False, 'message': 'Invalid email or password.'})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/session')
def get_session():
    if 'user_id' in session:
        return jsonify({'logged_in': True, 'role': session['role'], 'email': session['email']})
    return jsonify({'logged_in': False})

@app.route('/api/store/info', methods=['GET'])
def get_store_info():
    err = manager_required()
    if err: return err
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT name, cuisine, address, price, hours, description, photo_url FROM stores WHERE manager_id = ?',
                   (session['user_id'],))
    row = cursor.fetchone()
    conn.close()
    if row:
        return jsonify({'success': True, 'store': {
            'name': row[0], 'cuisine': row[1], 'address': row[2],
            'price': row[3], 'hours': row[4], 'description': row[5], 'photo_url': row[6]
        }})
    return jsonify({'success': True, 'store': None})

@app.route('/api/store/info', methods=['POST'])
def save_store_info():
    err = manager_required()
    if err: return err
    data = request.get_json()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO stores (manager_id, name, cuisine, address, price, hours, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(manager_id) DO UPDATE SET
            name=excluded.name, cuisine=excluded.cuisine, address=excluded.address,
            price=excluded.price, hours=excluded.hours, description=excluded.description
    ''', (session['user_id'], data.get('name',''), data.get('cuisine',''),
          data.get('address',''), data.get('price',''), data.get('hours',''), data.get('description','')))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/store/photo', methods=['POST'])
def save_store_photo():
    err = manager_required()
    if err: return err
    if 'photo' not in request.files:
        return jsonify({'success': False, 'message': 'No file uploaded.'})
    file = request.files['photo']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected.'})
    ext      = os.path.splitext(file.filename)[1]
    filename = f"store_{session['user_id']}{ext}"
    file.save(os.path.join(UPLOAD_FOLDER, filename))
    photo_url = f'/{UPLOAD_FOLDER}/{filename}'
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO stores (manager_id, photo_url) VALUES (?, ?)
        ON CONFLICT(manager_id) DO UPDATE SET photo_url=excluded.photo_url
    ''', (session['user_id'], photo_url))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'photo_url': photo_url})


# ===== Public: Get all restaurants by cuisine =====
@app.route('/api/restaurants/<cuisine>')
def get_restaurants_by_cuisine(cuisine):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Case-insensitive match on cuisine field
    cursor.execute('''
        SELECT name, address, price, hours, description, photo_url
        FROM stores
        WHERE LOWER(cuisine) = LOWER(?)
    ''', (cuisine,))
    rows = cursor.fetchall()
    conn.close()

    restaurants = []
    for row in rows:
        restaurants.append({
            'name':        row[0],
            'address':     row[1],
            'price':       row[2],
            'hours':       row[3],
            'description': row[4],
            'photo_url':   row[5],
        })

    return jsonify({'success': True, 'restaurants': restaurants})


if __name__ == '__main__':
    init_db()
    app.run(debug=True)