

// Get form elements
const form = document.getElementById('registrationForm');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordStrength = document.getElementById('passwordStrength');



/**
 * Validates the full name field
 * Requirements: At least 2 characters, only letters and spaces
 * @returns {boolean} True if valid, false otherwise
 */
function validateFullName() {
    const fullName = document.getElementById('fullName');
    const error = document.getElementById('fullNameError');
    const isValid = fullName.value.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(fullName.value);
    
    toggleValidation(fullName, error, isValid);
    return isValid;
}

/**
 * Validates the email address field
 * Uses standard email regex pattern
 * @returns {boolean} True if valid, false otherwise
 */
function validateEmail() {
    const email = document.getElementById('email');
    const error = document.getElementById('emailError');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailPattern.test(email.value);
    
    toggleValidation(email, error, isValid);
    return isValid;
}

/**
 * Validates the phone number field
 * Requirements: 10-15 digits (removes non-digit characters for validation)
 * @returns {boolean} True if valid, false otherwise
 */
function validatePhone() {
    const phone = document.getElementById('phone');
    const error = document.getElementById('phoneError');
    const cleanPhone = phone.value.replace(/\D/g, '');
    const isValid = cleanPhone.length >= 10 && cleanPhone.length <= 15;
    
    toggleValidation(phone, error, isValid);
    return isValid;
}

/**
 * Validates the address field
 * Requirements: At least 5 characters
 * @returns {boolean} True if valid, false otherwise
 */
function validateAddress() {
    const address = document.getElementById('address');
    const error = document.getElementById('addressError');
    const isValid = address.value.trim().length >= 5;
    
    toggleValidation(address, error, isValid);
    return isValid;
}

/**
 * Validates the city field
 * Requirements: At least 2 characters
 * @returns {boolean} True if valid, false otherwise
 */
function validateCity() {
    const city = document.getElementById('city');
    const error = document.getElementById('cityError');
    const isValid = city.value.trim().length >= 2;
    
    toggleValidation(city, error, isValid);
    return isValid;
}

/**
 * Validates the postal code field
 * Requirements: At least 3 characters (supports various formats)
 * @returns {boolean} True if valid, false otherwise
 */
function validatePostalCode() {
    const postalCode = document.getElementById('postalCode');
    const error = document.getElementById('postalCodeError');
    const isValid = postalCode.value.trim().length >= 3;
    
    toggleValidation(postalCode, error, isValid);
    return isValid;
}

/**
 * Validates the password field
 * Requirements: At least 8 characters with uppercase, lowercase, and number
 * @returns {boolean} True if valid, false otherwise
 */
function validatePassword() {
    const password = passwordInput.value;
    const error = document.getElementById('passwordError');
    
    // Check password requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLongEnough = password.length >= 8;
    
    const isValid = hasUpperCase && hasLowerCase && hasNumber && isLongEnough;
    
    toggleValidation(passwordInput, error, isValid);
    updatePasswordStrength(password);
    
    // Revalidate confirm password if it has content
    if (confirmPasswordInput.value) {
        validateConfirmPassword();
    }
    
    return isValid;
}

/**
 * Validates the confirm password field
 * Requirements: Must match the password field
 * @returns {boolean} True if valid, false otherwise
 */
function validateConfirmPassword() {
    const error = document.getElementById('confirmPasswordError');
    const isValid = confirmPasswordInput.value === passwordInput.value && confirmPasswordInput.value.length > 0;
    
    toggleValidation(confirmPasswordInput, error, isValid);
    return isValid;
}

/**
 * Validates the terms and conditions checkbox
 * Requirements: Must be checked
 * @returns {boolean} True if valid, false otherwise
 */
function validateTerms() {
    const terms = document.getElementById('terms');
    const error = document.getElementById('termsError');
    const isValid = terms.checked;
    
    if (!isValid) {
        error.style.display = 'block';
    } else {
        error.style.display = 'none';
    }
    
    return isValid;
}


/**
 * Toggles validation styling and error messages for form inputs
 * @param {HTMLElement} input - The input element
 * @param {HTMLElement} errorElement - The error message element
 * @param {boolean} isValid - Whether the input is valid
 */
function toggleValidation(input, errorElement, isValid) {
    if (isValid) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        errorElement.style.display = 'none';
    } else {
        input.classList.remove('is-valid');
        input.classList.add('is-invalid');
        errorElement.style.display = 'block';
    }
}

/**
 * Updates the password strength indicator based on password complexity
 * @param {string} password - The password to evaluate
 */
function updatePasswordStrength(password) {
    let strength = 0;
    
    // Calculate strength score
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    // Remove all strength classes
    passwordStrength.className = 'password-strength';
    
    // Add appropriate strength class
    if (strength === 0 || strength === 1) {
        passwordStrength.classList.add('strength-weak');
    } else if (strength === 2 || strength === 3) {
        passwordStrength.classList.add('strength-medium');
    } else {
        passwordStrength.classList.add('strength-strong');
    }
}



document.getElementById('fullName').addEventListener('blur', validateFullName);
document.getElementById('email').addEventListener('blur', validateEmail);
document.getElementById('phone').addEventListener('blur', validatePhone);
document.getElementById('address').addEventListener('blur', validateAddress);
document.getElementById('city').addEventListener('blur', validateCity);
document.getElementById('postalCode').addEventListener('blur', validatePostalCode);
passwordInput.addEventListener('input', validatePassword);
confirmPasswordInput.addEventListener('input', validateConfirmPassword);
document.getElementById('terms').addEventListener('change', validateTerms);

/* FORM SUBMISSION HANDLER */

form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Validate all fields
    const isFullNameValid = validateFullName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();
    const isAddressValid = validateAddress();
    const isCityValid = validateCity();
    const isPostalCodeValid = validatePostalCode();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    const areTermsAccepted = validateTerms();
    
    // Check if all validations pass
    const isFormValid = isFullNameValid && isEmailValid && isPhoneValid && 
                       isAddressValid && isCityValid && isPostalCodeValid &&
                       isPasswordValid && isConfirmPasswordValid && areTermsAccepted;
    
    if (isFormValid) {
        // Create user data object
        const userData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            postalCode: document.getElementById('postalCode').value,
            newsletter: document.getElementById('newsletter').checked,
            registrationDate: new Date().toISOString()
        };
        
        // Save to localStorage (in production, this would be sent to a backend server)
        localStorage.setItem('greenyStoreUser', JSON.stringify(userData));
        
        // Show success modal
        document.getElementById('successModal').style.display = 'flex';
    } else {
        // Scroll to first error field
        const firstError = document.querySelector('.is-invalid');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    }
});


/**
 * Redirects user to home page after successful registration
 * This function is called from the success modal button
 */
function redirectToHome() {
    window.location.href = 'index.html';
}

// Make function globally accessible for onclick handler
window.redirectToHome = redirectToHome;