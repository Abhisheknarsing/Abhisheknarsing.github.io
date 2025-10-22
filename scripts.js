// Check for saved theme preference or respect OS preference
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

if (initialTheme === 'dark') {
  document.documentElement.classList.add('dark-mode');
  document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
}

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');

mobileMenuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('mobile-open');
});

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark-mode');
  
  // Update icon
  if (document.documentElement.classList.contains('dark-mode')) {
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    localStorage.setItem('theme', 'dark');
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', 'light');
  }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop,
        behavior: 'smooth'
      });
      
      // Close mobile menu if open
      if (sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
      }
      
      // Update active nav link
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });
      this.classList.add('active');
    }
  });
});

// Set active nav link based on scroll position
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    
    if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
  
  // Reveal sections on scroll
  document.querySelectorAll('.section-reveal').forEach(section => {
    const sectionTop = section.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (sectionTop < windowHeight - 100) {
      section.classList.add('visible');
    }
  });
});

// Trigger scroll events on load
window.addEventListener('load', () => {
  window.dispatchEvent(new Event('scroll'));
});

// Contact form validation and submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formMessage = document.getElementById('formMessage');
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Simple validation
    if (!name || !email || !subject || !message) {
      formMessage.textContent = 'Please fill in all required fields.';
      formMessage.className = 'p-4 rounded-lg bg-red-100 text-red-700 sketch-border';
      formMessage.classList.remove('hidden');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      formMessage.textContent = 'Please enter a valid email address.';
      formMessage.className = 'p-4 rounded-lg bg-red-100 text-red-700 sketch-border';
      formMessage.classList.remove('hidden');
      return;
    }
    
    // Success message (in a real application, you would send the form data to a server)
    formMessage.textContent = 'Thank you for your message! I will get back to you soon.';
    formMessage.className = 'p-4 rounded-lg bg-green-100 text-green-700 sketch-border';
    formMessage.classList.remove('hidden');
    
    // Reset form
    contactForm.reset();
    
    // Hide message after 5 seconds
    setTimeout(() => {
      formMessage.classList.add('hidden');
    }, 5000);
  });
}

// Add animation to hero section buttons on hover
document.addEventListener('DOMContentLoaded', function() {
  const heroButtons = document.querySelectorAll('#home .flex a');
  heroButtons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.classList.add('pulse-animation');
    });
    
    button.addEventListener('mouseleave', function() {
      this.classList.remove('pulse-animation');
    });
  });
  
  // Initialize typing effect
  const typingText = document.querySelector('.typing-text');
  if (typingText) {
    // Reset animation
    typingText.style.animation = 'none';
    setTimeout(() => {
      typingText.style.animation = '';
    }, 10);
  }
  
  // Hide preloader when page is loaded
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 300);
    }, 500);
  }
});