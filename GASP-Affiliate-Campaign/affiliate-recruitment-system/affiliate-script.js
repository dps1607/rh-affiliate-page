document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('affiliateForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const loadingState = document.getElementById('loadingState');

    if (!form) {
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        setLoadingState(true);

        try {
            const payload = buildPayload();
            const response = await fetch('/api/submit-affiliate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Submission failed');
            }

            showSuccessMessage();
        } catch (error) {
            console.error('Submission error:', error);
            setLoadingState(false);
            alert('There was an error submitting your application. Please try again or contact us at partners@startreimagined.com.');
        }
    });

    function buildPayload() {
        const formData = new FormData(form);
        const additionalPlatforms = [
            ...formData.getAll('platforms'),
            ...formData.getAll('additionalPlatforms')
        ].filter(Boolean);
        const leadOrConversion = formData.get('leadOrConversion') || formData.get('trackingType') || '';
        const affiliateExperience = formData.get('affiliateExperience') || formData.get('experience') || '';
        const platformHandle = formData.get('platformHandle') || formData.get('handle') || '';
        const followerCount = formData.get('followerCount') || formData.get('followers') || '';
        const promotionPlan = formData.get('promotionPlan') || formData.get('promotionStrategy') || '';

        return {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            company: formData.get('company') || '',
            phone: formData.get('phone') || '',
            primaryPlatform: formData.get('primaryPlatform'),
            platformHandle,
            followerCount,
            audienceType: formData.get('audienceType'),
            engagementRate: formData.get('engagementRate'),
            audienceDescription: formData.get('audienceDescription') || '',
            leadOrConversion,
            trackingPreference: leadOrConversion,
            affiliateExperience,
            experience: affiliateExperience,
            motivation: formData.get('motivation') || '',
            promotionPlan,
            promotionStrategy: promotionPlan,
            agreement: Boolean(formData.get('agreement') || formData.get('ethicalAgreement')),
            consent: Boolean(formData.get('consent') || formData.get('communicationAgreement')),
            additionalPlatforms
        };
    }

    function setLoadingState(isLoading) {
        if (loadingState) {
            loadingState.style.display = isLoading ? 'block' : 'none';
        }
        form.style.display = isLoading ? 'none' : 'block';
        if (submitBtn) {
            submitBtn.disabled = isLoading;
        }
    }

    function showSuccessMessage() {
        if (loadingState) {
            loadingState.style.display = 'none';
        }
        if (successMessage) {
            successMessage.style.display = 'block';
        }
        form.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

