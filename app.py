from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from functools import wraps
from werkzeug.utils import secure_filename
import json
import os
from datetime import datetime, timedelta
import hashlib
from config import Config
from supabase import create_client, Client

app = Flask(__name__)
app.config.from_object(Config)

# Supabase connection
supabase: Client = None
print(f"DEBUG: SUPABASE_URL = {app.config.get('SUPABASE_URL')}")
print(f"DEBUG: SUPABASE_KEY = {app.config.get('SUPABASE_KEY')}")
if app.config['SUPABASE_URL'] and app.config['SUPABASE_KEY']:
    try:
        supabase = create_client(app.config['SUPABASE_URL'], app.config['SUPABASE_KEY'])
        print("DEBUG: Supabase connected successfully")
    except Exception as e:
        print(f"ERROR: Supabase connection failed: {e}")
else:
    print("ERROR: SUPABASE_URL or SUPABASE_KEY not set!")

# Ensure data directory exists (for uploads only)
os.makedirs('data', exist_ok=True)
os.makedirs('static/images', exist_ok=True)


def load_json(table_name):
    """Load data from Supabase table"""
    if not supabase:
        print(f"ERROR: Supabase client not initialized for table {table_name}")
        return []
    try:
        response = supabase.table(table_name).select("*").execute()
        print(f"DEBUG: Loaded {len(response.data) if response.data else 0} records from {table_name}")
        if response.data:
            return response.data
        return []
    except Exception as e:
        print(f"ERROR: Supabase load error for {table_name}: {e}")
        import traceback
        traceback.print_exc()
        return []


def save_json(table_name, data):
    """Save data to Supabase table (replace entire table)"""
    if not supabase:
        return
    try:
        # Delete all existing records
        supabase.table(table_name).delete().neq('id', '').execute()
        
        # Insert new data
        if isinstance(data, list) and data:
            for item in data:
                # Ensure id exists for Supabase
                if 'id' not in item:
                    item['id'] = str(datetime.now().timestamp()).replace('.', '')
                supabase.table(table_name).insert(item).execute()
        elif isinstance(data, dict) and data:
            if 'id' not in data:
                data['id'] = str(datetime.now().timestamp()).replace('.', '')
            supabase.table(table_name).insert(data).execute()
    except Exception as e:
        print(f"Supabase save error for {table_name}: {e}")


def hash_pwd(pwd):
    return hashlib.sha256(pwd.encode()).hexdigest()


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif', 'svg'}


def default_settings():
    return {
        'system_name': 'SPOMS',
        'logo': 'images/spoms.png',
        'homepage_background': 'images/spoms.png'
    }


def load_settings():
    settings = load_json('settings')
    if isinstance(settings, list) and settings:
        settings = settings[0]  # Supabase returns list, take first record
    if not isinstance(settings, dict) or not settings:
        settings = default_settings()
        save_json('settings', settings)
    return settings


def save_settings(settings):
    save_json('settings', settings)


@app.context_processor
def inject_settings():
    return {'settings': load_settings()}


@app.context_processor
def inject_current_user():
    if 'user' in session:
        users = load_json('users')
        user = next((u for u in users if u['name'] == session['user']), None)
        return {'current_user': user}
    return {'current_user': None}


def is_hashed_password(pwd):
    return isinstance(pwd, str) and len(pwd) == 64 and all(c in '0123456789abcdef' for c in pwd)


def normalize_user_passwords(users):
    changed = False
    for u in users:
        pwd = u.get('password', '')
        if pwd and not is_hashed_password(pwd):
            u['password'] = hash_pwd(pwd)
            changed = True
    return changed



# ===== DECORATORS =====
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

# ===== FEEDBACK PAGE =====

@app.route('/feedback')
def feedback():
    return render_template('feedback.html')


@app.route('/api/feedback', methods=['GET', 'POST'])
def api_feedback():
    if request.method == 'POST':
        data = request.json

        feedbacks = load_json('feedback')

        feedbacks.append({
            "name": data['name'],
            "message": data['message'],
            "rating": data['rating'],
            "date": datetime.now().strftime("%Y-%m-%d %H:%M")
        })

        save_json('feedback', feedbacks)

        return jsonify({"success": True})

    return jsonify(load_json('feedback'))

