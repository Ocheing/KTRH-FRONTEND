// ==========================================================================
// APPOINTMENT BOOKING CONTROLLER — POWERED BY KTRH CENTRAL DATA STORE
// ==========================================================================

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
    if (appointmentDate) appointmentDate.min = today;
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (appointmentDate) appointmentDate.value = tomorrow.toISOString().split('T')[0];
    
    // Check URL parameters for pre-selected doctor, department or service
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedDoctor = urlParams.get('doctor');
    const preselectedDept = urlParams.get('dept');

    // Update available doctors based on department
    if (departmentSelect && doctorSelect) {
        departmentSelect.addEventListener('change', function() {
            const selectedDept = this.value.toLowerCase();
            
            // Clear current options except the first
            while (doctorSelect.options.length > 1) {
                doctorSelect.remove(1);
            }
            
            let doctors = [];
            if (window.KTRHStore) {
                const allDocs = window.KTRHStore.getDoctors();
                if (selectedDept && selectedDept !== 'all' && selectedDept !== 'general') {
                    doctors = allDocs.filter(d => (d.department || '').toLowerCase() === selectedDept);
                } else {
                    doctors = allDocs;
                }
            }

            if (doctors.length > 0) {
                doctors.forEach(doc => {
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = `${doc.name} (${doc.title || doc.specialty || 'Consultant'})`;
                    doctorSelect.appendChild(option);
                });
            } else {
                const option = document.createElement('option');
                option.value = 'any';
                option.textContent = 'Next Available Specialist';
                doctorSelect.appendChild(option);
            }
        });

        // Trigger initial populate
        if (preselectedDept) {
            departmentSelect.value = preselectedDept;
        }
        departmentSelect.dispatchEvent(new Event('change'));

        if (preselectedDoctor) {
            setTimeout(() => {
                doctorSelect.value = preselectedDoctor;
            }, 100);
        }
    }
    
    // Form Submission
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                fullName: document.getElementById('fullName').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email')?.value || 'Not provided',
                date: document.getElementById('appointmentDate').value,
                time: document.getElementById('appointmentTime').value,
                department: document.getElementById('department').value,
                doctor: document.getElementById('doctor').value,
                symptoms: document.getElementById('symptoms').value,
                insurance: document.getElementById('insurance')?.value || 'None'
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
            
            // Save to KTRH Data Store
            if (window.KTRHStore) {
                const appointmentRecord = {
                    id: `apt-${Date.now()}`,
                    refNumber: refNumber,
                    ...formData,
                    status: 'Pending',
                    createdAt: new Date().toISOString()
                };
                window.KTRHStore.add('appointments', appointmentRecord);
            }

            // Update modal with reference number
            const refEl = document.getElementById('refNumber');
            if (refEl) refEl.textContent = refNumber;
            
            // Show confirmation modal
            if (confirmationModal) confirmationModal.style.display = 'flex';
            
            // Reset form
            appointmentForm.reset();
            if (appointmentDate) appointmentDate.value = tomorrow.toISOString().split('T')[0];
            if (departmentSelect) departmentSelect.dispatchEvent(new Event('change'));
        });
    }
    
    // Modal Close Handlers
    function closeModal() {
        if (confirmationModal) confirmationModal.style.display = 'none';
    }
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', function(e) {
        if (e.target === confirmationModal) closeModal();
    });
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('0')) {
                value = '+254' + value.substring(1);
            } else if (value.startsWith('254')) {
                value = '+' + value;
            } else if (value.startsWith('7') || value.startsWith('1')) {
                value = '+254' + value;
            }
            
            if (value.length > 3) value = value.substring(0, 4) + ' ' + value.substring(4);
            if (value.length > 8) value = value.substring(0, 8) + ' ' + value.substring(8);
            if (value.length > 12) value = value.substring(0, 12) + ' ' + value.substring(12, 15);
            
            e.target.value = value;
        });
    }
});
