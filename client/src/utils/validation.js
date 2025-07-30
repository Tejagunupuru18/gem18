// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Phone number validation
export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

// Name validation
export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

// Required field validation
export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

// Age validation (must be 13+ for students)
export const validateAge = (age) => {
  const numAge = parseInt(age);
  return numAge >= 13 && numAge <= 100;
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const value = formData[field];
    const rules = validationRules[field];
    
    if (rules.required && !validateRequired(value)) {
      errors[field] = `${field} is required`;
    } else if (value && rules.email && !validateEmail(value)) {
      errors[field] = 'Please enter a valid email address';
    } else if (value && rules.password && !validatePassword(value)) {
      errors[field] = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    } else if (value && rules.phone && !validatePhone(value)) {
      errors[field] = 'Please enter a valid phone number';
    } else if (value && rules.name && !validateName(value)) {
      errors[field] = 'Name must be at least 2 characters';
    } else if (value && rules.age && !validateAge(value)) {
      errors[field] = 'Age must be between 13 and 100';
    } else if (value && rules.minLength && value.length < rules.minLength) {
      errors[field] = `${field} must be at least ${rules.minLength} characters`;
    } else if (value && rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `${field} must be less than ${rules.maxLength} characters`;
    }
  });
  
  return errors;
}; 