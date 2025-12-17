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
    // Get time in Mountain Time (America/Denver)
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
        return false; // Closed on this day
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

    // Check if we can open today
    const todayHours = businessHours[day];
    if (todayHours && currentTime < todayHours.open) {
        return {
            day: getDayName(day),
            time: formatTime(todayHours.open)
        };
    }

    // Find next opening day
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

    // Get current time in MT
    const mtTime = getBusinessLocalTime();
    const day = mtTime.getDay();

    // Format current time display
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

    // Update header status
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

    // Highlight today in hours list
    const allDayHours = document.querySelectorAll('.day-hours');
    allDayHours.forEach(dayEl => {
        if (parseInt(dayEl.dataset.day) === day) {
            dayEl.classList.add('today');
        } else {
            dayEl.classList.remove('today');
        }
    });
}

// Carousel Functionality
function initCarousel() {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-btn.next');
    const prevButton = document.querySelector('.carousel-btn.prev');

    if (!track || slides.length === 0) return;

    let currentSlideIndex = 0;
    const totalSlides = slides.length;

    const updateSlidePosition = () => {
        const slideWidth = slides[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${currentSlideIndex * slideWidth}px)`;
    };

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
            updateSlidePosition();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
            updateSlidePosition();
        });
    }

    // Auto-play carousel every 5 seconds
    setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
        updateSlidePosition();
    }, 5000);

    // Update on window resize
    window.addEventListener('resize', updateSlidePosition);
}

// Smooth scroll for navigation links
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

// Update current year in footer
function updateYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize status indicators
    updateStatusIndicators();

    // Update status every minute
    setInterval(updateStatusIndicators, 60000);

    // Initialize carousel
    initCarousel();

    // Initialize smooth scrolling
    initSmoothScroll();

    // Update year
    updateYear();

    // Add active class to nav items on scroll
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
});
