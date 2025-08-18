// Affiliate Application Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('affiliateForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const loadingState = document.getElementById('loadingState');

    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }

    // Handle form submission
    async function handleFormSubmission(e) {
        e.preventDefault();
        
        // Show loading state
        showLoadingState();
        
        try {
            // Collect form data
            const formData = collectFormData();
            
            // Submit to LeadDyno API
            const leadDynoResponse = await submitToLeadDyno(formData);
            
            // Submit to Google Sheets (for manual approval workflow)
            const sheetsResponse = await submitToGoogleSheets(formData);
            
            // Show success message
            showSuccessMessage();
            
            // Track conversion in Google Analytics
            trackConversion(formData);
            
        } catch (error) {
            console.error('Form submission error:', error);
            showErrorMessage(error.message);
        }
    }

    // Collect form data
    function collectFormData() {
        const formData = new FormData(form);
        const data = {};
        
        // Basic fields
        data.firstName = formData.get('firstName');
        data.lastName = formData.get('lastName');
        data.email = formData.get('email');
        data.phone = formData.get('phone');
        
        // Platform information
        data.primaryPlatform = formData.get('primaryPlatform');
        data.platformHandle = formData.get('platformHandle');
        data.followerCount = formData.get('followerCount');
        
        // Audience information
        data.audienceType = formData.get('audienceType');
        data.engagementRate = formData.get('engagementRate');
        data.audienceDescription = formData.get('audienceDescription');
        
        // Experience & motivation
        data.affiliateExperience = formData.get('affiliateExperience');
        data.motivation = formData.get('motivation');
        data.promotionPlan = formData.get('promotionPlan');
        
        // Additional metadata
        data.timestamp = new Date().toISOString();
        data.source = 'affiliate-application-form';
        data.status = 'pending';
        data.applicationId = generateApplicationId();
        
        // Collect selected platforms
        const selectedPlatforms = [];
        formData.getAll('platforms').forEach(platform => {
            if (platform) selectedPlatforms.push(platform);
        });
        data.additionalPlatforms = selectedPlatforms;
        
        return data;
    }

    // Submit to LeadDyno API
    async function submitToLeadDyno(data) {
        const leadDynoData = {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            customFields: {
                platform: data.primaryPlatform,
                platformHandle: data.platformHandle,
                followerCount: data.followerCount,
                audienceType: data.audienceType,
                engagementRate: data.engagementRate,
                affiliateExperience: data.affiliateExperience,
                applicationId: data.applicationId,
                status: 'pending_approval'
            },
            tags: ['affiliate-application', 'pending-approval'],
            source: 'affiliate-application-form'
        };

        try {
            const response = await fetch('/api/leaddyno/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leadDynoData)
            });

            if (!response.ok) {
                throw new Error('Failed to submit to LeadDyno');
            }

            return await response.json();
        } catch (error) {
            console.error('LeadDyno submission error:', error);
            // Don't fail the entire submission if LeadDyno fails
            return { success: false, error: error.message };
        }
    }

    // Submit to Google Sheets (for manual approval workflow)
    async function submitToGoogleSheets(data) {
        const sheetsData = {
            timestamp: data.timestamp,
            applicationId: data.applicationId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || '',
            primaryPlatform: data.primaryPlatform,
            platformHandle: data.platformHandle || '',
            followerCount: data.followerCount || '',
            audienceType: data.audienceType,
            engagementRate: data.engagementRate,
            affiliateExperience: data.affiliateExperience,
            status: 'pending',
            affiliateId: '', // Will be filled in manually during approval
            approvalDate: '',
            notes: ''
        };

        try {
            const response = await fetch('/api/sheets/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sheetsData)
            });

            if (!response.ok) {
                throw new Error('Failed to submit to Google Sheets');
            }

            return await response.json();
        } catch (error) {
            console.error('Google Sheets submission error:', error);
            // Don't fail the entire submission if Sheets fails
            return { success: false, error: error.message };
        }
    }

    // Generate unique application ID
    function generateApplicationId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `APP-${timestamp}-${random}`.toUpperCase();
    }

    // Show loading state
    function showLoadingState() {
        form.style.display = 'none';
        loadingState.style.display = 'block';
        submitBtn.disabled = true;
    }

    // Show success message
    function showSuccessMessage() {
        loadingState.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Reset form
        form.reset();
    }

    // Show error message
    function showErrorMessage(message) {
        loadingState.style.display = 'none';
        form.style.display = 'block';
        submitBtn.disabled = false;
        
        // Show error alert
        alert(`Error: ${message}. Please try again or contact support.`);
    }

    // Track conversion in Google Analytics
    function trackConversion(data) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'affiliate_application_submitted', {
                'event_category': 'affiliate',
                'event_label': data.primaryPlatform,
                'value': 1
            });
        }
    }
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const siteNav = document.getElementById('siteNav');

    if (menuToggle && siteNav) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            siteNav.classList.toggle('nav-open');
        });
    }
});