def role_check(roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if 'user' not in session:
                return redirect(url_for('login'))
            if session['role'] not in roles:
                return render_template('403.html'), 403
            return f(*args, **kwargs)
        return decorated
    return decorator


# ===== MGA ROUTES =====
@app.route('/')
def home():
    if 'user' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = request.form['username']
        pwd = request.form['password']
        print(f"DEBUG: Login attempt for username: {user}")
        users = load_json('users')
        print(f"DEBUG: Found {len(users)} users in database")
        if users:
            print(f"DEBUG: First user: username={users[0].get('username')}, name={users[0].get('name')}")
        u = next((x for x in users if x['username'] == user), None)
        if u:
            pwd_hash = hash_pwd(pwd)
            print(f"DEBUG: User found. Checking password...")
            print(f"DEBUG: Provided password hash: {pwd_hash[:20]}...")
            print(f"DEBUG: Stored password hash: {u['password'][:20]}...")
            if u['password'] == pwd_hash:
                session['user'] = u['name']
                session['role'] = u['role']
                print(f"DEBUG: Login successful for {u['name']}")
                return redirect(url_for('dashboard'))
            else:
                print(f"ERROR: Password mismatch for user {user}")
        else:
            print(f"ERROR: User {user} not found in database")
        return render_template('login.html', error='Invalid credentials')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))

@app.route('/dashboard')
@login_required
def dashboard():
    suppliers = load_json('suppliers')
    orders = load_json('orders')
    payments = load_json('payments')
    
    stats = {
        'suppliers': len(suppliers),
        'orders': len(orders),
        'pending': len([o for o in orders if o['status'] == 'Pending']),
        'completed': len([o for o in orders if o['status'] == 'Delivered']),
        'payments': len(payments)
    }
    return render_template('dashboard.html', stats=stats, role=session['role'])

@app.route('/suppliers')
@login_required
def suppliers():
    if session['role'] not in ['Administrator', 'Purchasing Officer', 'Store Owner']:
        return render_template('403.html'), 403
    data = load_json('suppliers')
    return render_template('suppliers.html', suppliers=data, role=session['role'])

@app.route('/api/suppliers', methods=['GET', 'POST'])
@login_required
def api_suppliers():
    if request.method == 'POST':
        if session['role'] not in ['Administrator', 'Store Owner']:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 403
        data = request.json
        suppliers = load_json('suppliers')
        suppliers.append(data)
        save_json('suppliers', suppliers)
        return jsonify({'success': True})
    return jsonify(load_json('suppliers'))

@app.route('/api/suppliers/<sid>', methods=['DELETE', 'PUT'])
@login_required
@role_check(['Administrator', 'Store Owner'])
def api_supplier(sid):
    suppliers = load_json('suppliers')
    if request.method == 'DELETE':
        suppliers = [s for s in suppliers if s['id'] != sid]
        save_json('suppliers', suppliers)
        return jsonify({'success': True})
    elif request.method == 'PUT':
        data = request.json
        s = next((x for x in suppliers if x['id'] == sid), None)
        if s:
            s.update(data)
            save_json('suppliers', suppliers)
        return jsonify({'success': True})

@app.route('/orders')
@login_required
def orders():
    if session['role'] not in ['Administrator', 'Purchasing Officer', 'Finance Officer']:
        return render_template('403.html'), 403
    data = load_json('orders')
    suppliers = load_json('suppliers')
    return render_template('purchase_orders.html', orders=data, suppliers=suppliers, role=session['role'])

@app.route('/api/orders', methods=['GET', 'POST'])
@login_required
def api_orders():
    if request.method == 'POST':
        data = request.json
        orders = load_json('orders')
        orders.append(data)
        save_json('orders', orders)
        return jsonify({'success': True})
    return jsonify(load_json('orders'))

