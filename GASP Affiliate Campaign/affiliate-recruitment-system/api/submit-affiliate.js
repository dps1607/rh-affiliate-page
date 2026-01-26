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
    // LeadDyno: only requires API key for /api/v1/affiliates
    // (Do NOT require account name; do NOT use /accounts/ in the URL)
    if (!LEADDYNO_API_KEY) {
        return { skipped: true };
    }

    // Per LeadDyno REST API docs, the base URL is https://api.leaddyno.com/v1/
    // https://support.leaddyno.com/hc/en-us/articles/15151748798877-REST-API-Introduction
    const response = await fetch("https://api.leaddyno.com/v1/affiliates", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            // Per requirement: API key must be sent in POST body as "key"
            key: process.env.LEADDYNO_API_KEY,
            // Per requirement: send only these fields
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName
        })
    });

    if (response.status === 409) {
        return { existing: true };
    }

    if (!response.ok) {
        const message = await response.text();
        throw new Error(`LeadDyno error: ${response.status} ${message}`);
    }

    const data = await response.json();
    // LeadDyno returns the affiliate as the top-level object in many cases.
    // Some wrappers/docs show { affiliate: {...} } so handle both.
    const affiliate = (data && data.affiliate) ? data.affiliate : data;
    return { affiliate: affiliate || null };
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

    // Run each integration independently so one failure doesn't block the others.
    let leadDynoResult = null;
    let resendResult = null;
    let slackResult = null;

    let leadDynoError = null;
    let resendError = null;
    let slackError = null;

    try {
        leadDynoResult = await createLeadDynoAffiliate(formData);
    } catch (error) {
        leadDynoError = error?.message || String(error);
        console.error("LeadDyno submission failed:", error);
    }

    try {
        resendResult = await sendResendEmail(formData);
    } catch (error) {
        resendError = error?.message || String(error);
        console.error("Resend notification failed:", error);
    }

    try {
        slackResult = await sendSlackNotification(formData);
    } catch (error) {
        slackError = error?.message || String(error);
        console.error("Slack notification failed:", error);
    }

    // If both notification channels failed, return 500.
    // Otherwise, return success even if LeadDyno failed.
    const notificationsFailed =
        resendError && slackError &&
        !(resendResult && resendResult.skipped) &&
        !(slackResult && slackResult.skipped);

    if (notificationsFailed) {
        res.status(500).json({
            success: false,
            error: "Notification delivery failed",
            leadDyno: leadDynoResult,
            resend: resendResult,
            slack: slackResult,
            errors: {
                leadDyno: leadDynoError,
                resend: resendError,
                slack: slackError
            }
        });
        return;
    }

    res.status(200).json({
        success: true,
        leadDyno: leadDynoResult,
        resend: resendResult,
        slack: slackResult,
        errors: {
            leadDyno: leadDynoError,
            resend: resendError,
            slack: slackError
        }
    });
};
