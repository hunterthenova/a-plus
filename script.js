// Business hours in Mountain Time (MT) - Pocatello/Idaho Falls timezone
const businessHours = {
    0: null, // Sunday - Closed
    1: { open: 8, close: 18 }, // Monday 8 AM - 6 PM
    2: { open: 8, close: 18 }, // Tuesday
    3: { open: 8, close: 18 }, // Wednesday
    4: { open: 8, close: 18 }, // Thursday
    5: { open: 8, close: 18 }, // Friday
    6: { open: 9, close: 16 }  // Saturday 9 AM - 4 PM
};

// Convert user's local time to Mountain Time
function getBusinessLocalTime() {
    const now = new Date();
    const mtTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Denver' }));
    return mtTime;
}

// Check if business is currently open
function isBusinessOpen() {
    const mtTime = getBusinessLocalTime();
    const day = mtTime.getDay();
    const hour = mtTime.getHours();
    const minute = mtTime.getMinutes();
    const currentTime = hour + (minute / 60);

    const todayHours = businessHours[day];

    if (!todayHours) {
        return false;
    }

    return currentTime >= todayHours.open && currentTime < todayHours.close;
}

// Get next opening time
function getNextOpeningTime() {
    const mtTime = getBusinessLocalTime();
    let day = mtTime.getDay();
    const hour = mtTime.getHours();
    const minute = mtTime.getMinutes();
    const currentTime = hour + (minute / 60);

    const todayHours = businessHours[day];
    if (todayHours && currentTime < todayHours.open) {
        return {
            day: getDayName(day),
            time: formatTime(todayHours.open)
        };
    }

    for (let i = 1; i <= 7; i++) {
        const nextDay = (day + i) % 7;
        if (businessHours[nextDay]) {
            return {
                day: getDayName(nextDay),
                time: formatTime(businessHours[nextDay].open)
            };
        }
    }

    return null;
}

// Get closing time for today
function getTodayClosingTime() {
    const mtTime = getBusinessLocalTime();
    const day = mtTime.getDay();
    const todayHours = businessHours[day];

    if (todayHours) {
        return formatTime(todayHours.close);
    }
    return null;
}

// Format hour (24h) to 12h AM/PM
function formatTime(hour) {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${hour12}:00 ${ampm}`;
}

// Get day name from number
function getDayName(day) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
}

// Update status indicators
function updateStatusIndicators() {
    const isOpen = isBusinessOpen();
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    const currentTimeEl = document.getElementById('currentTime');
    const statusMessageEl = document.getElementById('statusMessage');

    const mtTime = getBusinessLocalTime();
    const day = mtTime.getDay();

    const timeString = mtTime.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Denver'
    });

    if (currentTimeEl) {
        currentTimeEl.textContent = timeString;
    }

    if (statusDot && statusText) {
        if (isOpen) {
            statusDot.classList.add('open');
            statusDot.classList.remove('closed');
            statusText.textContent = 'Open Now';

            const closingTime = getTodayClosingTime();
            if (statusMessageEl && closingTime) {
                statusMessageEl.textContent = `We're open! Closing at ${closingTime}`;
            }
        } else {
            statusDot.classList.add('closed');
            statusDot.classList.remove('open');
            statusText.textContent = 'Closed';

            const nextOpening = getNextOpeningTime();
            if (statusMessageEl && nextOpening) {
                if (nextOpening.day === getDayName(day)) {
                    statusMessageEl.textContent = `Currently closed. Opening today at ${nextOpening.time}`;
                } else {
                    statusMessageEl.textContent = `Currently closed. Opening ${nextOpening.day} at ${nextOpening.time}`;
                }
            }
        }
    }

    const allDayHours = document.querySelectorAll('.day-hours');
    allDayHours.forEach(dayEl => {
        if (parseInt(dayEl.dataset.day) === day) {
            dayEl.classList.add('today');
        } else {
            dayEl.classList.remove('today');
        }
    });
}

