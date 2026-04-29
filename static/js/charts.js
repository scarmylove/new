// Chart.js initialization for all dashboard charts

const ChartManager = {
    charts: {},
    
    initSupplierChart: function() {
        const ctx = document.getElementById('supplierChart');
        if (!ctx) return;
        
        fetch('/api/chart-data/suppliers')
            .then(res => res.json())
            .then(data => {
                this.charts.supplier = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.labels || [],
                        datasets: [{
                            label: 'Orders Per Supplier',
                            data: data.datasets[0].data || [],
                            backgroundColor: data.datasets[0].backgroundColor || ['#2563eb', '#dc2626', '#16a34a'],
                            borderRadius: 8,
                            borderSkipped: false
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        animation: {
                            duration: 1200,
                            easing: 'easeInOutQuart'
                        },
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                },
                                grid: {
                                    drawBorder: false,
                                    color: 'rgba(0, 0, 0, 0.05)'
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }
                });
            });
    },
    
    initOrdersChart: function() {
        const ctx = document.getElementById('ordersChart');
        if (!ctx) return;
        
        fetch('/api/chart-data/orders-status')
            .then(res => res.json())
            .then(data => {
                this.charts.orders = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: data.labels || [],
                        datasets: [{
                            data: data.datasets[0].data || [],
                            backgroundColor: data.datasets[0].backgroundColor || ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
                            borderColor: 'white',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        animation: {
                            duration: 1200,
                            easing: 'easeInOutQuart'
                        },
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 20,
                                    font: {
                                        size: 12
                                    }
                                }
                            }
                        }
                    }
                });
            });
    },
    
    initPaymentChart: function() {
        const ctx = document.getElementById('paymentChart');
        if (!ctx) return;
        
        fetch('/api/chart-data/payment-status')
            .then(res => res.json())
            .then(data => {
                this.charts.payment = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: data.labels || [],
                        datasets: [{
                            data: data.datasets[0].data || [],
                            backgroundColor: data.datasets[0].backgroundColor || ['#f59e0b', '#10b981', '#ef4444'],
                            borderColor: 'white',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        animation: {
                            duration: 1200,
                            easing: 'easeInOutQuart'
                        },
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    padding: 20,
                                    font: {
                                        size: 12
                                    }
                                }
                            }
                        }
                    }
                });
            });
    },
    
    initMonthlyChart: function() {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;
        
        fetch('/api/chart-data/monthly-transactions')
            .then(res => res.json())
            .then(data => {
                this.charts.monthly = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.labels || [],
                        datasets: (data.datasets || []).map(ds => ({
                            ...ds,
                            tension: 0.4,
                            fill: true,
                            borderWidth: 2
                        }))
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        animation: {
                            duration: 1200,
                            easing: 'easeInOutQuart'
                        },
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 20,
                                    font: {
                                        size: 12
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    drawBorder: false,
                                    color: 'rgba(0, 0, 0, 0.05)'
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }
                });
            });
    },
    
    initReportCharts: function() {
        const ctx1 = document.getElementById('supplierDistChart');
        if (ctx1) {
            this.charts.supplierDist = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Supplier Count',
                        data: [],
                        backgroundColor: '#2563eb'
                    }]
                },
                options: {
                    responsive: true,
                    animation: { duration: 1200 }
                }
            });
        }
        
        const ctx2 = document.getElementById('orderDistChart');
        if (ctx2) {
            this.charts.orderDist = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']
                    }]
                },
                options: {
                    responsive: true,
                    animation: { duration: 1200 }
                }
            });
        }
        
        const ctx3 = document.getElementById('paymentTrendsChart');
        if (ctx3) {
            this.charts.paymentTrends = new Chart(ctx3, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Payment Trends',
                        data: [],
                        borderColor: '#16a34a',
                        backgroundColor: 'rgba(22, 163, 74, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    animation: { duration: 1200 }
                }
            });
        }
    },
    
    init: function() {
        this.initSupplierChart();
        this.initOrdersChart();
        this.initPaymentChart();
        this.initMonthlyChart();
        this.initReportCharts();
    }
};

// Initialize charts when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ChartManager.init();
});