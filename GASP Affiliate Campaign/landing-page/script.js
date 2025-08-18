// Campaign Configuration
const CAMPAIGN_CONFIG = {
    masterclassDate: '2024-12-15T19:00:00Z', // UPDATE WITH ACTUAL DATE
    timezone: 'EST',
    maxSpots: 500,
    currentSpots: 0,
    affiliateId: getUrlParameter('aff') || 'direct',
    utmSource: getUrlParameter('utm_source') || 'direct',
    utmMedium: getUrlParameter('utm_medium') || 'organic',
    utmCampaign: getUrlParameter('utm_campaign') || 'masterclass_launch',
    // ThriveCart Integration
    thrivecartUrl: 'https://checkout.thrivecart.com/YOUR_CHECKOUT_ID/', // UPDATE WITH ACTUAL THRIVECART URL
    activeCampaignUrl: 'https://YOUR_ACCOUNT.api-us1.com', // UPDATE WITH ACTUAL AC URL
    activeCampaignApiKey: 'YOUR_API_KEY' // UPDATE WITH ACTUAL API KEY
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupFormHandling();
    setupAnalytics();
    updateCountdown();
    updateSpotsRemaining();
});

// Initialize page elements
function initializePage() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.learning-item, .testimonial').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Form handling
function setupFormHandling() {
    const form = document.getElementById('masterclassForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission();
    });

    // Real-time form validation
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function handleFormSubmission() {
    const form = document.getElementById('masterclassForm');
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate form
    if (!validateForm()) {
        return;
    }

    // Show loading state
    submitButton.classList.add('loading');
    submitButton.textContent = 'Reserving Your Spot...';

    // Prepare data for submission
    const leadData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        timezone: formData.get('timezone'),
        consent: formData.get('consent') === 'on',
        affiliateId: CAMPAIGN_CONFIG.affiliateId,
        utmSource: CAMPAIGN_CONFIG.utmSource,
        utmMedium: CAMPAIGN_CONFIG.utmMedium,
        utmCampaign: CAMPAIGN_CONFIG.utmCampaign,
        timestamp: new Date().toISOString(),
        pageUrl: window.location.href,
        userAgent: navigator.userAgent
    };

    // Track conversion
    trackEvent('form_submission', leadData);

    // Submit to ActiveCampaign first
    submitToActiveCampaign(leadData)
        .then(() => {
            // Then redirect to ThriveCart for masterclass registration
            redirectToThriveCart(leadData);
        })
        .catch((error) => {
            console.error('Submission error:', error);
            showErrorMessage('There was an error. Please try again.');
            submitButton.classList.remove('loading');
            submitButton.textContent = 'Reserve My Free Spot';
        });
}

function validateForm() {
    const form = document.getElementById('masterclassForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Clear previous errors
    clearFieldError(field);

    // Validation rules
    switch (fieldName) {
        case 'firstName':
        case 'lastName':
            if (value.length < 2) {
                errorMessage = 'Name must be at least 2 characters long';
                isValid = false;
            }
            break;
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
            break;
        case 'timezone':
            if (!value) {
                errorMessage = 'Please select your timezone';
                isValid = false;
            }
            break;
        case 'consent':
            if (!field.checked) {
                errorMessage = 'You must agree to receive emails';
                isValid = false;
            }
            break;
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function showFieldError(field, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#e91e63';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#e91e63';
}

function clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    field.style.borderColor = '#e1e5e9';
}

function showSuccessMessage() {
    const form = document.getElementById('masterclassForm');
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div style="text-align: center; padding: 2rem; background: #f0f8f0; border-radius: 10px; margin-top: 1rem;">
            <h3 style="color: #2e7d32; margin-bottom: 1rem;">🎉 You're Registered!</h3>
            <p style="color: #2e7d32;">Check your email for confirmation and calendar invite.</p>
        </div>
    `;
    
    form.appendChild(successDiv);
}

// Analytics and tracking
function setupAnalytics() {
    // Track page view
    trackEvent('page_view', {
        page: 'masterclass_landing',
        affiliateId: CAMPAIGN_CONFIG.affiliateId,
        utmSource: CAMPAIGN_CONFIG.utmSource,
        utmMedium: CAMPAIGN_CONFIG.utmMedium,
        utmCampaign: CAMPAIGN_CONFIG.utmCampaign
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                trackEvent('scroll_depth', { depth: maxScroll });
            }
        }
    });

    // Track time on page
    let startTime = Date.now();
    window.addEventListener('beforeunload', function() {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);
        trackEvent('time_on_page', { seconds: timeOnPage });
    });
}

function trackEvent(eventName, data) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            event_category: 'masterclass_campaign',
            event_label: CAMPAIGN_CONFIG.affiliateId,
            ...data
        });
    }

    // Custom tracking (replace with your endpoint)
    console.log('Tracking event:', eventName, data);
    
    // Example: Send to your tracking endpoint
    // fetch('/api/track', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ event: eventName, data: data })
    // });
}

// Utility functions
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function updateCountdown() {
    const countdownElement = document.querySelector('.countdown');
    if (!countdownElement) return;

    const masterclassDate = new Date(CAMPAIGN_CONFIG.masterclassDate);
    
    function updateTimer() {
        const now = new Date();
        const timeLeft = masterclassDate - now;

        if (timeLeft <= 0) {
            countdownElement.innerHTML = '<span class="highlight">Masterclass is Live!</span>';
            return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        countdownElement.innerHTML = `
            <div class="countdown-item">
                <span class="countdown-number">${days}</span>
                <span class="countdown-label">Days</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-number">${hours}</span>
                <span class="countdown-label">Hours</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-number">${minutes}</span>
                <span class="countdown-label">Minutes</span>
            </div>
        `;
    }

    updateTimer();
    setInterval(updateTimer, 60000); // Update every minute
}

function updateSpotsRemaining() {
    const spotsElement = document.querySelector('.spots-remaining');
    if (!spotsElement) return;

    const spotsLeft = CAMPAIGN_CONFIG.maxSpots - CAMPAIGN_CONFIG.currentSpots;
    spotsElement.textContent = spotsLeft;

    if (spotsLeft <= 50) {
        spotsElement.style.color = '#e91e63';
        spotsElement.style.fontWeight = 'bold';
    }
}

// Social sharing
function shareOnSocial(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Get Pregnant Naturally Masterclass with Dr. Nashat Latib');
    const text = encodeURIComponent('Join this FREE masterclass to discover natural fertility secrets!');

    let shareUrl = '';
    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${text}%20${url}`;
            break;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        trackEvent('social_share', { platform: platform });
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('mobile-open');
}

// Smooth scroll to registration
function openRegistration() {
    const registrationSection = document.getElementById('register');
    if (registrationSection) {
        registrationSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        trackEvent('cta_click', { location: 'hero_button' });
    }
}

// Performance monitoring
function monitorPerformance() {
    // Track page load time
    window.addEventListener('load', function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        trackEvent('page_load_time', { milliseconds: loadTime });
    });

    // Track Core Web Vitals
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'LCP') {
                    trackEvent('lcp', { value: entry.startTime });
                }
                if (entry.name === 'FID') {
                    trackEvent('fid', { value: entry.processingStart - entry.startTime });
                }
                if (entry.name === 'CLS') {
                    trackEvent('cls', { value: entry.value });
                }
            }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    }
}

