// Login page JavaScript

class LoginManager {
  constructor() {
    this.currentRole = 'user';
    this.isSignupMode = false;
    this.init();
  }
  
  init() {
    this.initEventListeners();
    this.initFormValidation();
    this.loadSavedCredentials();
  }
  
  initEventListeners() {
    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
    
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    }
    
    // Input focus effects
    this.initInputEffects();
  }
  
  initInputEffects() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('focus', (e) => {
        e.target.parentElement.classList.add('focused');
      });
      
      input.addEventListener('blur', (e) => {
        if (!e.target.value) {
          e.target.parentElement.classList.remove('focused');
        }
      });
      
      // Check if input has value on load
      if (input.value) {
        input.parentElement.classList.add('focused');
      }
    });
  }
  
  initFormValidation() {
    const inputs = document.querySelectorAll('input[required]');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        this.validateInput(input);
      });
    });
  }
  
  validateInput(input) {
    const isValid = input.checkValidity();
    const wrapper = input.closest('.input-wrapper');
    
    if (isValid) {
      wrapper.classList.remove('error');
      wrapper.classList.add('valid');
    } else {
      wrapper.classList.remove('valid');
      wrapper.classList.add('error');
    }
  }
  
  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!this.validateLoginForm(email, password)) {
      return;
    }
    
    this.showLoadingState(e.target);
    
    try {
      // Simulate API call
      await this.simulateLogin(email, password);
      
      if (this.isValidCredentials(email, password)) {
        this.handleSuccessfulLogin(email);
      } else {
        this.showError('Invalid email or password. Please try again.');
        this.hideLoadingState(e.target);
      }
    } catch (error) {
      this.showError('Login failed. Please try again.');
      this.hideLoadingState(e.target);
    }
  }
  
  async handleSignup(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!this.validateSignupForm(fullName, email, password, confirmPassword)) {
      return;
    }
    
    this.showLoadingState(e.target);
    
    try {
      // Simulate API call
      await this.simulateSignup(fullName, email, password);
      this.handleSuccessfulLogin(email, fullName);
    } catch (error) {
      this.showError('Signup failed. Please try again.');
      this.hideLoadingState(e.target);
    }
  }
  
  validateLoginForm(email, password) {
    if (!email || !password) {
      this.showError('Please fill in all fields.');
      return false;
    }
    
    if (!this.isValidEmail(email)) {
      this.showError('Please enter a valid email address.');
      return false;
    }
    
    if (password.length < 3) {
      this.showError('Password must be at least 3 characters long.');
      return false;
    }
    
    return true;
  }
  
  validateSignupForm(fullName, email, password, confirmPassword) {
    if (!fullName || !email || !password || !confirmPassword) {
      this.showError('Please fill in all fields.');
      return false;
    }
    
    if (fullName.length < 2) {
      this.showError('Please enter your full name.');
      return false;
    }
    
    if (!this.isValidEmail(email)) {
      this.showError('Please enter a valid email address.');
      return false;
    }
    
    if (password.length < 6) {
      this.showError('Password must be at least 6 characters long.');
      return false;
    }
    
    if (password !== confirmPassword) {
      this.showError('Passwords do not match.');
      return false;
    }
    
    return true;
  }
  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  isValidCredentials(email, password) {
    const validCredentials = [
      { email: 'admin@demo.com', password: 'admin123', role: 'admin' },
      { email: 'user@demo.com', password: 'user123', role: 'user' },
      { email: 'test@test.com', password: '123', role: this.currentRole },
      { email: 'demo@demo.com', password: 'demo', role: this.currentRole }
    ];
    
    return validCredentials.some(cred => 
      cred.email === email && 
      cred.password === password && 
      cred.role === this.currentRole
    );
  }
  
  async simulateLogin(email, password) {
    return new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  async simulateSignup(fullName, email, password) {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  handleSuccessfulLogin(email, fullName = null) {
    // Show success animation
    this.showSuccessAnimation();
    
    // Save user session
    const userData = {
      email: email,
      name: fullName || email.split('@')[0],
      role: this.currentRole,
      loginTime: new Date().toISOString()
    };
    
    Session.login(userData);
    
    // Save email for next time
    localStorage.setItem('savedEmail', email);
    
    // Redirect after animation
    setTimeout(() => {
      const redirectUrl = this.currentRole === 'admin' ? 'admin.html' : 'user.html';
      window.location.href = redirectUrl;
    }, 2000);
  }
  
  showLoadingState(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    btnText.style.opacity = '0';
    btnLoader.classList.remove('hidden');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
  }
  
  hideLoadingState(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    btnText.style.opacity = '1';
    btnLoader.classList.add('hidden');
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
  
  showSuccessAnimation() {
    const overlay = document.getElementById('successOverlay');
    overlay.classList.remove('hidden');
    
    setTimeout(() => {
      overlay.classList.add('show');
    }, 100);
  }
  
  showError(message) {
    const errorToast = document.getElementById('errorToast');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = message;
    errorToast.classList.remove('hidden');
    errorToast.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideError();
    }, 5000);
  }
  
  hideError() {
    const errorToast = document.getElementById('errorToast');
    errorToast.classList.remove('show');
    
    setTimeout(() => {
      errorToast.classList.add('hidden');
    }, 300);
  }
  
  loadSavedCredentials() {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      const emailInput = document.getElementById('email');
      if (emailInput) {
        emailInput.value = savedEmail;
        emailInput.parentElement.classList.add('focused');
      }
    }
  }
}

