// Landing page JavaScript

// Particle system for background
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 80;
    this.mouse = { x: 0, y: 0 };
    
    this.resize();
    this.init();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  init() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        color: `hsl(${220 + Math.random() * 40}, 70%, ${60 + Math.random() * 20}%)`
      });
    }
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach((particle, index) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Mouse interaction
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.vx += dx * force * 0.001;
        particle.vy += dy * force * 0.001;
      }
      
      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fill();
      
      // Connect nearby particles
      for (let j = index + 1; j < this.particles.length; j++) {
        const other = this.particles[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(other.x, other.y);
          this.ctx.strokeStyle = particle.color;
          this.ctx.globalAlpha = (120 - distance) / 120 * 0.2;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    });
    
    this.ctx.globalAlpha = 1;
    requestAnimationFrame(() => this.animate());
  }
}

// Scroll animations using Intersection Observer
class ScrollAnimations {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
        }
      });
    }, this.observerOptions);
    
    this.init();
  }
  
  init() {
    // Observe all elements with data-aos attributes
    document.querySelectorAll('[data-aos]').forEach(el => {
      this.observer.observe(el);
    });
  }
}

// Navigation functionality
class Navigation {
  constructor() {
    this.navbar = document.getElementById('navbar');
    this.navToggle = document.getElementById('navToggle');
    this.navMenu = document.getElementById('navMenu');
    this.navLinks = document.querySelectorAll('.nav-link');
    
    this.init();
  }
  
  init() {
    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
    });
    
    // Mobile menu toggle
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => {
        this.navMenu.classList.toggle('active');
      });
    }
    
    // Active link highlighting
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        this.scrollToSection(targetId);
        this.setActiveLink(link);
        
        // Close mobile menu
        this.navMenu.classList.remove('active');
      });
    });
    
    // Update active link on scroll
    window.addEventListener('scroll', () => {
      this.updateActiveLink();
    });
  }
  
  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
  
  setActiveLink(activeLink) {
    this.navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
  }
  
  updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (activeLink) {
          this.setActiveLink(activeLink);
        }
      }
    });
  }
}

// Contact form functionality
class ContactForm {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.init();
  }
  
  init() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }
  }
  
  async handleSubmit() {
    const formData = new FormData(this.form);
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    const resultDiv = document.getElementById('result');
    
    // Show loading state
    submitBtn.innerHTML = '<div class="loading-spinner"></div>';
    submitBtn.disabled = true;
    
    try {
      // Submit to Web3Forms
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        resultDiv.textContent = 'Message sent successfully! We\'ll get back to you soon.';
        resultDiv.style.backgroundColor = '#10b981';
        resultDiv.style.display = 'block';
        this.form.reset();
        setTimeout(() => {
          resultDiv.style.display = 'none';
        }, 5000);
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
      resultDiv.textContent = 'Failed to send message. Please try again later.';
      resultDiv.style.backgroundColor = '#ef4444';
      resultDiv.style.display = 'block';
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }
  
  // showSuccessMessage is no longer needed as we're using the result div
  // for displaying messages
}

// Magnetic button effects
class MagneticButtons {
  constructor() {
    this.buttons = document.querySelectorAll('.magnetic-btn');
    this.init();
  }
  
  init() {
    this.buttons.forEach(button => {
      button.addEventListener('mousemove', (e) => {
        this.handleMouseMove(e, button);
      });
      
      button.addEventListener('mouseleave', () => {
        this.handleMouseLeave(button);
      });
      
      button.addEventListener('click', (e) => {
        this.handleClick(e, button);
      });
    });
  }
  
  handleMouseMove(e, button) {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = 80;
    
    if (distance < maxDistance) {
      const strength = (maxDistance - distance) / maxDistance;
      const moveX = x * strength * 0.4;
      const moveY = y * strength * 0.4;
      
      button.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
    }
  }
  
  handleMouseLeave(button) {
    button.style.transform = 'translate(0, 0) scale(1)';
  }
  
  handleClick(e, button) {
    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'btn-ripple';
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }
}

// Utility functions
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
}

function navigateToLogin() {
  // Add page transition effect
  const transition = document.createElement('div');
  transition.className = 'page-transition';
  transition.innerHTML = '<div class="transition-overlay"></div>';
  document.body.appendChild(transition);
  
  setTimeout(() => {
    transition.classList.add('active');
  }, 10);
  
  setTimeout(() => {
    window.location.href = 'new_login.html';
  }, 800);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize particle system
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    new ParticleSystem(canvas);
  }
  
  // Initialize other components
  new ScrollAnimations();
  new Navigation();
  new ContactForm();
  new MagneticButtons();
  
  // Add CSS for dynamic elements
  const style = document.createElement('style');
  style.textContent = `
    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    
    .btn-ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple-animation 0.6s linear;
      pointer-events: none;
    }
    
    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    .success-message {
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: var(--success-color);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
      transform: translateX(400px);
      opacity: 0;
      transition: all 0.4s ease;
      z-index: 1000;
    }
    
    .success-message.show {
      transform: translateX(0);
      opacity: 1;
    }
    
    .success-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .success-icon {
      font-size: 1.2rem;
      font-weight: bold;
    }
    
    .page-transition {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .page-transition.active {
      opacity: 1;
      pointer-events: all;
    }
    
    .transition-overlay {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      clip-path: circle(0% at 50% 50%);
      transition: clip-path 0.8s ease-out;
    }
    
    .page-transition.active .transition-overlay {
      clip-path: circle(150% at 50% 50%);
    }
  `;
  document.head.appendChild(style);
  
  // Parallax effect for 3D elements
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-cube, .floating-sphere');
    
    parallaxElements.forEach((element, index) => {
      const speed = 0.5 + (index * 0.1);
      element.style.transform = `translateY(${scrolled * speed}px) rotateX(${scrolled * 0.1}deg) rotateY(${scrolled * 0.05}deg)`;
    });
  });
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
  const canvas = document.getElementById('particleCanvas');
  if (canvas && document.hidden) {
    // Pause animations when page is hidden
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
});