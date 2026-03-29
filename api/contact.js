import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory rate limit store
const rateLimit = new Map();

// Optional manual IP blacklist
const blacklistedIPs = new Set([
  // "1.2.3.4"
]);

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {

    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      'unknown';

    // 1️⃣ Block blacklisted IPs
    if (blacklistedIPs.has(ip)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 2️⃣ Rate limit (1 submission per minute per IP)
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
      company,
      email,
      phone,
      services,
      newsletter,
      website,           // honeypot
      recaptchaToken     // recaptcha
    } = req.body;

    // 3️⃣ Honeypot check
    if (website) {
      return res.status(400).json({ error: 'Bot detected' });
    }

    // 4️⃣ Basic validation

    if (!/^[a-zA-Z0-9\s\.\-&]{2,60}$/.test(company)) {
      return res.status(400).json({ error: 'Invalid company format' });
    }

    
    if (!/^[a-zA-Z\s]{2,40}$/.test(name)) {
      return res.status(400).json({ error: 'Invalid name' });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    if (!/^\d{7,15}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone' });
    }

    // 5️⃣ reCAPTCHA verification
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
  return res.status(400).json({ error: "Suspicious client" });
}


    /* ===========================
       1️⃣ EMAIL TO YOU
    ============================ */

    await resend.emails.send({
      from: 'Crennect Website <noreply@crennect.com>',
      to: 'reach@crennect.com',
      subject: 'New Website Enquiry',
      html: `
        <h2>New Contact Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Services Selected:</strong> ${services || 'None'}</p>
        <p><strong>Newsletter Opt-in:</strong> ${newsletter ? 'Yes' : 'No'}</p>
        <p><strong>IP:</strong> ${ip}</p>
      `
    });

    /* ===========================
       2️⃣ AUTO-REPLY TO USER
    ============================ */

    await resend.emails.send({
      from: 'Crennect <noreply@crennect.com>',
      to: email,
      subject: 'Thank you for reaching out to Crennect',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Hi ${name},</h2>
          <p>Thank you for reaching out to Crennect.</p>
          <p>We’ve received your enquiry and our team is reviewing it carefully.</p>
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
