/**
 * ============================================================
 * ENACTUS WITS SUPPORT SYSTEM — THIN BACKEND (RENDER SERVICE)
 * AltruTech | Iteration 2
 * Aligned 100% to Group11 ERD Supabase Schema
 * ============================================================
 * Handles webhook events from Supabase to dispatch emails via Resend.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'Enactus Wits <notifications@enactuswits.org>';

// Initialize Supabase Admin Client (Service Role for backend operations)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'enactus-wits-backend',
    timestamp: new Date().toISOString(),
    resendConfigured: !!resendApiKey,
    supabaseConfigured: !!supabase,
  });
});

/**
 * Helper to wrap content in Enactus Wits HTML email template
 */
function buildEmailHtml(title, preheader, contentHtml) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #0a2342 0%, #1a4a7a 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0 0; font-size: 13px; color: #93c5fd; }
          .body { padding: 32px 24px; font-size: 15px; line-height: 1.6; }
          .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .footer { background-color: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .badge { display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Enactus Wits Support System</h1>
            <p>Empowering student entrepreneurs through innovation & action</p>
          </div>
          <div class="body">
            <span class="badge">${preheader}</span>
            <h2 style="margin-top: 0; color: #0a2342; font-size: 20px;">${title}</h2>
            ${contentHtml}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Enactus University of the Witwatersrand. All rights reserved.</p>
            <p>University of the Witwatersrand, 1 Jan Smuts Avenue, Braamfontein, Johannesburg</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * 1. Webhook: New Announcement Created
 * Triggered automatically by Supabase Database Webhook on public.announcement INSERT
 */
app.post('/api/webhooks/announcement', async (req, res) => {
  try {
    const payload = req.body;
    console.log('[Webhook: Announcement] Received payload:', JSON.stringify(payload));

    const record = payload.record || payload;
    if (!record || !record.title || !record.body) {
      return res.status(400).json({ error: 'Invalid payload: missing announcement record.' });
    }

    if (!supabase) {
      console.warn('[Webhook: Announcement] Supabase admin client not configured. Skipping recipient lookup.');
      return res.status(200).json({ message: 'Webhook received but Supabase not configured.' });
    }

    let recipientEmails = [];

    if (record.audience_type === 'AllMembers') {
      // Broadcast to all active members in app_user
      const { data: members, error: memErr } = await supabase
        .from('app_user')
        .select('wits_email')
        .eq('account_status', 'Active');

      if (memErr) throw memErr;
      recipientEmails = (members || []).map(m => m.wits_email).filter(Boolean);
    } else {
      // Query audience_map for stage/audience-targeted users
      const { data: mappings, error: mapErr } = await supabase
        .from('audience_map')
        .select('user_id, app_user ( wits_email, account_status )')
        .eq('announcement_id', record.announcement_id);

      if (mapErr) throw mapErr;

      recipientEmails = (mappings || [])
        .map(m => m.app_user?.wits_email)
        .filter(Boolean);
    }

    if (recipientEmails.length === 0) {
      console.log('[Webhook: Announcement] No recipients matched audience filter.');
      return res.status(200).json({ message: 'No recipients matched.' });
    }

    console.log(`[Webhook: Announcement] Sending email to ${recipientEmails.length} recipients.`);

    if (!resend) {
      console.warn('[Webhook: Announcement] Resend API key missing. Email simulated.');
      return res.status(200).json({ message: 'Simulated email delivery (Resend API key missing)', recipientCount: recipientEmails.length });
    }

    const html = buildEmailHtml(
      record.title,
      record.audience_type === 'AllMembers' ? 'Broadcast Announcement' : `Targeted: ${record.audience_type}`,
      `<div class="card"><p style="margin: 0; white-space: pre-line;">${record.body}</p></div>`
    );

    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to: recipientEmails,
      subject: `[Enactus Wits] ${record.title}`,
      html,
    });

    // Mark delivery in audience_map
    if (record.audience_type !== 'AllMembers') {
      await supabase
        .from('audience_map')
        .update({ email_delivered: true, delivered_at: new Date().toISOString() })
        .eq('announcement_id', record.announcement_id);
    }

    return res.status(200).json({ success: true, result, recipientCount: recipientEmails.length });
  } catch (err) {
    console.error('[Webhook: Announcement] Error processing webhook:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 2. Webhook: New Event Created
 * Triggered by Supabase Database Webhook on public.event INSERT
 */
app.post('/api/webhooks/event', async (req, res) => {
  try {
    const payload = req.body;
    console.log('[Webhook: Event] Received payload:', JSON.stringify(payload));

    const record = payload.record || payload;
    if (!record || !record.title) {
      return res.status(400).json({ error: 'Invalid payload: missing event record.' });
    }

    if (!supabase) {
      return res.status(200).json({ message: 'Webhook received but Supabase not configured.' });
    }

    const { data: members, error: memErr } = await supabase
      .from('app_user')
      .select('wits_email')
      .eq('account_status', 'Active');

    if (memErr) throw memErr;
    const recipientEmails = (members || []).map(m => m.wits_email).filter(Boolean);

    if (recipientEmails.length === 0) {
      return res.status(200).json({ message: 'No recipients found.' });
    }

    const eventDateFormatted = new Date(record.event_date).toLocaleString('en-ZA', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const contentHtml = `
      <div class="card">
        <p><strong>📅 Date & Time:</strong> ${eventDateFormatted}</p>
        <p><strong>🏷️ Category:</strong> ${record.category || 'Workshop'}</p>
        <p><strong>🔒 Visibility:</strong> ${record.visibility}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="margin: 0; white-space: pre-line;">${record.description || ''}</p>
      </div>
      <p>Log in to the Enactus Wits portal to reserve your spot!</p>
    `;

    const html = buildEmailHtml(record.title, 'New Event Invitation', contentHtml);

    if (!resend) {
      return res.status(200).json({ message: 'Simulated email delivery', recipientCount: recipientEmails.length });
    }

    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to: recipientEmails,
      subject: `[Enactus Wits Event] ${record.title}`,
      html,
    });

    return res.status(200).json({ success: true, result, recipientCount: recipientEmails.length });
  } catch (err) {
    console.error('[Webhook: Event] Error processing webhook:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 3. Direct Email Send Endpoint
 */
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    if (!to || !subject) {
      return res.status(400).json({ error: 'Missing required fields: to and subject.' });
    }

    if (!resend) {
      console.log(`[Direct Email] Simulated sending to ${to}: ${subject}`);
      return res.status(200).json({ success: true, simulated: true });
    }

    const response = await resend.emails.send({
      from: SENDER_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || `<p>${text || ''}</p>`,
    });

    return res.status(200).json({ success: true, response });
  } catch (err) {
    console.error('[Direct Email] Error sending email:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Enactus Wits Backend] Server listening on port ${PORT}`);
});
