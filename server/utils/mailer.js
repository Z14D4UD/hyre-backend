// server/utils/mailer.js
const nodemailer = require('nodemailer');

// -----------------------------------------------------------------------------
// Read env once — handle either GMAIL_* or EMAIL_* naming
// -----------------------------------------------------------------------------
const smtpUser = process.env.GMAIL_USER  || process.env.EMAIL_USER;
const smtpPass = process.env.GMAIL_PASS  || process.env.EMAIL_PASS;
const smtpHost = process.env.EMAIL_HOST  || 'smtp.gmail.com';
const smtpPort = process.env.EMAIL_PORT  ? Number(process.env.EMAIL_PORT) : 465;
const smtpSecure = (process.env.EMAIL_SECURE ?? 'true') !== 'false'; // default true

// If creds are missing, log a warning once at startup
if (!smtpUser || !smtpPass) {
  /* eslint-disable no-console */
  console.warn(
    '⚠️  Mail disabled: missing SMTP credentials. ' +
    'Set GMAIL_USER / GMAIL_PASS or EMAIL_USER / EMAIL_PASS.'
  );
}

/** -------------------------------------------------------------------------
 * createTransport – only if creds exist; otherwise a stub that resolves
 * ------------------------------------------------------------------------ */
function getTransport () {
  if (!smtpUser || !smtpPass) {
    return {
      sendMail: () => Promise.resolve('mail skipped – creds missing')
    };
  }
  return nodemailer.createTransport({
    host:   smtpHost,
    port:   smtpPort,
    secure: smtpSecure,
    auth:   { user: smtpUser, pass: smtpPass }
  });
}

const transporter = getTransport();

// -----------------------------------------------------------------------------
// Helper wrappers you already call elsewhere
// -----------------------------------------------------------------------------
exports.sendBookingApprovalEmail = async ({
  customerEmail,
  customerName,
  bookingId,
  startDate,
  endDate
}) => {
  const html = `
    <p>Hi ${customerName},</p>
    <p>Your booking <strong>${bookingId}</strong> has been <b>approved</b>.</p>
    <p>${new Date(startDate).toLocaleDateString()} – ${new Date(endDate).toLocaleDateString()}</p>
    <p>Thanks for using Hyre!</p>
  `;
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || `Hyre <${smtpUser}>`,
    to:   customerEmail,
    subject: 'Your booking is approved',
    html
  });
};

exports.sendBookingRejectionEmail = async ({
  customerEmail,
  customerName,
  bookingId
}) => {
  const html = `
    <p>Hi ${customerName},</p>
    <p>We’re sorry — your booking <strong>${bookingId}</strong> has been declined.</p>
    <p>Please contact support if you have questions.</p>
  `;
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || `Hyre <${smtpUser}>`,
    to:   customerEmail,
    subject: 'Your booking was declined',
    html
  });
};
