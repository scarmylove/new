// Global variables
const APP = {
    baseUrl: window.location.origin,
    currentUser: null,
    
    init: function() {
        this.setupEventListeners();
        this.setupModals();
        this.handleNavigation();
    },
    
    setupEventListeners: function() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }
        
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('show');
            });
        }
        
        // Close sidebar on mobile when clicking nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 480) {
                    sidebar.classList.remove('show');
                }
            });
        });
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.modal').classList.remove('show');
            });
        });
        
        // Close modal on overlay click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('show');
                }
            });
        });
    },
    
    setupModals: function() {
        // Handle all modal open buttons
        const modalButtons = document.querySelectorAll('[id*="Btn"]');
        modalButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const modalId = this.id.replace('Btn', 'Modal');
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('show');
                }
            });
        });
    },
    
    handleNavigation: function() {
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href').split('/').pop() || 'dashboard';
            if (href === currentPage || 
                (currentPage === '' && href === 'dashboard')) {
                link.classList.add('active');
            }
        });
    },
    
    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    },
    
    hideModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    },
    
    showNotification: function(message, type = 'success') {
        const notif = document.createElement('div');
        notif.className = `notification notification-${type}`;
        notif.textContent = message;
        notif.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#16a34a' : '#dc2626'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
        `;
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    },
    
    fetchAPI: function(endpoint, options = {}) {
        return fetch(this.baseUrl + endpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        }).then(res => res.json());
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    APP.init();
});

// Global animations
@keyframes slideInRight {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(400px);
        opacity: 0;
    }
}