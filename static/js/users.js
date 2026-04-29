const UsersModule = {
    currentEditingId: null,
    
    init: function() {
        this.setupEventListeners();
        this.loadUsers();
    },
    
    setupEventListeners: function() {
        const addBtn = document.getElementById('addUserBtn');
        const form = document.getElementById('userForm');
        
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddModal());
        }
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        this.setupActionButtons();
    },
    
    setupActionButtons: function() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-btn')) {
                const row = e.target.closest('tr');
                const userId = row.dataset.user;
                this.editUser(userId);
            }
            if (e.target.closest('.delete-btn')) {
                const row = e.target.closest('tr');
                const userId = row.dataset.user;
                this.deleteUser(userId);
            }
        });
    },
    
    loadUsers: function() {
        fetch('/api/users')
            .then(res => res.json())
            .then(users => {
                this.renderTable(users);
            })
            .catch(err => {
                console.error('Error loading users:', err);
                APP.showNotification('Error loading users', 'error');
            });
    },
    
    renderTable: function(users) {
        const tbody = document.querySelector('#usersTable tbody');
        if (!tbody) return;
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #6b7280;">No users available. Click "Add User" to get started.</td></tr>';
            return;
        }
        
        tbody.innerHTML = users.map(user => `
            <tr class="table-row" data-user="${user.user_id}">
                <td>${user.user_id}</td>
                <td>${user.full_name}</td>
                <td>${user.username}</td>
                <td><span class="role-badge">${user.role}</span></td>
                <td>
                    <span class="status-badge ${user.status.toLowerCase()}">
                        ${user.status}
                    </span>
                </td>
                <td>${new Date(user.created_date).toLocaleDateString()}</td>
                <td class="actions">
                    <button class="btn-icon edit-btn" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },
    
    openAddModal: function() {
        this.currentEditingId = null;
        document.getElementById('userForm').reset();
        document.getElementById('userModalTitle').textContent = 'Add New User';
        document.getElementById('userId').readOnly = false;
        document.getElementById('password').required = true;
        APP.showModal('userModal');
    },
    
    editUser: function(userId) {
        fetch('/api/users')
            .then(res => res.json())
            .then(users => {
                const user = users.find(u => u.user_id === userId);
                if (user) {
                    this.currentEditingId = userId;
                    document.getElementById('userModalTitle').textContent = 'Edit User';
                    document.getElementById('userId').value = user.user_id;
                    document.getElementById('userId').readOnly = true;
                    document.getElementById('fullName').value = user.full_name;
                    document.getElementById('username').value = user.username;
                    document.getElementById('username').readOnly = true;
                    document.getElementById('password').value = '';
                    document.getElementById('password').required = false;
                    document.getElementById('password').placeholder = 'Leave blank to keep current password';
                    document.getElementById('userRole').value = user.role;
                    APP.showModal('userModal');
                }
            });
    },
    
    handleFormSubmit: function(e) {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        
        const data = {
            user_id: document.getElementById('userId').value,
            full_name: document.getElementById('fullName').value,
            username: document.getElementById('username').value,
            role: document.getElementById('userRole').value
        };
        
        if (password) {
            data.password = password;
        }
        
        const url = this.currentEditingId 
            ? '/api/users'
            : '/api/users';
        
        const method = this.currentEditingId ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(resp => {
            if (resp.success) {
                APP.showNotification(this.currentEditingId ? 'User updated successfully' : 'User created successfully');
                APP.hideModal('userModal');
                this.loadUsers();
            } else {
                APP.showNotification(resp.error || 'Error saving user', 'error');
            }
        });
    },
    
    deleteUser: function(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            fetch(`/api/users/${userId}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(resp => {
                    if (resp.success) {
                        APP.showNotification('User deleted successfully');
                        this.loadUsers();
                    } else {
                        APP.showNotification(resp.error || 'Error deleting user', 'error');
                    }
                });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    UsersModule.init();
});