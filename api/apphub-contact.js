import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory rate limit store
const rateLimit = new Map();

// Optional manual IP blacklist
const blacklistedIPs = new Set([
  // "1.2.3.4"
]);

export default async function handler(req, res) {

  // CORS (lets the App Hub page submit while testing locally; harmless in production)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {

    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      'unknown';

    // 1. Block blacklisted IPs
    if (blacklistedIPs.has(ip)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 2. Rate limit (1 submission per minute per IP)
    const now = Date.now();
    if (rateLimit.has(ip)) {
      const last = rateLimit.get(ip);
      if (now - last < 60000) {
        return res.status(429).json({ error: 'Too many requests' });
      }
    }
    rateLimit.set(ip, now);

    const {
      name,
      organisation,
      email,
      location,
      message,
      website,           // honeypot
      recaptchaToken     // recaptcha
    } = req.body;

    // 3. Honeypot check
    if (website) {
      return res.status(400).json({ error: 'Bot detected' });
    }

    // 4. Basic validation
    if (!/^[a-zA-Z\s]{2,40}$/.test(name)) {
      return res.status(400).json({ error: 'Invalid name' });
    }

    if (!/^[a-zA-Z0-9\s\.\-&]{2,60}$/.test(organisation)) {
      return res.status(400).json({ error: 'Invalid organisation format' });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    if (!/^[a-zA-Z\s,\.\-]{2,80}$/.test(location)) {
      return res.status(400).json({ error: 'Invalid location' });
    }

    if (typeof message !== 'string' || message.trim().length < 5 || message.length > 2000) {
      return res.status(400).json({ error: 'Invalid message' });
    }

    // 5. reCAPTCHA verification
    if (!recaptchaToken) {
      return res.status(400).json({ error: 'Captcha missing' });
    }

    const captchaRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
      }
    );

    const captchaData = await captchaRes.json();

    if (!captchaData.success || captchaData.score < 0.7) {
      return res.status(400).json({ error: 'Captcha failed' });
    }

    const userAgent = req.headers['user-agent'] || '';

    if (!userAgent || userAgent.length < 20) {
      return res.status(400).json({ error: 'Suspicious client' });
    }

    // Escape message for safe HTML embedding
    const safeMessage = String(message)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    /* ===========================
       1. EMAIL TO YOU
    ============================ */

    await resend.emails.send({
      from: 'Crennect Website <noreply@crennect.com>',
      to: 'reach@crennect.com',
      subject: 'New Enterprise Enquiry (App Hub)',
      html: `
        <h2>New App Hub Enterprise Enquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Organisation:</strong> ${organisation}</p>
        <p><strong>Organisation Email:</strong> ${email}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Message:</strong><br>${safeMessage}</p>
        <p><strong>IP:</strong> ${ip}</p>
      `
    });

    /* ===========================
       2. AUTO-REPLY TO USER
    ============================ */

    await resend.emails.send({
      from: 'Crennect <noreply@crennect.com>',
      to: email,
      subject: 'Thank you for reaching out to Crennect',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Hi ${name},</h2>
          <p>Thank you for your interest in Crennect's intelligence tools.</p>
          <p>We have received your enquiry and our team is reviewing it carefully.</p>
          <p>You can expect to hear from us shortly.</p>
          <br>
          <p>Best regards,</p>
          <p><strong>Team Crennect</strong></p>
          <p>www.crennect.com</p>
        </div>
      `
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("EMAIL ERROR:", error);
    return res.status(500).json({ error: 'Email failed' });
  }
}
