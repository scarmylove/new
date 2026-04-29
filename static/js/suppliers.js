const SuppliersModule = {
    currentEditingId: null,
    
    init: function() {
        this.setupEventListeners();
        this.loadSuppliers();
    },
    
    setupEventListeners: function() {
        const addBtn = document.getElementById('addSupplierBtn');
        const searchInput = document.getElementById('searchSupplier');
        const filterSelect = document.getElementById('statusFilter');
        const form = document.getElementById('supplierForm');
        
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddModal());
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterTable(e.target.value, 'search'));
        }
        
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => this.filterTable(e.target.value, 'status'));
        }
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Action buttons
        this.setupActionButtons();
    },
    
    setupActionButtons: function() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-btn')) {
                const row = e.target.closest('tr');
                const id = row.dataset.id;
                this.viewSupplier(id);
            }
            if (e.target.closest('.edit-btn')) {
                const row = e.target.closest('tr');
                const id = row.dataset.id;
                this.editSupplier(id);
            }
            if (e.target.closest('.delete-btn')) {
                const row = e.target.closest('tr');
                const id = row.dataset.id;
                this.deleteSupplier(id);
            }
        });
    },
    
    loadSuppliers: function() {
        fetch('/api/suppliers')
            .then(res => res.json())
            .then(suppliers => {
                this.renderTable(suppliers);
            })
            .catch(err => {
                console.error('Error loading suppliers:', err);
                APP.showNotification('Error loading suppliers', 'error');
            });
    },
    
    renderTable: function(suppliers) {
        const tbody = document.querySelector('#suppliersTable tbody');
        if (!tbody) return;
        
        if (suppliers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #6b7280;">No suppliers available. Click "Add Supplier" to get started.</td></tr>';
            return;
        }
        
        tbody.innerHTML = suppliers.map(supplier => `
            <tr class="table-row" data-id="${supplier.supplier_id}">
                <td>${supplier.supplier_id}</td>
                <td>${supplier.supplier_name}</td>
                <td>${supplier.contact_person || '-'}</td>
                <td>${supplier.email}</td>
                <td>${supplier.phone || '-'}</td>
                <td>${supplier.address || '-'}</td>
                <td>
                    <span class="status-badge ${supplier.status.toLowerCase()}">
                        ${supplier.status}
                    </span>
                </td>
                <td class="actions">
                    <button class="btn-icon view-btn" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
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
        document.getElementById('supplierForm').reset();
        document.getElementById('modalTitle').textContent = 'Add New Supplier';
        document.getElementById('supplierId').readOnly = false;
        APP.showModal('supplierModal');
    },
    
    editSupplier: function(id) {
        fetch(`/api/suppliers/${id}`)
            .then(res => res.json())
            .then(supplier => {
                this.currentEditingId = id;
                document.getElementById('modalTitle').textContent = 'Edit Supplier';
                document.getElementById('supplierId').value = supplier.supplier_id;
                document.getElementById('supplierId').readOnly = true;
                document.getElementById('supplierName').value = supplier.supplier_name;
                document.getElementById('contactPerson').value = supplier.contact_person || '';
                document.getElementById('email').value = supplier.email;
                document.getElementById('phone').value = supplier.phone || '';
                document.getElementById('address').value = supplier.address || '';
                APP.showModal('supplierModal');
            });
    },
    
    handleFormSubmit: function(e) {
        e.preventDefault();
        
        const data = {
            supplier_id: document.getElementById('supplierId').value,
            supplier_name: document.getElementById('supplierName').value,
            contact_person: document.getElementById('contactPerson').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            status: 'Active'
        };
        
        const url = this.currentEditingId 
            ? `/api/suppliers/${this.currentEditingId}`
            : '/api/suppliers';
        
        const method = this.currentEditingId ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(resp => {
            if (resp.success) {
                APP.showNotification(this.currentEditingId ? 'Supplier updated successfully' : 'Supplier added successfully');
                APP.hideModal('supplierModal');
                this.loadSuppliers();
            } else {
                APP.showNotification(resp.error || 'Error saving supplier', 'error');
            }
        })
        .catch(err => {
            console.error('Error:', err);
            APP.showNotification('Error saving supplier', 'error');
        });
    },
    
    viewSupplier: function(id) {
        fetch(`/api/suppliers/${id}`)
            .then(res => res.json())
            .then(supplier => {
                alert(`Supplier: ${supplier.supplier_name}\nContact: ${supplier.contact_person}\nEmail: ${supplier.email}\nPhone: ${supplier.phone}\nAddress: ${supplier.address}`);
            });
    },
    
    deleteSupplier: function(id) {
        if (confirm('Are you sure you want to delete this supplier?')) {
            fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(resp => {
                    if (resp.success) {
                        APP.showNotification('Supplier deleted successfully');
                        this.loadSuppliers();
                    } else {
                        APP.showNotification(resp.error || 'Error deleting supplier', 'error');
                    }
                });
        }
    },
    
    filterTable: function(value, type) {
        const rows = document.querySelectorAll('#suppliersTable tbody tr');
        rows.forEach(row => {
            let match = true;
            
            if (type === 'search') {
                const text = row.textContent.toLowerCase();
                match = text.includes(value.toLowerCase());
            } else if (type === 'status' && value) {
                const status = row.querySelector('.status-badge').textContent.trim();
                match = status === value;
            }
            
            row.style.display = match ? '' : 'none';
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SuppliersModule.init();
});