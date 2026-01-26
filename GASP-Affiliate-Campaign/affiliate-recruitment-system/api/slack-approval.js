const LEADDYNO_API_KEY = process.env.LEADDYNO_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

async function createLeadDynoAffiliate(formData) {
      if (!LEADDYNO_API_KEY) {
                return { skipped: true };
      }

    const response = await fetch("https://api.leaddyno.com/v1/affiliates", {
              method: "POST",
              headers: {
                            "Content-Type": "application/json"
              },
              body: JSON.stringify({
                            key: LEADDYNO_API_KEY,
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
      const affiliate = (data && data.affiliate) ? data.affiliate : data;
      return { affiliate: affiliate || null };
}

async function sendWelcomeEmail(formData) {
      if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
                return { skipped: true };
      }

    const body = [
              `Hi ${formData.firstName},`,
              "",
              "🎉 Congratulations! Your affiliate application has been approved!",
              "",
              "Welcome to our affiliate program. You'll receive your affiliate dashboard login details shortly.",
              "",
              "If you have any questions, feel free to reach out.",
              "",
              "Best regards,",
              "The Team"
          ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                            Authorization: `Bearer ${RESEND_API_KEY}`,
                            "Content-Type": "application/json"
              },
              body: JSON.stringify({
                            from: RESEND_FROM_EMAIL,
                            to: [formData.email],
                            subject: "✅ Your Affiliate Application Has Been Approved!",
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

async function sendRejectionEmail(formData) {
      if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
                return { skipped: true };
      }

    const body = [
              `Hi ${formData.firstName},`,
              "",
              "Thank you for your interest in our affiliate program.",
              "",
              "After reviewing your application, we've decided not to move forward at this time.",
              "",
              "We appreciate your interest and wish you the best.",
              "",
              "Best regards,",
              "The Team"
          ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                            Authorization: `Bearer ${RESEND_API_KEY}`,
                            "Content-Type": "application/json"
              },
              body: JSON.stringify({
                            from: RESEND_FROM_EMAIL,
                            to: [formData.email],
                            subject: "Regarding Your Affiliate Application",
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

module.exports = async (req, res) => {
      if (req.method === "OPTIONS") {
                res.status(204).end();
                return;
      }

      if (req.method !== "POST") {
                res.status(405).json({ success: false, error: "Method not allowed" });
                return;
      }

      let payload;
      try {
                payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      } catch (error) {
                res.status(400).json({ success: false, error: "Invalid JSON" });
                return;
      }

      // Slack sends interactive payload with specific structure
      if (!payload || !payload.actions || !payload.actions[0]) {
                res.status(400).json({ success: false, error: "Invalid Slack payload" });
                return;
      }

      const action = payload.actions[0];
      const actionId = action.action_id;
      const encodedData = action.value;

      // Decode the form data
      let formData;
      try {
                const decodedData = Buffer.from(encodedData, 'base64').toString('utf-8');
                formData = JSON.parse(decodedData);
      } catch (error) {
                res.status(400).json({ success: false, error: "Failed to decode application data" });
                return;
      }

      try {
                if (actionId === "approve_affiliate") {
                              // Create affiliate in LeadDyno
                    const leadDynoResult = await createLeadDynoAffiliate(formData);

                    // Send welcome email
                    const emailResult = await sendWelcomeEmail(formData);

                    // Respond to Slack with updated message
                    res.status(200).json({
                                      replace_original: true,
                                      text: `✅ *APPROVED* by <@${payload.user.id}>\n\nAffiliate: ${formData.firstName} ${formData.lastName} (${formData.email})\nLeadDyno: ${leadDynoResult.affiliate ? 'Created' : 'Already exists'}\nWelcome Email: ${emailResult.skipped ? 'Skipped' : 'Sent'}`
                    });

                } else if (actionId === "reject_affiliate") {
                              // Send rejection email
                    const emailResult = await sendRejectionEmail(formData);

                    // Respond to Slack with updated message
                    res.status(200).json({
                                      replace_original: true,
                                      text: `❌ *REJECTED* by <@${payload.user.id}>\n\nAffiliate: ${formData.firstName} ${formData.lastName} (${formData.email})\nRejection Email: ${emailResult.skipped ? 'Skipped' : 'Sent'}`
                    });

                } else {
                              res.status(400).json({ success: false, error: "Unknown action" });
                }
      } catch (error) {
                console.error("Approval handler error:", error);
                res.status(500).json({
                              success: false,
                              error: error.message || "Internal server error"
                });
      }
};
