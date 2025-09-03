// Admin Panel JavaScript

class AdminPanel {
    constructor() {
        this.appointments = this.loadAppointments();
        this.filteredAppointments = [...this.appointments];
        this.appointmentToDelete = null;
        
        this.initializeEventListeners();
        this.renderAppointments();
        this.updateStatistics();
    }

    initializeEventListeners() {
        //event listeners for buttons
        document.getElementById('dateFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('barberFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());

        // Export event listeners
        document.getElementById('exportCSV').addEventListener('click', () => this.exportToCSV());
        document.getElementById('exportJSON').addEventListener('click', () => this.exportToJSON());
        document.getElementById('clearAllAppointments').addEventListener('click', () => this.clearAllAppointments());

        // Modal event listeners
        document.getElementById('confirmDelete').addEventListener('click', () => this.deleteAppointment());
        document.getElementById('cancelDelete').addEventListener('click', () => this.hideDeleteModal());
    }

    loadAppointments() {
        const stored = localStorage.getItem('floydsAppointments');
        if (stored) {
            const appointments = JSON.parse(stored);
            return appointments.map(apt => ({
                ...apt,
                date: new Date(apt.date)
            }));
        }
        return [];
    }

    saveAppointments() {
        localStorage.setItem('floydsAppointments', JSON.stringify(this.appointments));
    }

    applyFilters() {
        const dateFilter = document.getElementById('dateFilter').value;
        const barberFilter = document.getElementById('barberFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        this.filteredAppointments = this.appointments.filter(appointment => {
            // Date filter
            if (dateFilter) {
                const appointmentDate = appointment.date.toISOString().split('T')[0];
                if (appointmentDate !== dateFilter) return false;
            }

            // Barber filter
            if (barberFilter && appointment.barber !== barberFilter) {
                return false;
            }

            // Status filter
            if (statusFilter) {
                const today = new Date();
                const appointmentDate = new Date(appointment.date);
                
                switch (statusFilter) {
                    case 'upcoming':
                        return appointmentDate > today;
                    case 'past':
                        return appointmentDate < today;
                    case 'today':
                        return appointmentDate.toDateString() === today.toDateString();
                    default:
                        return true;
                }
            }

            return true;
        });

        this.renderAppointments();
    }

    clearFilters() {
        document.getElementById('dateFilter').value = '';
        document.getElementById('barberFilter').value = '';
        document.getElementById('statusFilter').value = '';
        
        this.filteredAppointments = [...this.appointments];
        this.renderAppointments();
    }

    renderAppointments() {
        const tableBody = document.getElementById('appointmentsTableBody');
        tableBody.innerHTML = '';

        if (this.filteredAppointments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No appointments found
                    </td>
                </tr>
            `;
            return;
        }

        // Sort appointments by date (newest first)
        const sortedAppointments = [...this.filteredAppointments].sort((a, b) => b.date - a.date);

        sortedAppointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700';
            
            const formattedDate = appointment.date.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const isPast = appointment.date < new Date();
            const isToday = appointment.date.toDateString() === new Date().toDateString();
            
            let statusClass = '';
            if (isPast) {
                statusClass = 'text-red-600 dark:text-red-400';
            } else if (isToday) {
                statusClass = 'text-green-600 dark:text-green-400';
            } else {
                statusClass = 'text-blue-600 dark:text-blue-400';
            }

            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${appointment.appointmentId}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">${appointment.customerName}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">${appointment.customerEmail}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">${appointment.customerPhone}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${this.getBarberName(appointment.barber)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${this.getServiceName(appointment.service)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white ${statusClass}">${formattedDate}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">${appointment.time}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    $${appointment.price}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="adminPanel.showDeleteModal('${appointment.appointmentId}')" 
                            class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        Delete
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    updateStatistics() {
        const totalAppointments = this.appointments.length;
        const today = new Date();
        const todayAppointments = this.appointments.filter(apt => 
            apt.date.toDateString() === today.toDateString()
        ).length;
        
        const totalRevenue = this.appointments.reduce((sum, apt) => sum + apt.price, 0);
        
        // Calculate most popular service
        const serviceCounts = {};
        this.appointments.forEach(apt => {
            serviceCounts[apt.service] = (serviceCounts[apt.service] || 0) + 1;
        });
        
        const popularService = Object.keys(serviceCounts).length > 0 
            ? Object.keys(serviceCounts).reduce((a, b) => serviceCounts[a] > serviceCounts[b] ? a : b)
            : '-';

        document.getElementById('totalAppointments').textContent = totalAppointments;
        document.getElementById('todayAppointments').textContent = todayAppointments;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue}`;
        document.getElementById('popularService').textContent = this.getServiceName(popularService);
    }

    showDeleteModal(appointmentId) {
        this.appointmentToDelete = appointmentId;
        const modal = document.getElementById('deleteModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    hideDeleteModal() {
        this.appointmentToDelete = null;
        const modal = document.getElementById('deleteModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    deleteAppointment() {
        if (this.appointmentToDelete) {
            this.appointments = this.appointments.filter(apt => apt.appointmentId !== this.appointmentToDelete);
            this.saveAppointments();
            this.applyFilters(); // Re-apply current filters
            this.updateStatistics();
            this.hideDeleteModal();
        }
    }

    clearAllAppointments() {
        if (confirm('Are you sure you want to delete ALL appointments? This action cannot be undone.')) {
            this.appointments = [];
            this.saveAppointments();
            this.applyFilters();
            this.updateStatistics();
        }
    }

    exportToCSV() {
        const headers = ['ID', 'Customer Name', 'Email', 'Phone', 'Barber', 'Service', 'Date', 'Time', 'Price', 'Special Requests'];
        const csvContent = [
            headers.join(','),
            ...this.filteredAppointments.map(apt => [
                apt.appointmentId,
                `"${apt.customerName}"`,
                `"${apt.customerEmail}"`,
                `"${apt.customerPhone}"`,
                this.getBarberName(apt.barber),
                this.getServiceName(apt.service),
                apt.date.toLocaleDateString(),
                apt.time,
                apt.price,
                `"${apt.specialRequests || ''}"`
            ].join(','))
        ].join('\n');

        this.downloadFile(csvContent, 'appointments.csv', 'text/csv');
    }

    exportToJSON() {
        const jsonContent = JSON.stringify(this.filteredAppointments, null, 2);
        this.downloadFile(jsonContent, 'appointments.json', 'application/json');
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getBarberName(barberKey) {
        const barberNames = {
            vy: 'Vy',
            kevin: 'Kevin',
            jordan: 'Jordan',
            kathy: 'Kathy',
            matt: 'Matt',
            peter: 'Peter'
        };
        return barberNames[barberKey] || barberKey;
    }

    getServiceName(serviceKey) {
        const serviceNames = {
            haircut: 'Haircut',
            fade: 'Fade',
            seniorHaircut: 'Senior Haircut',
            kidsHaircut: 'Kids Haircut',
            beardTrim: 'Beard Trim'
        };
        return serviceNames[serviceKey] || serviceKey;
    }
}

// Initialize admin panel when page loads
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();

}); 
