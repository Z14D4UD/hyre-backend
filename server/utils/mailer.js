// server/utils/mailer.js

const nodemailer = require('nodemailer');

// ADDITION: create reusable transporter using SMTP details from .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ADDITION: verify transporter at startup
transporter.verify()
  .then(() => console.log('Mailer is configured and ready to send messages'))
  .catch(err => console.error('Error configuring mailer:', err));

/**
 * ADDITION: Generic sendMail helper
 * @param {{ to: string, subject: string, text?: string, html?: string }} opts
 */
async function sendMail({ to, subject, text, html }) {
  const msg = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html
  };
  return transporter.sendMail(msg);
}

/**
 * ADDITION: Send booking approval email to customer
 * @param {{ bookingId: string, customerName: string, customerEmail: string, startDate: Date, endDate: Date }} data
 */
async function sendBookingApprovalEmail({ bookingId, customerName, customerEmail, startDate, endDate }) {
  const subject = `Your booking ${bookingId} has been approved`;
  const formattedStart = new Date(startDate).toLocaleDateString();
  const formattedEnd   = new Date(endDate).toLocaleDateString();
  const html = `
    <p>Hi ${customerName},</p>
    <p>Your booking <strong>${bookingId}</strong> from ${formattedStart} to ${formattedEnd} has been <strong>approved</strong>! 🎉</p>
    <p>You can view the details and next steps in your account dashboard.</p>
    <p>Thanks for choosing us,<br/>The Hyre Team</p>
  `;
  const text = `Hi ${customerName}, your booking ${bookingId} from ${formattedStart} to ${formattedEnd} has been approved! Visit your dashboard for details.`;
  return sendMail({ to: customerEmail, subject, text, html });
}

/**
 * ADDITION: Send booking rejection email to customer
 * @param {{ bookingId: string, customerName: string, customerEmail: string, reason?: string }} data
 */
async function sendBookingRejectionEmail({ bookingId, customerName, customerEmail, reason }) {
  const subject = `Your booking ${bookingId} has been rejected`;
  const html = `
    <p>Hi ${customerName},</p>
    <p>We’re sorry to inform you that your booking <strong>${bookingId}</strong> has been <strong>rejected</strong>.</p>
    ${reason ? `<p><em>Reason:</em> ${reason}</p>` : ''}
    <p>If you have any questions or need assistance, please reply to this email.</p>
    <p>Best regards,<br/>The Hyre Team</p>
  `;
  const text = `Hi ${customerName}, your booking ${bookingId} has been rejected.${reason ? ` Reason: ${reason}` : ''}`;
  return sendMail({ to: customerEmail, subject, text, html });
}

module.exports = {
  sendMail,
  sendBookingApprovalEmail,
  sendBookingRejectionEmail
};