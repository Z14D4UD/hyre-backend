// server/utils/mailer.js
const nodemailer = require('nodemailer');

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM
} = process.env;

// Warn if any required env var is missing
if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM) {
  console.warn(
    'Mailer warning: missing one or more of EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM'
  );
}

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT),
  secure: Number(EMAIL_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

transporter.verify()
  .then(() => console.log('Mailer is configured and ready to send messages'))
  .catch(err => console.error('Error configuring mailer:', err));

async function sendMail({ to, subject, text, html }) {
  const msg = {
    from: EMAIL_FROM,
    to,
    subject,
    text,
    html
  };
  return transporter.sendMail(msg);
}

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
