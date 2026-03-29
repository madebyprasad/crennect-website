import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {

    const { email, recaptchaToken } = req.body;

    // Basic email validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    if (!recaptchaToken) {
      return res.status(400).json({ error: 'Captcha missing' });
    }

    // Verify reCAPTCHA
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

    /* ===========================
       1️⃣ EMAIL TO YOU
    ============================ */

    await resend.emails.send({
      from: 'Crennect Website <noreply@crennect.com>',
      to: 'reach@crennect.com',
      subject: 'New GenAI Waitlist Signup',
      html: `
        <h2>New Waitlist Signup</h2>
        <p><strong>Email:</strong> ${email}</p>
      `
    });

    /* ===========================
       2️⃣ AUTO-REPLY TO USER
    ============================ */

    await resend.emails.send({
      from: 'Crennect <noreply@crennect.com>',
      to: email,
      subject: 'You’re on the Crennect GenAI Waitlist 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>You're In 🚀</h2>
          <p>Thanks for joining the GenAI early access list.</p>
          <p>We’ll notify you as soon as private access opens.</p>
          <br>
          <p>— Team Crennect</p>
        </div>
      `
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("WAITLIST EMAIL ERROR:", error);
    return res.status(500).json({ error: 'Email failed' });
  }
}