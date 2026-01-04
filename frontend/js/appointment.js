// Appointment Form Handling
document.addEventListener('DOMContentLoaded', function() {
    // Form Elements
    const appointmentForm = document.getElementById('appointmentForm');
    const confirmationModal = document.getElementById('confirmationModal');
    const modalCloseBtn = document.getElementById('modalClose');
    const closeModalBtn = document.getElementById('closeModal');
    const appointmentDate = document.getElementById('appointmentDate');
    const departmentSelect = document.getElementById('department');
    const doctorSelect = document.getElementById('doctor');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    appointmentDate.min = today;
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    appointmentDate.value = tomorrow.toISOString().split('T')[0];
    
    // Department to Doctor mapping
    const doctorsByDepartment = {
        'cardiology': ['dr_smith', 'dr_johnson'],
        'neurology': ['dr_williams'],
        'pediatrics': ['dr_brown'],
        'orthopedics': ['dr_smith'],
        'dermatology': ['dr_johnson'],
        'dentistry': ['dr_williams'],
        'ophthalmology': ['dr_brown'],
        'emergency': ['dr_smith', 'dr_johnson', 'dr_williams'],
        'general': ['dr_smith', 'dr_brown']
    };
    
    // Update available doctors based on department
    departmentSelect.addEventListener('change', function() {
        const selectedDept = this.value;
        const availableDoctors = doctorsByDepartment[selectedDept] || [];
        
        // Clear current options except the first one
        while (doctorSelect.options.length > 1) {
            doctorSelect.remove(1);
        }
        
        // Add new options
        if (availableDoctors.length > 0) {
            const doctorNames = {
                'dr_smith': 'Dr. John Smith',
                'dr_johnson': 'Dr. Sarah Johnson',
                'dr_williams': 'Dr. Michael Williams',
                'dr_brown': 'Dr. Elizabeth Brown'
            };
            
            availableDoctors.forEach(doctorId => {
                const option = document.createElement('option');
                option.value = doctorId;
                option.textContent = doctorNames[doctorId];
                doctorSelect.appendChild(option);
            });
        } else {
            // Add generic option if no specific doctors
            const option = document.createElement('option');
            option.value = 'any';
            option.textContent = 'Any Available Doctor';
            doctorSelect.appendChild(option);
        }
    });
    
    // Form Submission
    appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Basic form validation
        const formData = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            date: document.getElementById('appointmentDate').value,
            time: document.getElementById('appointmentTime').value,
            department: document.getElementById('department').value,
            doctor: document.getElementById('doctor').value,
            symptoms: document.getElementById('symptoms').value,
            insurance: document.getElementById('insurance').value
        };
        
        // Validate required fields
        if (!formData.fullName || !formData.phone || !formData.date || !formData.time || !formData.department || !formData.symptoms) {
            alert('Please fill in all required fields marked with *');
            return;
        }
        
        // Validate phone number (Kenyan format)
        const phoneRegex = /^(\+254|0)[17]\d{8}$/;
        if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
            alert('Please enter a valid Kenyan phone number (e.g., +254 712 345 678 or 0712 345 678)');
            return;
        }
        
        // Generate reference number
        const refNumber = 'KTRH-' + new Date().getFullYear() + '-' + 
                         Math.floor(10000 + Math.random() * 90000);
        
        // Update modal with reference number
        document.getElementById('refNumber').textContent = refNumber;
        
        // Show confirmation modal
        confirmationModal.style.display = 'flex';
        
        // Here you would typically send data to server
        console.log('Appointment Data:', formData);
        
        // Simulate API call
        setTimeout(() => {
            // In real implementation, you would send to backend
            // fetch('/api/appointments', { method: 'POST', body: JSON.stringify(formData) })
            
            // Reset form after successful submission
            appointmentForm.reset();
            appointmentDate.value = tomorrow.toISOString().split('T')[0];
            departmentSelect.dispatchEvent(new Event('change'));
        }, 1000);
    });
    
    // Modal Close Handlers
    modalCloseBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === confirmationModal) {
            closeModal();
        }
    });
    
    function closeModal() {
        confirmationModal.style.display = 'none';
    }
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.startsWith('0')) {
            value = '+254' + value.substring(1);
        } else if (value.startsWith('254')) {
            value = '+' + value;
        } else if (value.startsWith('7') || value.startsWith('1')) {
            value = '+254' + value;
        }
        
        // Format: +254 XXX XXX XXX
        if (value.length > 3) {
            value = value.substring(0, 4) + ' ' + value.substring(4);
        }
        if (value.length > 8) {
            value = value.substring(0, 8) + ' ' + value.substring(8);
        }
        if (value.length > 12) {
            value = value.substring(0, 12) + ' ' + value.substring(12, 15);
        }
        
        e.target.value = value;
    });
    
    // Time slot validation (disable past times for today)
    const timeSelect = document.getElementById('appointmentTime');
    appointmentDate.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const today = new Date();
        
        if (selectedDate.toDateString() === today.toDateString()) {
            // If today, disable past time slots
            const currentHour = today.getHours();
            Array.from(timeSelect.options).forEach(option => {
                if (option.value) {
                    const hour = parseInt(option.value.split(':')[0]);
                    option.disabled = hour < currentHour + 2; // Disable slots less than 2 hours from now
                }
            });
        } else {
            // Enable all time slots for future dates
            Array.from(timeSelect.options).forEach(option => {
                option.disabled = false;
            });
        }
    });
    
    // Initialize department change to populate doctors
    departmentSelect.dispatchEvent(new Event('change'));
    
    // Chat widget appointment button
    const chatAppointmentBtn = document.querySelector('.chat-option[data-action="appointment"]');
    if (chatAppointmentBtn) {
        chatAppointmentBtn.addEventListener('click', function() {
            // Scroll to appointment form
            document.querySelector('.appointment-form-container').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
});