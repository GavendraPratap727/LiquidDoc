// 404 Error page specific JavaScript

class ErrorPage {
  constructor() {
    this.easterEggShown = false;
    this.init();
  }
  
  init() {
    this.initEasterEgg();
    this.initSoundEffects();
    this.addInteractiveElements();
  }
  
  initEasterEgg() {
    const sadPaper = document.getElementById('sadPaper');
    const easterEgg = document.getElementById('easterEgg');
    let clickCount = 0;
    
    if (sadPaper && easterEgg) {
      sadPaper.addEventListener('click', () => {
        clickCount++;
        
        if (clickCount >= 5 && !this.easterEggShown) {
          this.showEasterEgg();
        } else if (clickCount < 5) {
          // Add a little bounce effect for each click
          sadPaper.style.animation = 'none';
          setTimeout(() => {
            sadPaper.style.animation = 'paperFloat 3s ease-in-out infinite';
          }, 10);
          
          // Add extra teardrops
          this.addExtraTeardrop();
        }
      });
    }
  }
  
  showEasterEgg() {
    const easterEgg = document.getElementById('easterEgg');
    const sadPaper = document.getElementById('sadPaper');
    
    this.easterEggShown = true;
    
    // Hide sad paper
    sadPaper.style.opacity = '0';
    sadPaper.style.transform = 'scale(0)';
    
    // Show easter egg after delay
    setTimeout(() => {
      easterEgg.classList.add('show');
      this.playSuccessSound();
    }, 500);
    
    // Auto-hide easter egg after 10 seconds
    setTimeout(() => {
      this.hideEasterEgg();
    }, 10000);
  }
  
  hideEasterEgg() {
    const easterEgg = document.getElementById('easterEgg');
    const sadPaper = document.getElementById('sadPaper');
    
    easterEgg.classList.remove('show');
    
    setTimeout(() => {
      sadPaper.style.opacity = '1';
      sadPaper.style.transform = 'scale(1)';
      this.easterEggShown = false;
    }, 500);
  }
  
  addExtraTeardrop() {
    const teardrops = document.querySelector('.teardrops');
    const teardrop = document.createElement('div');
    teardrop.textContent = '💧';
    teardrop.style.position = 'absolute';
    teardrop.style.left = Math.random() * 30 - 15 + 'px';
    teardrop.style.fontSize = '1rem';
    teardrop.style.animation = 'teardrop 2s ease-in-out forwards';
    teardrop.style.animationDelay = '0s';
    
    teardrops.appendChild(teardrop);
    
    setTimeout(() => {
      teardrop.remove();
    }, 2000);
  }
  
  initSoundEffects() {
    // Create audio context for sound effects (optional)
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Audio context not supported');
    }
  }
  
  playSuccessSound() {
    // Simple beep sound using Web Audio API
    if (this.audioContext) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    }
  }
  
  addInteractiveElements() {
    // Make waves interactive
    const waves = document.querySelectorAll('.wave');
    waves.forEach((wave, index) => {
      wave.addEventListener('mouseover', () => {
        wave.style.animationDuration = '3s';
        wave.style.opacity = '0.6';
      });
      
      wave.addEventListener('mouseout', () => {
        wave.style.animationDuration = '6s';
        wave.style.opacity = index === 0 ? '0.4' : index === 1 ? '0.3' : '0.2';
      });
    });
    
    // Add floating animation to error code
    const errorCode = document.querySelector('.error-code');
    if (errorCode) {
      let mouseX = 0, mouseY = 0;
      
      document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
        
        errorCode.style.transform = `translate(${mouseX * 0.1}px, ${mouseY * 0.1}px)`;
      });
    }
    
    // Add particle effect on button hover
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        this.createParticles(button);
      });
    });
  }
  
  createParticles(element) {
    const rect = element.getBoundingClientRect();
    const particleCount = 5;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'fixed';
      particle.style.left = rect.left + Math.random() * rect.width + 'px';
      particle.style.top = rect.top + Math.random() * rect.height + 'px';
      particle.style.width = '4px';
      particle.style.height = '4px';
      particle.style.background = 'var(--primary-color)';
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '1000';
      particle.style.animation = 'particleFloat 1s ease-out forwards';
      
      document.body.appendChild(particle);
      
      setTimeout(() => {
        particle.remove();
      }, 1000);
    }
  }
}

// Navigation functions
function goHome() {
  window.location.href = 'index.html';
}

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    goHome();
  }
}

// Initialize error page
document.addEventListener('DOMContentLoaded', () => {
  new ErrorPage();
  
  // Add particle float animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particleFloat {
      0% {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
      100% {
        transform: translateY(-50px) scale(0);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Add keyboard navigation
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'h':
      case 'H':
        goHome();
        break;
      case 'b':
      case 'B':
        goBack();
        break;
      case 'Escape':
        goHome();
        break;
    }
  });
  
  // Add some random floating elements
  setTimeout(() => {
    createFloatingElements();
  }, 2000);
});

function createFloatingElements() {
  const elements = ['📄', '📁', '💧', '✨'];
  
  for (let i = 0; i < 10; i++) {
    const element = document.createElement('div');
    element.textContent = elements[Math.floor(Math.random() * elements.length)];
    element.style.position = 'fixed';
    element.style.left = Math.random() * window.innerWidth + 'px';
    element.style.top = window.innerHeight + 'px';
    element.style.fontSize = Math.random() * 20 + 10 + 'px';
    element.style.opacity = Math.random() * 0.5 + 0.2;
    element.style.pointerEvents = 'none';
    element.style.zIndex = '-1';
    element.style.animation = `floatUp ${Math.random() * 10 + 10}s linear forwards`;
    
    document.body.appendChild(element);
    
    setTimeout(() => {
      element.remove();
    }, 20000);
  }
}

// Add float up animation
const floatStyle = document.createElement('style');
floatStyle.textContent = `
  @keyframes floatUp {
    0% {
      transform: translateY(0) rotate(0deg);
    }
    100% {
      transform: translateY(-${window.innerHeight + 100}px) rotate(360deg);
    }
  }
`;
document.head.appendChild(floatStyle);