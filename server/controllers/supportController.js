// server/controllers/supportController.js
const nodemailer = require('nodemailer');

exports.sendSupportEmail = async (req, res) => {
  try {
    const { name, email, company } = req.body;

    if (!name || !email) {
      return res.status(400).json({ msg: 'Name and email are required.' });
    }

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Hyre Support" <${process.env.GMAIL_USER}>`,
      to: 'support@hyre.com', // your real support inbox
      subject: `Contact Form Submission from ${name}`,
      text: `
A new contact form submission:

Name: ${name}
Email: ${email}
Company/Message: ${company || 'N/A'}

Please follow up with them soon!
`,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ msg: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending support email:', error);
    return res.status(500).json({ msg: 'Server error sending email.' });
  }
};
