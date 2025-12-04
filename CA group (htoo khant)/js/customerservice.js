/*
|--------------------------------------------------------------------------
| CUSTOMER SERVICE PAGE JAVASCRIPT
|--------------------------------------------------------------------------
| Handles FAQ accordion functionality and contact form submission
*/

/*
|--------------------------------------------------------------------------
| FAQ ACCORDION FUNCTIONALITY
|--------------------------------------------------------------------------
*/

/**
 * Toggles the FAQ answer visibility when a question is clicked
 * Implements accordion behavior (only one FAQ open at a time)
 * @param {HTMLElement} button - The FAQ question button that was clicked
 */
function toggleFAQ(button) {
    // Get the answer div (next sibling of the button)
    const answer = button.nextElementSibling;
    
    // Check if this FAQ is currently active
    const isActive = button.classList.contains('active');
    
    // Close all open FAQs first (accordion behavior)
    const allFAQs = document.querySelectorAll('.faq-question');
    allFAQs.forEach(faq => {
        if (faq !== button) {
            faq.classList.remove('active');
            faq.nextElementSibling.classList.remove('show');
        }
    });
    
    // Toggle the clicked FAQ
    if (!isActive) {
        button.classList.add('active');
        answer.classList.add('show');
    } else {
        button.classList.remove('active');
        answer.classList.remove('show');
    }
}

// Make function globally accessible for onclick handlers
window.toggleFAQ = toggleFAQ;

/*
|--------------------------------------------------------------------------
| CONTACT FORM FUNCTIONALITY
|--------------------------------------------------------------------------
*/

/**
 * Validates the contact form fields
 * @returns {Object} Object containing validation status and error messages
 */
function validateContactForm() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value.trim();
    
    const errors = [];
    
    // Validate name
    if (!name || name.length < 2) {
        errors.push('Please enter your full name (at least 2 characters)');
    }
    
    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Validate subject
    if (!subject) {
        errors.push('Please select a subject for your message');
    }
    
    // Validate message
    if (!message || message.length < 10) {
        errors.push('Please enter a message (at least 10 characters)');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Handles the contact form submission
 * Validates input, shows success message, and resets form
 */
document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Validate form
    const validation = validateContactForm();
    
    if (!validation.isValid) {
        // Show validation errors
        alert('Please fix the following errors:\n\n' + validation.errors.join('\n'));
        return;
    }
    
    // Get form values for processing
    const contactData = {
        name: document.getElementById('contactName').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value.trim(),
        timestamp: new Date().toISOString()
    };
    
    // In a real application, this would send data to a backend server
    // For demonstration, we'll just log it and show success message
    console.log('Contact Form Data:', contactData);
    
    // Show success message
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    
    // Reset form
    this.reset();
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Hide success message after 5 seconds
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
});

/*
|--------------------------------------------------------------------------
| PAGE LOAD INITIALIZATION
|--------------------------------------------------------------------------
*/

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Customer Service page loaded successfully');
    
    // Optional: Auto-scroll to specific section if URL has hash
    if (window.location.hash) {
        const element = document.querySelector(window.location.hash);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }
});