// Animated Counter for Statistics
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Service Selector Filtering
function initServiceSelector() {
    const selectorBtns = document.querySelectorAll('.selector-btn');
    const serviceCards = document.querySelectorAll('.service-card');

    selectorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.service;

            selectorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            serviceCards.forEach(card => {
                const category = card.dataset.category;
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// Carousel Functionality with Indicators
function initCarousel() {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-btn.next');
    const prevButton = document.querySelector('.carousel-btn.prev');
    const indicatorsContainer = document.getElementById('carouselIndicators');

    if (!track || slides.length === 0) return;

    let currentSlideIndex = 0;
    const totalSlides = slides.length;

    // Create indicators
    if (indicatorsContainer) {
        slides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.classList.add('carousel-indicator');
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => {
                currentSlideIndex = index;
                updateSlidePosition();
                updateIndicators();
            });
            indicatorsContainer.appendChild(indicator);
        });
    }

    const updateSlidePosition = () => {
        const slideWidth = slides[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${currentSlideIndex * slideWidth}px)`;
    };

    const updateIndicators = () => {
        const indicators = document.querySelectorAll('.carousel-indicator');
        indicators.forEach((indicator, index) => {
            if (index === currentSlideIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    };

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
            updateSlidePosition();
            updateIndicators();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
            updateSlidePosition();
            updateIndicators();
        });
    }

    // Auto-play carousel
    setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
        updateSlidePosition();
        updateIndicators();
    }, 5000);

    window.addEventListener('resize', updateSlidePosition);
}

// Testimonial Slider
function initTestimonialSlider() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dotsContainer = document.querySelector('.testimonial-dots');

    if (!slides.length) return;

    let currentSlide = 0;

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('testimonial-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateTestimonial();
        });
        dotsContainer.appendChild(dot);
    });

    const updateTestimonial = () => {
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });

        const dots = document.querySelectorAll('.testimonial-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    };

    // Auto-rotate testimonials
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateTestimonial();
    }, 6000);
}

// Scroll to Top Button
function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollTop');
    if (!scrollBtn) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Header Scroll Effect
function initHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// Scroll Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');

                // Animate stats counters when they come into view
                if (entry.target.classList.contains('stat-item')) {
                    const number = entry.target.querySelector('.stat-number');
                    const target = parseInt(number.dataset.count);
                    if (!number.classList.contains('counted')) {
                        animateCounter(number, target);
                        number.classList.add('counted');
                    }
                }

                // Animate progress bars
                if (entry.target.classList.contains('feature-item')) {
                    const progressBar = entry.target.querySelector('.progress-bar');
                    if (progressBar && !progressBar.classList.contains('animated')) {
                        const progress = progressBar.dataset.progress;
                        progressBar.style.setProperty('--progress-width', `${progress}%`);
                        progressBar.classList.add('animated');
                        setTimeout(() => {
                            progressBar.style.width = `${progress}%`;
                        }, 100);
                    }
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Smooth Scroll for Navigation
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Contact Form Handler
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            name: form.name.value,
            phone: form.phone.value,
            service: form.service.value,
            message: form.message.value
        };

        console.log('Form submitted:', formData);

        // Show success message
        alert('Thank you for your message! We will contact you soon. For immediate assistance, please call us directly.');

        form.reset();
    });
}

// Update Year
function updateYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

// Active Navigation on Scroll
function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', function() {
    // Status and time
    updateStatusIndicators();
    setInterval(updateStatusIndicators, 60000);
    updateYear();

    // Interactive features
    initServiceSelector();
    initCarousel();
    initTestimonialSlider();
    initScrollToTop();
    initHeaderScroll();
    initScrollAnimations();
    initSmoothScroll();
    initContactForm();
    initActiveNav();

    console.log('A-Plus Towing & Recovery website loaded successfully!');
});
