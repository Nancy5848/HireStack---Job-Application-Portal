/**
 * Email-ready architecture.
 *
 * This service is intentionally provider-agnostic. To activate real email
 * sending, install nodemailer (`npm install nodemailer`), configure the
 * EMAIL_* variables in .env, and implement the transporter below.
 *
 * Every call site in the app (auth, notifications) already calls sendEmail()
 * so no other file needs to change when this is wired up.
 */

const sendEmail = async ({ to, subject, text, html }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('--- [Email Service - Dev Mode, No Email Sent] ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text || html}`);
    console.log('---------------------------------------------------');
    return { success: true, simulated: true };
  }

  // Example future implementation with nodemailer:
  //
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransport({
  //   host: process.env.EMAIL_HOST,
  //   port: process.env.EMAIL_PORT,
  //   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  // });
  // await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, text, html });

  return { success: true, simulated: true };
};

module.exports = { sendEmail };