// Role switching
function switchRole(role) {
  const roleOptions = document.querySelectorAll('.role-option');
  const roleSelector = document.getElementById('roleSelector');
  
  roleOptions.forEach(option => option.classList.remove('active'));
  document.querySelector(`[data-role="${role}"]`).classList.add('active');
  
  roleSelector.setAttribute('data-role', role);
  
  if (window.loginManager) {
    window.loginManager.currentRole = role;
  }
}

// Password toggle
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(inputId + 'ToggleIcon');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.textContent = '🙈';
  } else {
    input.type = 'password';
    icon.textContent = '👁️';
  }
}

// Auth mode toggle
function toggleAuthMode() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const toggleText = document.getElementById('toggleText');
  const toggleAction = document.getElementById('toggleAction');
  
  if (window.loginManager) {
    window.loginManager.isSignupMode = !window.loginManager.isSignupMode;
    
    if (window.loginManager.isSignupMode) {
      loginForm.classList.add('hidden');
      signupForm.classList.remove('hidden');
      toggleText.textContent = 'Already have an account?';
      toggleAction.textContent = 'Sign In';
    } else {
      signupForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      toggleText.textContent = "Don't have an account?";
      toggleAction.textContent = 'Sign Up';
    }
  }
}

// Demo credentials
function fillDemoCredentials(role) {
  const credentials = {
    user: { email: 'user@demo.com', password: 'user123' },
    admin: { email: 'admin@demo.com', password: 'admin123' }
  };
  
  const cred = credentials[role];
  if (cred) {
    // Switch to correct role first
    switchRole(role);
    
    // Fill credentials
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput && passwordInput) {
      emailInput.value = cred.email;
      passwordInput.value = cred.password;
      
      // Trigger focus effects
      emailInput.parentElement.classList.add('focused');
      passwordInput.parentElement.classList.add('focused');
    }
  }
}

// Error handling
function hideError() {
  if (window.loginManager) {
    window.loginManager.hideError();
  }
}

// Initialize login page
document.addEventListener('DOMContentLoaded', () => {
  window.loginManager = new LoginManager();
  
  // Add floating animation to login card
  const loginCard = document.getElementById('loginCard');
  if (loginCard) {
    let mouseX = 0, mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 10;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 10;
      
      loginCard.style.transform = `perspective(1000px) rotateY(${mouseX * 0.1}deg) rotateX(${mouseY * -0.1}deg)`;
    });
  }
  
  // Add CSS for dynamic effects
  const style = document.createElement('style');
  style.textContent = `
    .input-wrapper.focused input {
      border-color: rgba(255, 255, 255, 0.4);
      background: rgba(255, 255, 255, 0.15);
    }
    
    .input-wrapper.valid input {
      border-color: var(--success-color);
    }
    
    .input-wrapper.error input {
      border-color: var(--error-color);
      animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    
    .success-overlay.show .success-animation {
      animation: successZoom 0.8s ease-out;
    }
    
    @keyframes successZoom {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.1);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Auto-hide demo credentials after 10 seconds
  setTimeout(() => {
    const demoCredentials = document.getElementById('demoCredentials');
    if (demoCredentials) {
      demoCredentials.style.opacity = '0';
      demoCredentials.style.transform = 'translateY(20px)';
      setTimeout(() => {
        demoCredentials.style.display = 'none';
      }, 300);
    }
  }, 15000);
});