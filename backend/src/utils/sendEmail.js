import nodemailer from 'nodemailer';

import fs from 'fs';

const sendEmail = async (options, throwError = false) => {
  fs.appendFileSync('email_log.txt', `[${new Date().toISOString()}] Attempting to send email to ${options.email}\n`);
  
  // If SMTP is not configured, log to console instead (useful for development)
  if (!process.env.SMTP_HOST) {
    fs.appendFileSync('email_log.txt', '-> SMTP_HOST missing, using development fallback.\n');
    console.log('--- 📧 DEVELOPMENT EMAIL FALLBACK ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    if (options.html) {
      console.log('--------------------------------------');
      console.log('HTML content detected. Links found:');
      const linkMatch = options.html.match(/href="([^"]*)"/);
      if (linkMatch) console.log(`🔗 Link: ${linkMatch[1]}`);
    }
    console.log('--------------------------------------');
    if (throwError && !process.env.SMTP_HOST) {
        throw new Error('SMTP credentials are not configured on the server.');
    }
    return;
  }

  // Redirect known placeholder/invalid addresses to the real testing email to avoid bounce-back while still receiving notifications
  if (options.email === 'manager@gmail.com' || options.email === 'admin@gmail.com') {
    console.log(`--- 📧 MOCK EMAIL REDIRECT: Redirecting ${options.email} to jamunaselvammsc98@gmail.com ---`);
    options.email = 'jamunaselvammsc98@gmail.com';
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Hotel Booking'} <${process.env.FROM_EMAIL || 'noreply@hotelbooking.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
    fs.appendFileSync('email_log.txt', `-> Success! Message sent: ${info.messageId}\n`);
  } catch (error) {
    fs.appendFileSync('email_log.txt', `-> FAILED: ${error.message}\n`);
    console.error('--- 📧 EMAIL SENDING FAILED ---');
    console.error('Error:', error.message);
    console.error('This is likely due to invalid SMTP credentials in .env or network issues.');
    console.error('--------------------------------');
    // We intentionally don't throw the error here so that business logic 
    // like payment verification can still complete successfully despite email failures.
    if (throwError) {
        throw error;
    }
  }
};

export default sendEmail;
