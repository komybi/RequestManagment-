import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailParams) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    
    console.log(`Email sent successfully to ${to}`);
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
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
