const nodemailer = require('nodemailer');
require('dotenv').config();

// Standardize email credentials (remove < > if present in env)
const emailUser = (process.env.EMAIL_USER || '').replace(/[<>]/g, '').trim();
const emailPass = (process.env.EMAIL_PASS || '').replace(/[<>]/g, '').trim();

if (!emailUser || !emailPass) {
  console.warn('⚠ EMAIL_USER or EMAIL_PASS not set in environment. Email notifications will be disabled.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

/**
 * Verify SMTP connection on startup
 * Called once when the server starts
 */
const verifyEmailConnection = async () => {
  if (!emailUser || !emailPass) {
    console.warn('⚠ Email service skipped: credentials not configured.');
    return false;
  }
  try {
    await transporter.verify();
    console.log(`✔ SMTP email service verified. Ready to send as: ${emailUser}`);
    return true;
  } catch (error) {
    console.error('✖ SMTP verification failed. Email notifications will not work.');
    console.error('  Reason:', error.message);
    console.error('  Fix: Ensure EMAIL_USER and EMAIL_PASS are correct in your .env file.');
    console.error('  Gmail: Generate a fresh App Password at https://myaccount.google.com/apppasswords');
    return false;
  }
};

/**
 * Send booking notification email
 * @param {string} toEmail - Recipient email
 * @param {string} userName - Name of the user
 * @param {object} bookingDetails - booking details
 * @param {string} status - 'Pending' | 'Approved' | 'Rejected'
 */
const sendBookingEmail = async (toEmail, userName, bookingDetails, status) => {
  if (!emailUser || !emailPass) {
    console.warn('⚠ Email skipped: credentials not configured.');
    return null;
  }

  let subject = '';
  let statusColor = '';
  let statusText = '';
  let extraContent = '';

  if (status === 'Pending') {
    subject = 'Booking Request Received';
    statusColor = '#d97706';
    statusText = 'Pending Approval';
    extraContent = '<p style="color: #4b5563;">Your booking request has been submitted successfully. Our administrator will review it shortly.</p>';
  } else if (status === 'Approved') {
    subject = 'Booking Approved ✔';
    statusColor = '#16a34a';
    statusText = 'Approved';
    extraContent = '<p style="color: #4b5563; font-weight: bold;">Congratulations! Your booking request has been approved. You are ready to use the resource.</p>';
  } else if (status === 'Rejected') {
    subject = 'Booking Rejected';
    statusColor = '#dc2626';
    statusText = 'Rejected';
    extraContent = `
      <p style="color: #4b5563; font-weight: bold;">We regret to inform you that your booking request has been rejected.</p>
      ${bookingDetails.remarks ? `<div style="background-color:#fef2f2;border-left:4px solid #dc2626;padding:12px;margin-top:15px;border-radius:4px;">
        <strong style="color:#991b1b;display:block;margin-bottom:4px;">Reason / Remarks:</strong>
        <span style="color:#7f1d1d;">${bookingDetails.remarks}</span>
      </div>` : ''}
    `;
  }

  const amountRow = bookingDetails.bookingAmount && parseFloat(bookingDetails.bookingAmount) > 0
    ? `<tr>
        <td style="padding:8px 0;color:#6b7280;font-size:14px;width:35%;">Booking Amount:</td>
        <td style="padding:8px 0;color:#16a34a;font-size:16px;font-weight:700;">₹${parseFloat(bookingDetails.bookingAmount).toLocaleString('en-IN')}</td>
       </tr>`
    : '';

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f3f4f6;margin:0;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);border:1px solid #e5e7eb;">
        <!-- Header -->
        <div style="background-color:#0f2942;padding:24px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:600;letter-spacing:0.5px;">Resource Booking Management System</h1>
        </div>

        <!-- Content -->
        <div style="padding:32px 24px;">
          <h2 style="color:#1f2937;margin-top:0;font-size:20px;font-weight:600;">Hello ${userName},</h2>
          ${extraContent}
          <h3 style="color:#374151;font-size:16px;margin-top:24px;border-bottom:2px solid #f3f4f6;padding-bottom:8px;">Booking Details</h3>

          <table style="width:100%;border-collapse:collapse;margin-top:12px;">
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;width:35%;">Resource:</td>
              <td style="padding:8px 0;color:#1f2937;font-size:14px;font-weight:500;">${bookingDetails.resourceName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Date:</td>
              <td style="padding:8px 0;color:#1f2937;font-size:14px;font-weight:500;">${bookingDetails.date}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Time Slot:</td>
              <td style="padding:8px 0;color:#1f2937;font-size:14px;font-weight:500;">${bookingDetails.startTime} – ${bookingDetails.endTime}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Purpose:</td>
              <td style="padding:8px 0;color:#1f2937;font-size:14px;font-weight:500;">${bookingDetails.purpose || 'N/A'}</td>
            </tr>
            ${amountRow}
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px;">Status:</td>
              <td style="padding:8px 0;font-size:14px;font-weight:600;color:${statusColor};">
                <span style="display:inline-block;padding:2px 8px;background-color:${statusColor}20;border-radius:4px;">${statusText}</span>
              </td>
            </tr>
          </table>

          <div style="margin-top:32px;padding-top:24px;border-top:1px solid #f3f4f6;text-align:center;">
            <a href="http://localhost:3000" style="display:inline-block;background-color:#0f2942;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:500;font-size:14px;">
              View Dashboard
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color:#f9fafb;padding:16px;text-align:center;border-top:1px solid #f3f4f6;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">This is an automated system notification. Please do not reply directly to this email.</p>
          <p style="color:#9ca3af;font-size:12px;margin:4px 0 0 0;">&copy; 2026 Resource Booking Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"RBMS Notifications" <${emailUser}>`,
    to: toEmail,
    subject: `RBMS: ${subject} — ${bookingDetails.resourceName}`,
    html: htmlTemplate
  };

  try {
    console.log(`📧 Sending ${status} email to: ${toEmail} for resource: ${bookingDetails.resourceName}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✔ Email sent successfully! Message ID: ${info.messageId} → ${toEmail}`);
    return info;
  } catch (error) {
    console.error(`✖ Failed to send ${status} email to ${toEmail}.`);
    console.error('  Nodemailer error:', error.message);
    return null;
  }
};

module.exports = {
  sendBookingEmail,
  verifyEmailConnection
};
