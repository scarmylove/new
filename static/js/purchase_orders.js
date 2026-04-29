const PurchaseOrdersModule = {
    currentEditingPO: null,
    
    init: function() {
        this.setupEventListeners();
        this.loadOrders();
        this.loadSuppliersForSelect();
    },
    
    setupEventListeners: function() {
        const createBtn = document.getElementById('createOrderBtn');
        const searchInput = document.getElementById('searchOrder');
        const filterSelect = document.getElementById('statusFilterOrder');
        const form = document.getElementById('orderForm');
        
        if (createBtn) {
            createBtn.addEventListener('click', () => this.openCreateModal());
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
        
        this.setupActionButtons();
    },
    
    setupActionButtons: function() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-btn')) {
                const row = e.target.closest('tr');
                const po = row.dataset.po;
                this.viewOrder(po);
            }
            if (e.target.closest('.edit-btn')) {
                const row = e.target.closest('tr');
                const po = row.dataset.po;
                this.editOrder(po);
            }
        });
    },
    
    loadSuppliersForSelect: function() {
        fetch('/api/suppliers')
            .then(res => res.json())
            .then(suppliers => {
                const select = document.getElementById('supplierId');
                if (select) {
                    select.innerHTML = '<option value="">Select Supplier</option>' +
                        suppliers.map(s => `<option value="${s.supplier_id}" data-name="${s.supplier_name}">${s.supplier_name}</option>`).join('');
                    
                    select.addEventListener('change', (e) => {
                        const selected = e.target.options[e.target.selectedIndex];
                        document.getElementById('supplierName').value = selected.dataset.name || '';
                    });
                }
            });
    },
    
    loadOrders: function() {
        fetch('/api/purchase-orders')
            .then(res => res.json())
            .then(orders => {
                this.renderTable(orders);
            })
            .catch(err => {
                console.error('Error loading orders:', err);
                APP.showNotification('Error loading orders', 'error');
            });
    },
    
    renderTable: function(orders) {
        const tbody = document.querySelector('#ordersTable tbody');
        if (!tbody) return;
        
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 40px; color: #6b7280;">No purchase orders available. Click "Create Order" to get started.</td></tr>';
            return;
        }
        
        tbody.innerHTML = orders.map(order => `
            <tr class="table-row" data-po="${order.po_number}">
                <td>${order.po_number}</td>
                <td>${order.supplier_name}</td>
                <td>${order.item_description}</td>
                <td>${order.quantity}</td>
                <td>$${parseFloat(order.unit_price).toFixed(2)}</td>
                <td>$${parseFloat(order.total_amount).toFixed(2)}</td>
                <td>${new Date(order.order_date).toLocaleDateString()}</td>
                <td>${order.expected_delivery_date || '-'}</td>
                <td>
                    <span class="status-badge ${order.status.toLowerCase().replace(' ', '-')}">
                        ${order.status}
                    </span>
                </td>
                <td class="actions">
                    <button class="btn-icon view-btn" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-btn" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },
    
    openCreateModal: function() {
        this.currentEditingPO = null;
        document.getElementById('orderForm').reset();
        document.getElementById('orderModalTitle').textContent = 'Create Purchase Order';
        APP.showModal('orderModal');
    },
    
    editOrder: function(po) {
        fetch(`/api/purchase-orders/${po}`)
            .then(res => res.json())
            .then(order => {
                this.currentEditingPO = po;
                document.getElementById('orderModalTitle').textContent = 'Edit Purchase Order';
                document.getElementById('poNumber').value = order.po_number;
                document.getElementById('poNumber').readOnly = true;
                document.getElementById('supplierId').value = order.supplier_id;
                document.getElementById('itemDescription').value = order.item_description;
                document.getElementById('quantity').value = order.quantity;
                document.getElementById('unitPrice').value = order.unit_price;
                document.getElementById('expectedDelivery').value = order.expected_delivery_date;
                APP.showModal('orderModal');
            });
    },
    
    handleFormSubmit: function(e) {
        e.preventDefault();
        
        const quantity = parseInt(document.getElementById('quantity').value);
        const unitPrice = parseFloat(document.getElementById('unitPrice').value);
        
        const data = {
            po_number: document.getElementById('poNumber').value,
            supplier_id: document.getElementById('supplierId').value,
            supplier_name: document.querySelector('#supplierId option:checked').textContent,
            item_description: document.getElementById('itemDescription').value,
            quantity: quantity,
            unit_price: unitPrice,
            expected_delivery_date: document.getElementById('expectedDelivery').value
        };
        
        const url = this.currentEditingPO 
            ? `/api/purchase-orders/${this.currentEditingPO}`
            : '/api/purchase-orders';
        
        const method = this.currentEditingPO ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(resp => {
            if (resp.success) {
                APP.showNotification(this.currentEditingPO ? 'Order updated successfully' : 'Order created successfully');
                APP.hideModal('orderModal');
                this.loadOrders();
            } else {
                APP.showNotification(resp.error || 'Error saving order', 'error');
            }
        });
    },
    
    viewOrder: function(po) {
        fetch(`/api/purchase-orders/${po}`)
            .then(res => res.json())
            .then(order => {
                const details = `
PO Number: ${order.po_number}
Supplier: ${order.supplier_name}
Item: ${order.item_description}
Quantity: ${order.quantity}
Unit Price: $${parseFloat(order.unit_price).toFixed(2)}
Total Amount: $${parseFloat(order.total_amount).toFixed(2)}
Order Date: ${new Date(order.order_date).toLocaleDateString()}
Expected Delivery: ${order.expected_delivery_date}
Status: ${order.status}
                `;
                alert(details);
            });
    },
    
    filterTable: function(value, type) {
        const rows = document.querySelectorAll('#ordersTable tbody tr');
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
    PurchaseOrdersModule.init();
});