// Initialize performance monitoring
monitorPerformance();

// Export functions for global access
window.shareOnSocial = shareOnSocial;
window.openRegistration = openRegistration;
window.toggleMobileMenu = toggleMobileMenu;

// Submit lead data to ActiveCampaign
async function submitToActiveCampaign(leadData) {
    const acData = {
        contact: {
            email: leadData.email,
            firstName: leadData.firstName,
            lastName: leadData.lastName,
            phone: leadData.phone || '',
            customField: {
                affiliate_id: leadData.affiliateId,
                utm_source: leadData.utmSource,
                utm_medium: leadData.utmMedium,
                utm_campaign: leadData.utmCampaign,
                timezone: leadData.timezone,
                registration_date: leadData.timestamp
            }
        }
    };

    try {
        const response = await fetch(`${CAMPAIGN_CONFIG.activeCampaignUrl}/api/3/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-Token': CAMPAIGN_CONFIG.activeCampaignApiKey
            },
            body: JSON.stringify(acData)
        });

        if (!response.ok) {
            throw new Error(`ActiveCampaign error: ${response.status}`);
        }

        // Add to masterclass sequence
        const contact = await response.json();
        await addToSequence(contact.contact.id, 'masterclass_registration');
        
        return true;
    } catch (error) {
        console.error('ActiveCampaign submission failed:', error);
        // Continue anyway - don't block user experience
        return false;
    }
}

// Add contact to email sequence
async function addToSequence(contactId, sequenceName) {
    try {
        const response = await fetch(`${CAMPAIGN_CONFIG.activeCampaignUrl}/api/3/contactAutomations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-Token': CAMPAIGN_CONFIG.activeCampaignApiKey
            },
            body: JSON.stringify({
                contactAutomation: {
                    contact: contactId,
                    automation: sequenceName // You'll need to create this automation in AC
                }
            })
        });
    } catch (error) {
        console.error('Failed to add to sequence:', error);
    }
}

// Redirect to ThriveCart with affiliate tracking
function redirectToThriveCart(leadData) {
    // Build ThriveCart URL with affiliate parameters
    const thrivecartUrl = new URL(CAMPAIGN_CONFIG.thrivecartUrl);
    
    // Add affiliate tracking parameters
    thrivecartUrl.searchParams.set('aff', leadData.affiliateId);
    thrivecartUrl.searchParams.set('utm_source', leadData.utmSource);
    thrivecartUrl.searchParams.set('utm_medium', leadData.utmMedium);
    thrivecartUrl.searchParams.set('utm_campaign', leadData.utmCampaign);
    
    // Add lead data for pre-filling
    thrivecartUrl.searchParams.set('first_name', leadData.firstName);
    thrivecartUrl.searchParams.set('last_name', leadData.lastName);
    thrivecartUrl.searchParams.set('email', leadData.email);
    
    // Redirect to ThriveCart
    window.location.href = thrivecartUrl.toString();
}

// Show error message
function showErrorMessage(message) {
    const form = document.getElementById('masterclassForm');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div style="text-align: center; padding: 1rem; background: #ffebee; border-radius: 10px; margin-top: 1rem; color: #c62828;">
            <p>⚠️ ${message}</p>
        </div>
    `;
    
    // Remove any existing error messages
    const existingError = form.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    form.appendChild(errorDiv);
}