@app.route('/api/orders/<po_number>', methods=['PUT'])
@login_required
def update_order(po_number):
    if session.get('role') not in ['Administrator', 'Purchasing Officer']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    orders = load_json('orders')
    for order in orders:
        if str(order.get('po')) == po_number:
            order.update(data)
            save_json('orders', orders)
            return jsonify({'success': True})
    return jsonify({'error': 'Order not found'}), 404

@app.route('/payments')
@login_required
@role_check(['Finance Officer', 'Administrator'])
def payments():
    data = load_json('payments')
    orders = load_json('orders')
    return render_template('payments.html', payments=data, orders=orders, user_role=session.get('role'))

@app.route('/api/payments', methods=['GET', 'POST'])
@login_required
def api_payments():
    if request.method == 'POST':
        data = request.json
        payments = load_json('payments')
        payments.append(data)
        save_json('payments', payments)
        return jsonify({'success': True})
    return jsonify(load_json('payments'))

@app.route('/api/payments/<payment_id>', methods=['PUT'])
@login_required
def update_payment(payment_id):
    if session.get('role') not in ['Administrator', 'Finance Officer']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    payments = load_json('payments')
    for payment in payments:
        if payment['id'] == payment_id:
            payment.update(data)
            save_json('payments', payments)
            return jsonify({'success': True})
    return jsonify({'error': 'Payment not found'}), 404

@app.route('/backup')
@login_required
def backup():
    suppliers = load_json('suppliers')
    orders = load_json('orders')
    payments = load_json('payments')
    
    return render_template('backup.html', 
        suppliers_count=len(suppliers),
        orders_count=len(orders),
        orders_value=sum(o['total'] for o in orders),
        payments_count=len(payments),
        payments_total=sum(p['amount'] for p in payments)
    )

@app.route('/reports')
@login_required
def reports():
    suppliers = load_json('suppliers')
    orders = load_json('orders')
    payments = load_json('payments')
    feedbacks = load_json('feedback')
    
    return render_template('reports.html', 
        suppliers_count=len(suppliers),
        orders_count=len(orders),
        orders_value=sum(o['total'] for o in orders),
        payments_count=len(payments),
        payments_total=sum(p['amount'] for p in payments),
        orders=orders,
        feedbacks=feedbacks
    )

@app.route('/api/chart/orders')
@login_required
def chart_orders():
    orders = load_json('orders')
    statuses = ['Pending', 'Approved', 'Delivered']
    data = [len([o for o in orders if o['status'] == s]) for s in statuses]
    return jsonify({'labels': statuses, 'data': data, 'colors': ['#f59e0b', '#3b82f6', '#10b981']})

@app.route('/api/chart/suppliers')
@login_required
def chart_suppliers():
    suppliers = load_json('suppliers')
    orders = load_json('orders')
    labels = [s['name'] for s in suppliers]
    data = [len([o for o in orders if o['supplier'] == s['name']]) for s in suppliers]
    return jsonify({'labels': labels, 'data': data, 'colors': ['#2563eb', '#dc2626', '#16a34a']})

@app.route('/users')
@login_required
@role_check(['Administrator'])
def users():
    data = load_json('users')
    for u in data:
        u.pop('password', None)
    return render_template('users.html', users=data)

@app.route('/api/users', methods=['GET', 'POST'])
@login_required
@role_check(['Administrator'])
def api_users():
    users = load_json('users')
    if request.method == 'POST':
        data = request.json
        if not data.get('username') or not data.get('password') or not data.get('name') or not data.get('role'):
            return jsonify({'success': False, 'error': 'Missing user data'}), 400
        if any(u['username'].lower() == data['username'].lower() for u in users):
            return jsonify({'success': False, 'error': 'Username already exists'}), 400
        data['password'] = hash_pwd(data['password'])
        existing_ids = [int(u['user_id'][1:]) for u in users if u.get('user_id', '').startswith('U') and u['user_id'][1:].isdigit()]
        next_id = max(existing_ids, default=0) + 1
        data['user_id'] = f'U{next_id:02d}'
        data['status'] = data.get('status', 'Active')
        users.append(data)
        save_json('users', users)
        return jsonify({'success': True, 'user': {'user_id': data['user_id'], 'name': data['name'], 'username': data['username'], 'role': data['role'], 'status': data['status']}})
    for u in users:
        u.pop('password', None)
    return jsonify(users)

