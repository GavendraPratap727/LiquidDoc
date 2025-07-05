// Shared JavaScript utilities and functionality

// Custom cursor functionality
function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  const cursorDot = cursor?.querySelector('.cursor-dot');
  const cursorTrail = cursor?.querySelector('.cursor-trail');
  
  if (!cursor || !cursorDot || !cursorTrail) return;

  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  // Smooth trail animation
  function animateTrail() {
    trailX += (mouseX - trailX) * 0.1;
    trailY += (mouseY - trailY) * 0.1;
    
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top = trailY + 'px';
    
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Click effect
  document.addEventListener('click', (e) => {
    cursorTrail.classList.add('active');
    setTimeout(() => {
      cursorTrail.classList.remove('active');
    }, 300);
  });

  // Hover effects for interactive elements
  const interactiveElements = 'button, a, .file-card, .nav-item, input, textarea, select, .stat-card, .feature-card';
  
  document.addEventListener('mouseover', (e) => {
    if (e.target.matches(interactiveElements)) {
      cursorDot.style.transform = 'translate(-50%, -50%) scale(2)';
      cursorTrail.style.transform = 'scale(1.2)';
    }
  });
  
  document.addEventListener('mouseout', (e) => {
    if (e.target.matches(interactiveElements)) {
      cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorTrail.style.transform = 'scale(1)';
    }
  });
}

// Theme toggle functionality
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Animate theme transition
  document.body.style.transition = 'all 0.3s ease';
  setTimeout(() => {
    document.body.style.transition = '';
  }, 300);
}

// Initialize theme from localStorage
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target =   document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Animate numbers counting up
function animateNumbers() {
  const numbers = document.querySelectorAll('[data-target]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          entry.target.textContent = Math.floor(current);
        }, 16);
        
        observer.unobserve(entry.target);
      }
    });
  });
  
  numbers.forEach(number => observer.observe(number));
}

// Local storage utilities
const Storage = {
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove: (key) => {
    localStorage.removeItem(key);
  },
  
  clear: () => {
    localStorage.clear();
  }
};

// Session management
const Session = {
  login: (userData) => {
    Storage.set('user', userData);
    Storage.set('isLoggedIn', true);
  },
  
  logout: () => {
    Storage.remove('user');
    Storage.remove('isLoggedIn');
    window.location.href = 'login.html';
  },
  
  getUser: () => {
    return Storage.get('user');
  },
  
  isLoggedIn: () => {
    return Storage.get('isLoggedIn') === true;
  },
  
  requireAuth: () => {
    if (!Session.isLoggedIn()) {
      window.location.href = 'login.html';
    }
  }
};

// File management utilities
const FileManager = {
  files: Storage.get('files') || [],
  
  add: (file) => {
    const newFile = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      privacy: file.privacy || 'public',
      uploadDate: new Date().toISOString(),
      ...file
    };
    
    FileManager.files.push(newFile);
    Storage.set('files', FileManager.files);
    return newFile;
  },
  
  remove: (id) => {
    FileManager.files = FileManager.files.filter(file => file.id !== id);
    Storage.set('files', FileManager.files);
  },
  
  get: (id) => {
    return FileManager.files.find(file => file.id === id);
  },
  
  getAll: () => {
    FileManager.files = Storage.get('files') || [];
    return FileManager.files;
  },
  
  search: (query) => {
    return FileManager.files.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase())
    );
  },
  
  filter: (type) => {
    switch (type) {
      case 'public':
        return FileManager.files.filter(file => file.privacy === 'public');
      case 'private':
        return FileManager.files.filter(file => file.privacy === 'private');
      case 'recent':
        return FileManager.files
          .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
          .slice(0, 10);
      default:
        return FileManager.files;
    }
  },
  
  updatePrivacy: (id, privacy) => {
    const file = FileManager.get(id);
    if (file) {
      file.privacy = privacy;
      Storage.set('files', FileManager.files);
    }
  }
};

// Utility functions
const Utils = {
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  formatDate: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  },
  
  getFileIcon: (type) => {
    if (!type) return '📄';
    
    const typeMap = {
      // Images
      'image/jpeg': '🖼️',
      'image/jpg': '🖼️',
      'image/png': '🖼️',
      'image/gif': '🖼️',
      'image/svg+xml': '🖼️',
      'image/webp': '🖼️',
      
      // Videos
      'video/mp4': '🎥',
      'video/avi': '🎥',
      'video/mov': '🎥',
      'video/wmv': '🎥',
      'video/webm': '🎥',
      
      // Audio
      'audio/mp3': '🎵',
      'audio/wav': '🎵',
      'audio/ogg': '🎵',
      'audio/m4a': '🎵',
      
      // Documents
      'application/pdf': '📄',
      'application/msword': '📝',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
      'application/vnd.ms-excel': '📊',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
      'application/vnd.ms-powerpoint': '📈',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📈',
      'text/plain': '📄',
      'text/csv': '📊',
      
      // Archives
      'application/zip': '📦',
      'application/x-rar-compressed': '📦',
      'application/x-7z-compressed': '📦',
      'application/x-tar': '📦',
      
      // Code
      'text/html': '💻',
      'text/css': '💻',
      'text/javascript': '💻',
      'application/json': '💻',
      'text/xml': '💻',
      
      // Other
      'application/octet-stream': '📄'
    };
    
    return typeMap[type] || '📄';
  },
  
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  sanitizeFileName: (fileName) => {
    return fileName.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
  },
  
  getFileExtension: (fileName) => {
    return fileName.split('.').pop().toLowerCase();
  },
  
  isValidFileType: (type, allowedTypes = []) => {
    if (allowedTypes.length === 0) return true;
    return allowedTypes.some(allowedType => type.includes(allowedType));
  },
  
  formatBytes: (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
};

// Notification system
const Notifications = {
  show: (message, type = 'info', duration = 3000) => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ'
    };
    
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${icons[type]}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
};

// Performance monitoring
const Performance = {
  mark: (name) => {
    if (window.performance && window.performance.mark) {
      window.performance.mark(name);
    }
  },
  
  measure: (name, startMark, endMark) => {
    if (window.performance && window.performance.measure) {
      window.performance.measure(name, startMark, endMark);
    }
  },
  
  getEntries: () => {
    if (window.performance && window.performance.getEntries) {
      return window.performance.getEntries();
    }
    return [];
  }
};

// Initialize shared functionality
document.addEventListener('DOMContentLoaded', () => {
  Performance.mark('dom-loaded');
  
  initTheme();
  initCustomCursor();
  initSmoothScrolling();
  animateNumbers();
  
  Performance.mark('init-complete');
  Performance.measure('initialization', 'dom-loaded', 'init-complete');
});

// Global logout function
function logout() {
  Session.logout();
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // In production, you might want to send this to an error tracking service
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // In production, you might want to send this to an error tracking service
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    Storage, 
    Session, 
    FileManager, 
    Utils, 
    Notifications, 
    Performance 
  };
}