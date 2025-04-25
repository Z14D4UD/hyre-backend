// server/utils/mailer.js

const nodemailer = require('nodemailer');

// ensure we have everything we need
const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM
} = process.env;

if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM) {
  console.error(
    '⚠️  Missing one or more mailer env vars. ' +
    'Please set EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_FROM'
  );
}

const secureFlag = 
  EMAIL_SECURE != null
    ? EMAIL_SECURE.toLowerCase() === 'true'
    : Number(EMAIL_PORT) === 465;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT),
  secure: secureFlag,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// verify at startup
transporter.verify()
  .then(() => console.log('✅  Mailer is configured and ready'))
  .catch(err => console.error('❌  Mailer configuration error:', err));

/**
 * Generic sendMail helper
 * @param {{ to: string, subject: string, text?: string, html?: string }} opts
 */
async function sendMail({ to, subject, text, html }) {
  return transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    text,
    html
  });
}

/**
 * Send booking approval email to customer
 */
async function sendBookingApprovalEmail({
  bookingId,
  customerName,
  customerEmail,
  startDate,
  endDate
}) {
  const subject = `Your booking ${bookingId} has been approved`;
  const start  = new Date(startDate).toLocaleDateString();
  const end    = new Date(endDate).toLocaleDateString();

  const html = `
    <p>Hi ${customerName},</p>
    <p>Your booking <strong>${bookingId}</strong> from <em>${start}</em> to <em>${end}</em> has been <strong>approved</strong>! 🎉</p>
    <p>Log in to your dashboard to view details.</p>
    <p>Thanks,<br/>The Hyre Team</p>
  `;

  const text = `Hi ${customerName}, your booking ${bookingId} (${start}–${end}) has been approved. Visit your dashboard for details.`;

  return sendMail({ to: customerEmail, subject, text, html });
}

/**
 * Send booking rejection email to customer
 */
async function sendBookingRejectionEmail({
  bookingId,
  customerName,
  customerEmail,
  reason
}) {
  const subject = `Your booking ${bookingId} has been rejected`;

  const html = `
    <p>Hi ${customerName},</p>
    <p>We’re sorry to inform you that your booking <strong>${bookingId}</strong> has been <strong>rejected</strong>.</p>
    ${reason ? `<p><em>Reason:</em> ${reason}</p>` : ''}
    <p>If you have questions, just reply to this email.</p>
    <p>Best,<br/>The Hyre Team</p>
  `;

  const text = `Hi ${customerName}, your booking ${bookingId} has been rejected.` +
               (reason ? ` Reason: ${reason}` : '');

  return sendMail({ to: customerEmail, subject, text, html });
}

module.exports = {
  sendMail,
  sendBookingApprovalEmail,
  sendBookingRejectionEmail
};
