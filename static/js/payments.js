const PaymentsModule = {
    init: function() {
        this.setupEventListeners();
        this.loadPayments();
        this.loadPurchaseOrders();
    },
    
    setupEventListeners: function() {
        const recordBtn = document.getElementById('recordPaymentBtn');
        const searchInput = document.getElementById('searchPayment');
        const filterSelect = document.getElementById('statusFilterPayment');
        const form = document.getElementById('paymentForm');
        
        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.openRecordModal());
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
                const paymentId = row.dataset.payment;
                this.viewPayment(paymentId);
            }
            if (e.target.closest('.edit-btn')) {
                const row = e.target.closest('tr');
                const paymentId = row.dataset.payment;
                this.editPayment(paymentId);
            }
        });
    },
    
    loadPurchaseOrders: function() {
        fetch('/api/purchase-orders')
            .then(res => res.json())
            .then(orders => {
                const select = document.getElementById('poNumberPayment');
                if (select) {
                    select.innerHTML = '<option value="">Select PO</option>' +
                        orders.map(o => `<option value="${o.po_number}" data-supplier="${o.supplier_name}" data-amount="${o.total_amount}">${o.po_number}</option>`).join('');
                    
                    select.addEventListener('change', (e) => {
                        const selected = e.target.options[e.target.selectedIndex];
                        document.getElementById('supplierNamePayment').value = selected.dataset.supplier || '';
                        document.getElementById('paymentAmount').value = selected.dataset.amount || '';
                    });
                }
            });
    },
    
    loadPayments: function() {
        fetch('/api/payments')
            .then(res => res.json())
            .then(payments => {
                this.renderTable(payments);
            })
            .catch(err => {
                console.error('Error loading payments:', err);
                APP.showNotification('Error loading payments', 'error');
            });
    },
    
    renderTable: function(payments) {
        const tbody = document.querySelector('#paymentsTable tbody');
        if (!tbody) return;
        
        if (payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #6b7280;">No payment records available. Click "Record Payment" to get started.</td></tr>';
            return;
        }
        
        tbody.innerHTML = payments.map(payment => `
            <tr class="table-row" data-payment="${payment.payment_id}">
                <td>${payment.payment_id}</td>
                <td>${payment.po_number}</td>
                <td>${payment.supplier_name}</td>
                <td>$${parseFloat(payment.amount).toFixed(2)}</td>
                <td>${new Date(payment.payment_date).toLocaleDateString()}</td>
                <td>${payment.payment_method}</td>
                <td>
                    <span class="status-badge ${payment.status.toLowerCase()}">
                        ${payment.status}
                    </span>
                </td>
                <td class="actions">
                    <button class="btn-icon view-btn" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-btn" title="Update Status">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },
    
    openRecordModal: function() {
        document.getElementById('paymentForm').reset();
        APP.showModal('paymentModal');
    },
    
    editPayment: function(paymentId) {
        fetch('/api/payments')
            .then(res => res.json())
            .then(payments => {
                const payment = payments.find(p => p.payment_id === paymentId);
                if (payment) {
                    document.getElementById('paymentId').value = payment.payment_id;
                    document.getElementById('paymentId').readOnly = true;
                    document.getElementById('poNumberPayment').value = payment.po_number;
                    document.getElementById('supplierNamePayment').value = payment.supplier_name;
                    document.getElementById('paymentAmount').value = payment.amount;
                    document.getElementById('paymentMethod').value = payment.payment_method;
                    APP.showModal('paymentModal');
                }
            });
    },
    
    handleFormSubmit: function(e) {
        e.preventDefault();
        
        const data = {
            payment_id: document.getElementById('paymentId').value,
            po_number: document.getElementById('poNumberPayment').value,
            supplier_name: document.getElementById('supplierNamePayment').value,
            amount: parseFloat(document.getElementById('paymentAmount').value),
            payment_method: document.getElementById('paymentMethod').value
        };
        
        fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(resp => {
            if (resp.success) {
                APP.showNotification('Payment recorded successfully');
                APP.hideModal('paymentModal');
                this.loadPayments();
            } else {
                APP.showNotification(resp.error || 'Error recording payment', 'error');
            }
        });
    },
    
    viewPayment: function(paymentId) {
        fetch('/api/payments')
            .then(res => res.json())
            .then(payments => {
                const payment = payments.find(p => p.payment_id === paymentId);
                if (payment) {
                    const details = `
Payment ID: ${payment.payment_id}
PO Number: ${payment.po_number}
Supplier: ${payment.supplier_name}
Amount: $${parseFloat(payment.amount).toFixed(2)}
Payment Date: ${new Date(payment.payment_date).toLocaleDateString()}
Payment Method: ${payment.payment_method}
Status: ${payment.status}
                    `;
                    alert(details);
                }
            });
    },
    
    filterTable: function(value, type) {
        const rows = document.querySelectorAll('#paymentsTable tbody tr');
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
    PaymentsModule.init();
});