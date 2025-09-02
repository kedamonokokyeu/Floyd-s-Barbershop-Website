// Booking System JavaScript

class BookingSystem {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedBarber = null;
        this.selectedService = null;
        this.appointments = this.loadAppointments();
        
        this.initializeEventListeners();
        this.renderCalendar();
    }

    // Barber schedules (day of week: 0=Sunday, 1=Monday, etc.)
    barberSchedules = {
        vy: {
            name: "Vy",
            title: "Owner and Lead Barber",
            schedule: {
                0: { start: "08:30", end: "17:00" }, // Sunday
                1: { start: "09:00", end: "18:00" }, // Monday
                2: { start: "09:00", end: "14:00" }, // Tuesday
                3: { start: "09:00", end: "18:00" }, // Thursday
                4: { start: "09:00", end: "18:00" }, // Friday
                5: { start: "09:00", end: "18:00" }  // Saturday
            }
        },
        kevin: {
            name: "Kevin",
            title: "Experienced Barber",
            schedule: {
                4: { start: "09:00", end: "18:00" }, // Thursday
                5: { start: "08:30", end: "18:00" }, // Friday
                6: { start: "08:30", end: "18:00" }  // Saturday
            }
        },
        jordan: {
            name: "Jordan",
            title: "Newest Addition to the Team",
            schedule: {
                0: { start: "09:00", end: "17:00" }  // Sunday
            }
        },
        kathy: {
            name: "Kathy",
            title: "Experienced Barber",
            schedule: {
                3: { start: "09:00", end: "18:00" }, // Wednesday
                4: { start: "09:00", end: "18:00" }  // Thursday
            }
        },
        matt: {
            name: "Matt",
            title: "Experienced Barber",
            schedule: {
                1: { start: "09:00", end: "18:00" }, // Monday
                5: { start: "09:00", end: "18:00" }, // Friday
                6: { start: "08:30", end: "18:00" }  // Saturday
            }
        },
        peter: {
            name: "Peter",
            title: "Most Experienced Barber",
            schedule: {
                0: { start: "09:00", end: "17:00" }, // Sunday
                1: { start: "09:00", end: "18:00" }, // Monday
                2: { start: "09:00", end: "18:00" }  // Tuesday
            }
        }
    };

    // Service prices
    servicePrices = {
        haircut: 30,
        fade: 35,
        seniorHaircut: 25,
        kidsHaircut: 25,
        beardTrim: 20
    };

    initializeEventListeners() {
        // Check for barber parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const barberParam = urlParams.get('barber');
        if (barberParam && this.barberSchedules[barberParam]) {
            document.getElementById('barberSelect').value = barberParam;
            this.selectedBarber = barberParam;
            this.updateCalendar();
        }

        // Barber selection
        document.getElementById('barberSelect').addEventListener('change', (e) => {
            this.selectedBarber = e.target.value;
            this.updateCalendar();
        });

        // Service selection
        document.getElementById('serviceSelect').addEventListener('change', (e) => {
            this.selectedService = e.target.value;
            this.updateSummary();
        });

        // Update service options when date changes
        document.addEventListener('dateSelected', () => {
            this.updateServiceOptions();
        });

        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Form submission
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBooking();
        });

        // Modal close
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideModal();
        });

        // Customer info changes
        ['customerName', 'customerPhone', 'customerEmail', 'specialRequests'].forEach(field => {
            document.getElementById(field).addEventListener('input', () => {
                this.updateSummary();
            });
        });
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonthElement = document.getElementById('currentMonth');
        
        // Clear existing calendar
        calendarGrid.innerHTML = '';
        
        // Set month/year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        currentMonthElement.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'p-2 text-center font-semibold text-gray-600 dark:text-gray-400 text-sm';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
        // Get first day of month and number of days
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const firstDayOfWeek = firstDay.getDay();
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day disabled';
            emptyDay.style.opacity = '0.1';
            emptyDay.style.cursor = 'default';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Generate calendar days for the current month only
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            // Add data attributes for reliable selection
            dayElement.setAttribute('data-day', day);
            dayElement.setAttribute('data-date', currentDate.toISOString().split('T')[0]);
            
            const isToday = this.isToday(currentDate);
            const isPast = currentDate < new Date().setHours(0, 0, 0, 0);
            const isAvailable = this.isDateAvailable(currentDate);
            
            // Set classes based on conditions
            if (isToday) {
                dayElement.classList.add('today');
            }
            
            // Handle date availability
            if (isPast) {
                dayElement.classList.add('disabled');
                dayElement.style.cursor = 'not-allowed';
                dayElement.style.opacity = '0.3';
            } else if (isAvailable) {
                dayElement.classList.add('available');
                dayElement.style.cursor = 'pointer';
                
                // Add click event for available dates
                dayElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Calendar day clicked:', currentDate.toDateString());
                    this.selectDate(currentDate);
                });
            } else {
                dayElement.classList.add('unavailable');
                dayElement.style.cursor = 'not-allowed';
                dayElement.style.opacity = '0.5';
            }
            
            // Set the day number as text content
            dayElement.textContent = day;
            
            calendarGrid.appendChild(dayElement);
        }
        
        // Fill remaining cells to complete the grid (if needed)
        const totalCells = 42; // 6 rows * 7 days
        const currentCells = firstDayOfWeek + daysInMonth;
        const remainingCells = totalCells - currentCells;
        
        for (let i = 0; i < remainingCells; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day disabled';
            emptyDay.style.opacity = '0.1';
            emptyDay.style.cursor = 'default';
            calendarGrid.appendChild(emptyDay);
        }
    }

    selectDate(date) {
        console.log('selectDate called with:', date.toDateString());
        
        // Remove previous selection
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Find the correct day element using data attributes
        const targetDate = date.toISOString().split('T')[0];
        const foundElement = document.querySelector(`.calendar-day[data-date="${targetDate}"]`);
        
        if (foundElement) {
            foundElement.classList.add('selected');
            console.log('Date selected successfully:', date.toDateString());
            
            // Add visual feedback
            foundElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                foundElement.style.transform = 'scale(1)';
            }, 200);
        } else {
            console.error('Day element not found for date:', date.toDateString());
            console.log('Looking for date:', targetDate);
            console.log('Available elements:', Array.from(document.querySelectorAll('.calendar-day')).map(el => ({
                text: el.textContent,
                dataDate: el.getAttribute('data-date'),
                classes: el.className
            })));
        }
        
        this.selectedDate = date;
        this.renderTimeSlots();
        this.updateSummary();
        this.updateServiceOptions();
        
        // Dispatch custom event for date selection
        document.dispatchEvent(new CustomEvent('dateSelected'));
    }

    renderTimeSlots() {
        const timeSlotsSection = document.getElementById('timeSlotsSection');
        const timeSlotsContainer = document.getElementById('timeSlots');
        
        if (!this.selectedDate || !this.selectedBarber) {
            timeSlotsSection.classList.add('hidden');
            return;
        }
        
        timeSlotsSection.classList.remove('hidden');
        timeSlotsContainer.innerHTML = '';
        
        const dayOfWeek = this.selectedDate.getDay();
        const barberSchedule = this.barberSchedules[this.selectedBarber];
        
        if (!barberSchedule || !barberSchedule.schedule[dayOfWeek]) {
            timeSlotsContainer.innerHTML = '<p class="text-red-500 col-span-4">This barber is not available on this day.</p>';
            return;
        }
        
        const schedule = barberSchedule.schedule[dayOfWeek];
        const startTime = new Date(`2000-01-01 ${schedule.start}`);
        const endTime = new Date(`2000-01-01 ${schedule.end}`);
        
        // Generate 30-minute time slots
        const timeSlots = [];
        let currentTime = new Date(startTime);
        
        while (currentTime < endTime) {
            const timeString = currentTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
            
            const isBooked = this.isTimeSlotBooked(this.selectedDate, timeString, this.selectedBarber);
            
            const timeSlotElement = document.createElement('div');
            timeSlotElement.className = `time-slot ${isBooked ? 'booked' : 'available'}`;
            timeSlotElement.textContent = timeString;
            
            console.log('Creating time slot:', timeString, 'Booked:', isBooked);
            
            if (!isBooked) {
                timeSlotElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Time slot clicked:', timeString);
                    this.selectTimeSlot(timeString);
                });
                
                // Add visual feedback for clickable time slots
                timeSlotElement.style.cursor = 'pointer';
            } else {
                timeSlotElement.style.cursor = 'not-allowed';
            }
            
            timeSlotsContainer.appendChild(timeSlotElement);
            
            // Move to next 30-minute slot
            currentTime.setMinutes(currentTime.getMinutes() + 30);
        }
    }

    selectTimeSlot(time) {
        console.log('selectTimeSlot called with:', time);
        
        // Remove previous selection
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Find and select the clicked time slot
        const timeSlots = document.querySelectorAll('.time-slot');
        let found = false;
        
        timeSlots.forEach(slot => {
            const slotText = slot.textContent.trim();
            const timeText = time.trim();
            
            if (slotText === timeText) {
                slot.classList.add('selected');
                found = true;
                console.log('Time slot selected:', slotText);
                
                // Add visual feedback
                slot.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    slot.style.transform = 'scale(1)';
                }, 200);
            }
        });
        
        if (!found) {
            console.log('Time slot not found for:', time);
            console.log('Available time slots:', Array.from(timeSlots).map(slot => slot.textContent.trim()));
        }
        
        this.selectedTime = time;
        this.updateSummary();
    }

    updateSummary() {
        const summarySection = document.getElementById('appointmentSummary');
        const summaryDetails = document.getElementById('summaryDetails');
        
        if (!this.selectedBarber || !this.selectedService || !this.selectedDate || !this.selectedTime) {
            summarySection.classList.add('hidden');
            return;
        }
        
        const barber = this.barberSchedules[this.selectedBarber];
        const servicePrice = this.servicePrices[this.selectedService];
        const customerName = document.getElementById('customerName').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerEmail = document.getElementById('customerEmail').value;
        
        const formattedDate = this.selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        summaryDetails.innerHTML = `
            <div class="space-y-2">
                <p><strong>Barber:</strong> ${barber.name} - ${barber.title}</p>
                <p><strong>Service:</strong> ${this.getServiceName(this.selectedService)} - $${servicePrice}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${this.selectedTime}</p>
                ${customerName ? `<p><strong>Name:</strong> ${customerName}</p>` : ''}
                ${customerPhone ? `<p><strong>Phone:</strong> ${customerPhone}</p>` : ''}
                ${customerEmail ? `<p><strong>Email:</strong> ${customerEmail}</p>` : ''}
            </div>
        `;
        
        summarySection.classList.remove('hidden');
    }

    async handleBooking() {
        if (!this.validateForm()) {
            return;
        }
        
        const formData = this.getFormData();
        
        try {
            // Show loading state
            this.showLoading();
            
            // Simulate API call (replace with actual backend integration)
            await this.submitBooking(formData);
            
            // Save appointment locally
            this.saveAppointment(formData);
            
            // Show success modal
            this.showSuccessModal();
            
            // Reset form
            this.resetForm();
            
        } catch (error) {
            console.error('Booking failed:', error);
            this.showError('Failed to book appointment. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    validateForm() {
        const requiredFields = ['barberSelect', 'serviceSelect', 'customerName', 'customerPhone'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const value = field.value.trim();
            
            if (!value) {
                field.classList.add('error');
                isValid = false;
            } else {
                field.classList.remove('error');
            }
        });
        
        // Validate email format if provided
        const emailField = document.getElementById('customerEmail');
        const emailValue = emailField.value.trim();
        if (emailValue && !this.isValidEmail(emailValue)) {
            emailField.classList.add('error');
            this.showError('Please enter a valid email address.');
            isValid = false;
        } else {
            emailField.classList.remove('error');
        }
        
        if (!this.selectedDate) {
            this.showError('Please select a date.');
            isValid = false;
        }
        
        if (!this.selectedTime) {
            this.showError('Please select a time.');
            isValid = false;
        }
        
        return isValid;
    }

    getFormData() {
        return {
            barber: this.selectedBarber,
            service: this.selectedService,
            date: this.selectedDate,
            time: this.selectedTime,
            customerName: document.getElementById('customerName').value,
            customerPhone: document.getElementById('customerPhone').value,
            customerEmail: document.getElementById('customerEmail').value,
            specialRequests: document.getElementById('specialRequests').value,
            price: this.servicePrices[this.selectedService],
            appointmentId: this.generateAppointmentId()
        };
    }

    async submitBooking(formData) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Here you would typically send the data to your backend
        // For now, we'll just log it
        console.log('Booking submitted:', formData);
        
        // TODO: Integrate with email service to send to vy.m.dao@gmail.com
        // You could integrate with services like:
        // - Google Calendar API
        // - Email service (SendGrid, Mailgun)
        // - SMS service (Twilio)
        // - Database storage
        
        // Example email integration:
        // const emailData = {
        //     to: 'vy.m.dao@gmail.com',
        //     subject: 'New Appointment Booking',
        //     body: `New appointment booked:
        //             Barber: ${formData.barber}
        //             Service: ${formData.service}
        //             Date: ${formData.date}
        //             Time: ${formData.time}
        //             Customer: ${formData.customerName}
        //             Phone: ${formData.customerPhone}
        //             Email: ${formData.customerEmail || 'Not provided'}
        //             Special Requests: ${formData.specialRequests || 'None'}`
        // };
        // await sendEmail(emailData);
    }

    // Utility methods
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    isDateAvailable(date) {
        if (!this.selectedBarber) return false;
        
        const dayOfWeek = date.getDay();
        const barberSchedule = this.barberSchedules[this.selectedBarber];
        
        return barberSchedule && barberSchedule.schedule[dayOfWeek];
    }

    isTimeSlotBooked(date, time, barber) {
        const dateString = date.toDateString();
        return this.appointments.some(appointment => 
            appointment.date.toDateString() === dateString &&
            appointment.time === time &&
            appointment.barber === barber
        );
    }

    isServiceAvailable(service, date) {
        if (!date) return true;
        
        const dayOfWeek = date.getDay();
        
        // Senior and Kids haircuts are only available on Tuesday (2) and Wednesday (3)
        if (service === 'seniorHaircut' || service === 'kidsHaircut') {
            return dayOfWeek === 2 || dayOfWeek === 3;
        }
        
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getDayIndex(date) {
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const firstDayOfWeek = firstDay.getDay();
        const dayOfMonth = date.getDate();
        
        // Calculate the actual index in the calendar grid
        // 7 day headers + empty cells before first day + day of month - 1 (since we start from 1)
        return 7 + firstDayOfWeek + dayOfMonth - 1;
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

    generateAppointmentId() {
        return 'APT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Local storage methods
    saveAppointment(appointment) {
        this.appointments.push(appointment);
        localStorage.setItem('floydsAppointments', JSON.stringify(this.appointments));
    }

    loadAppointments() {
        const stored = localStorage.getItem('floydsAppointments');
        if (stored) {
            const appointments = JSON.parse(stored);
            // Convert date strings back to Date objects
            return appointments.map(apt => ({
                ...apt,
                date: new Date(apt.date)
            }));
        }
        return [];
    }

    // UI methods
    showLoading() {
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> Booking...';
    }

    hideLoading() {
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Book Appointment';
    }

    showSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex', 'modal-enter');
    }

    hideModal() {
        const modal = document.getElementById('successModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex', 'modal-enter');
    }

    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-md shadow-lg z-50';
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    resetForm() {
        document.getElementById('bookingForm').reset();
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedBarber = null;
        this.selectedService = null;
        
        document.getElementById('timeSlotsSection').classList.add('hidden');
        document.getElementById('appointmentSummary').classList.add('hidden');
        
        // Remove selections from calendar and time slots
        document.querySelectorAll('.calendar-day.selected, .time-slot.selected').forEach(el => {
            el.classList.remove('selected');
        });
    }

    updateServiceOptions() {
        const serviceSelect = document.getElementById('serviceSelect');
        const currentValue = serviceSelect.value;
        
        // Clear existing options
        serviceSelect.innerHTML = '<option value="">Choose a service...</option>';
        
        // Add all services
        const services = [
            { value: 'haircut', name: 'Haircut - $30' },
            { value: 'fade', name: 'Fade - $35' },
            { value: 'seniorHaircut', name: 'Senior Haircut - $25' },
            { value: 'kidsHaircut', name: 'Kids Haircut - $25' },
            { value: 'beardTrim', name: 'Beard Trim - $20' }
        ];
        
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.value;
            option.textContent = service.name;
            
            // Check if service is available for selected date
            if (this.selectedDate && !this.isServiceAvailable(service.value, this.selectedDate)) {
                option.disabled = true;
                option.textContent += ' (Tuesday/Wednesday only)';
            }
            
            serviceSelect.appendChild(option);
        });
        
        // Restore previous selection if it's still valid
        if (currentValue && this.isServiceAvailable(currentValue, this.selectedDate)) {
            serviceSelect.value = currentValue;
        } else {
            this.selectedService = null;
            this.updateSummary();
        }
    }

    updateCalendar() {
        this.renderCalendar();
        if (this.selectedDate) {
            this.renderTimeSlots();
        }
    }
}

// Initialize booking system when page loads
document.addEventListener('DOMContentLoaded', () => {
    new BookingSystem();
}); 