@app.route('/api/users/<uid>', methods=['PUT', 'DELETE'])
@login_required
@role_check(['Administrator'])
def api_user(uid):
    users = load_json('users')
    user = next((u for u in users if u.get('user_id') == uid), None)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    if request.method == 'DELETE':
        users = [u for u in users if u.get('user_id') != uid]
        save_json('users', users)
        return jsonify({'success': True})

    data = request.json or {}
    if data.get('username') and data['username'].lower() != user['username'].lower():
        if any(u['username'].lower() == data['username'].lower() for u in users if u.get('user_id') != uid):
            return jsonify({'success': False, 'error': 'Username already exists'}), 400
    if data.get('name'):
        user['name'] = data['name']
    if data.get('username'):
        user['username'] = data['username']
    if data.get('role'):
        user['role'] = data['role']
    if data.get('status'):
        user['status'] = data['status']
    if data.get('password'):
        user['password'] = hash_pwd(data['password'])

    save_json('users', users)
    return jsonify({'success': True, 'user': {'user_id': user['user_id'], 'name': user['name'], 'username': user['username'], 'role': user['role'], 'status': user['status']}})

@app.route('/settings', methods=['GET', 'POST'])
@login_required
@role_check(['Administrator'])
def settings():
    settings = load_settings()
    message = None
    if request.method == 'POST':
        system_name = request.form.get('system_name', settings['system_name']).strip()
        settings['system_name'] = system_name or settings['system_name']

        if 'logo' in request.files:
            logo_file = request.files['logo']
            if logo_file and allowed_file(logo_file.filename):
                filename = secure_filename(logo_file.filename)
                logo_path = f'images/site-logo-{int(datetime.now().timestamp())}.{filename.rsplit(".", 1)[1].lower()}'
                logo_file.save(os.path.join('static', logo_path))
                settings['logo'] = logo_path

        if 'background' in request.files:
            bg_file = request.files['background']
            if bg_file and allowed_file(bg_file.filename):
                filename = secure_filename(bg_file.filename)
                bg_path = f'images/homepage-bg-{int(datetime.now().timestamp())}.{filename.rsplit(".", 1)[1].lower()}'
                bg_file.save(os.path.join('static', bg_path))
                settings['homepage_background'] = bg_path

        save_settings(settings)
        message = 'Settings saved successfully.'

    return render_template('settings.html', settings=settings, message=message)

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    users = load_json('users')
    user = next((u for u in users if u['name'] == session['user']), None)
    if not user:
        return redirect(url_for('logout'))
    message = None
    if request.method == 'POST':
        data = request.form
        if data.get('name'):
            user['name'] = data['name'].strip()
            session['user'] = user['name']
        if data.get('username'):
            if data['username'].lower() != user['username'].lower():
                if any(u['username'].lower() == data['username'].lower() for u in users if u != user):
                    message = 'Username already exists'
                else:
                    user['username'] = data['username'].strip()
        if data.get('password'):
            user['password'] = hash_pwd(data['password'])
        
        if 'profile_picture' in request.files:
            pic_file = request.files['profile_picture']
            if pic_file and allowed_file(pic_file.filename):
                filename = secure_filename(pic_file.filename)
                pic_path = f'images/profile-{user["user_id"]}-{int(datetime.now().timestamp())}.{filename.rsplit(".", 1)[1].lower()}'
                pic_file.save(os.path.join('static', pic_path))
                user['profile_picture'] = pic_path
        
        save_json('users', users)
        if not message:
            message = 'Profile updated successfully.'
    return render_template('profile.html', user=user, message=message)

if __name__ == '__main__':
    app.run(debug=True)