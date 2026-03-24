import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // If SMTP is not configured, log to console instead (useful for development)
  if (!process.env.SMTP_HOST) {
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
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
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
  } catch (error) {
    console.error('--- 📧 EMAIL SENDING FAILED ---');
    console.error('Error:', error.message);
    console.error('This is likely due to invalid SMTP credentials in .env or network issues.');
    console.error('--------------------------------');
    // We intentionally don't throw the error here so that business logic 
    // like payment verification can still complete successfully despite email failures.
  }
};

export default sendEmail;
