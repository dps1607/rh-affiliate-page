const LEADDYNO_ACCOUNT_NAME = process.env.LEADDYNO_ACCOUNT_NAME;
const LEADDYNO_API_KEY = process.env.LEADDYNO_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const RESEND_TO_EMAIL = process.env.RESEND_TO_EMAIL;
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

function parseBody(req) {
    if (!req.body) {
        return null;
    }
    if (typeof req.body === "string") {
        try {
            return JSON.parse(req.body);
        } catch (error) {
            return null;
        }
    }
    return req.body;
}

function formatValue(value) {
    if (value === undefined || value === null || value === "") {
        return "n/a";
    }
    return String(value);
}

async function createLeadDynoAffiliate(formData) {
    if (!LEADDYNO_ACCOUNT_NAME || !LEADDYNO_API_KEY) {
        return { skipped: true };
    }

    const response = await fetch(
        `https://app.leaddyno.com/api/v1/accounts/${LEADDYNO_ACCOUNT_NAME}/affiliates`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${LEADDYNO_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: formData.email,
                first_name: formData.firstName,
                last_name: formData.lastName,
                company: formData.company,
                phone: formData.phone,
                source: "affiliate_form",
                custom_fields: {
                    primary_platform: formData.primaryPlatform,
                    handle: formData.platformHandle,
                    follower_count: formData.followerCount,
                    audience_type: formData.audienceType,
                    tracking_preference: formData.trackingPreference,
                    engagement_rate: formData.engagementRate,
                    experience: formData.experience,
                    audience_description: formData.audienceDescription,
                    motivation: formData.motivation,
                    promotion_strategy: formData.promotionStrategy
                }
            })
        }
    );

    if (response.status === 409) {
        return { existing: true };
    }

    if (!response.ok) {
        const message = await response.text();
        throw new Error(`LeadDyno error: ${response.status} ${message}`);
    }

    const data = await response.json();
    return { affiliate: data.affiliate || null };
}

async function sendResendEmail(formData) {
    const recipientSource = RESEND_TO_EMAIL || NOTIFICATION_EMAIL || "";
    if (!RESEND_API_KEY || !RESEND_FROM_EMAIL || !recipientSource) {
        return { skipped: true };
    }

    const recipients = recipientSource.split(",").map((item) => item.trim()).filter(Boolean);
    if (recipients.length === 0) {
        return { skipped: true };
    }

    const body = [
        "New affiliate application received:",
        "",
        `Name: ${formatValue(formData.firstName)} ${formatValue(formData.lastName)}`,
        `Email: ${formatValue(formData.email)}`,
        `Company: ${formatValue(formData.company)}`,
        `Phone: ${formatValue(formData.phone)}`,
        `Primary platform: ${formatValue(formData.primaryPlatform)}`,
        `Handle/URL: ${formatValue(formData.platformHandle)}`,
        `Follower count: ${formatValue(formData.followerCount)}`,
        `Audience type: ${formatValue(formData.audienceType)}`,
        `Tracking preference: ${formatValue(formData.trackingPreference)}`,
        `Engagement rate: ${formatValue(formData.engagementRate)}`,
        `Experience: ${formatValue(formData.experience)}`,
        "",
        "Audience description:",
        formatValue(formData.audienceDescription),
        "",
        "Motivation:",
        formatValue(formData.motivation),
        "",
        "Promotion strategy:",
        formatValue(formData.promotionStrategy)
    ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: RESEND_FROM_EMAIL,
            to: recipients,
            subject: "New Affiliate Application",
            text: body
        })
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(`Resend error: ${response.status} ${message}`);
    }

    const data = await response.json();
    return { messageId: data.id || null };
}

async function sendSlackNotification(formData) {
    if (!SLACK_WEBHOOK_URL) {
        return { skipped: true };
    }

    const payload = {
        text: [
            "*New Affiliate Application*",
            `*Name:* ${formatValue(formData.firstName)} ${formatValue(formData.lastName)}`,
            `*Email:* ${formatValue(formData.email)}`,
            `*Primary platform:* ${formatValue(formData.primaryPlatform)}`,
            `*Handle:* ${formatValue(formData.platformHandle)}`,
            `*Follower count:* ${formatValue(formData.followerCount)}`,
            `*Tracking preference:* ${formatValue(formData.trackingPreference)}`,
            `*Engagement rate:* ${formatValue(formData.engagementRate)}`
        ].join("\n")
    };

    const response = await fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(`Slack error: ${response.status} ${message}`);
    }

    return { delivered: true };
}

module.exports = async (req, res) => {
    if (req.method === "OPTIONS") {
        res.status(204).end();
        return;
    }

    if (req.method !== "POST") {
        res.status(405).json({ success: false, error: "Method not allowed" });
        return;
    }

    const formData = parseBody(req);
    if (!formData || !formData.email) {
        res.status(400).json({ success: false, error: "Invalid payload" });
        return;
    }

    try {
        const leadDynoResult = await createLeadDynoAffiliate(formData);
        const resendResult = await sendResendEmail(formData);
        const slackResult = await sendSlackNotification(formData);

        res.status(200).json({
            success: true,
            leadDyno: leadDynoResult,
            resend: resendResult,
            slack: slackResult
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
