import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailParams) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email sending error:', error);
  }
}

export function getStatusEmailTemplate(
  studentName: string,
  documentType: string,
  status: string,
  trackingNumber: string,
  rejectionReason?: string
) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Document Request Update</h2>
        <p>Dear ${studentName},</p>
        <p>Your document request has been <strong>${status}</strong>.</p>
        <p>
          <strong>Document Type:</strong> ${documentType}<br/>
          <strong>Tracking Number:</strong> ${trackingNumber}<br/>
          <strong>Status:</strong> ${status}
        </p>
        ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
        <p>You can track your request status at any time by logging into your account.</p>
        <p>Best regards,<br/>Document Management System</p>
      </body>
    </html>
  `;
}
