import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user?.role !== 'registrar' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, message, requestId, messageType } = await request.json();

    if (!userId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Find the user to get their email
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create email content based on message type
    let subject = '';
    let htmlContent = '';

    if (messageType === 'id-delivered') {
      subject = 'ID Replacement - Delivery Notification';
      htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">ID Replacement Notification</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Dear ${user.name},</h2>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                We are pleased to inform you that your ID replacement request has been processed and your new ID card is ready for delivery.
              </p>
              <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px;">
                  <strong>Delivery Date:</strong> ${message.includes('on') ? message.split('on')[1] : 'Scheduled soon'}
                </p>
              </div>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Please ensure you are available to receive your new ID card on the scheduled delivery date. If you have any questions, please don't hesitate to contact us.
              </p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Track Your Request
                </a>
              </div>
            </div>
            <div style="background: #333; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 14px;">
                Best regards,<br>
                Student Services Department<br>
                University Management System
              </p>
            </div>
          </body>
        </html>
      `;
    } else if (messageType === 'under-review') {
      subject = 'Document Request - Under Review';
      htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Document Request Update</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Dear ${user.name},</h2>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Thank you for your document request. We wanted to let you know that your request is currently under review by our team.
              </p>
              <div style="background: white; padding: 20px; border-left: 4px solid #f093fb; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px;">
                  <strong>Status:</strong> Under Review<br>
                  <strong>Request ID:</strong> ${requestId}
                </p>
              </div>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Our team is carefully reviewing your request and will process it as soon as possible. You will receive another notification once a decision has been made.
              </p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="#" style="background: #f093fb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View Request Status
                </a>
              </div>
            </div>
            <div style="background: #333; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 14px;">
                Best regards,<br>
                Registrar Office<br>
                University Management System
              </p>
            </div>
          </body>
        </html>
      `;
    } else {
      // Default notification
      subject = 'Request Update';
      htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Request Update</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Dear ${user.name},</h2>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                ${message}
              </p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="#" style="background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View Your Account
                </a>
              </div>
            </div>
            <div style="background: #333; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 14px;">
                Best regards,<br>
                University Management System
              </p>
            </div>
          </body>
        </html>
      `;
    }

    // Send the actual email
    await sendEmail({
      to: user.email,
      subject,
      html: htmlContent
    });

    console.log('Email sent successfully:', {
      to: user.email,
      subject,
      messageType,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      recipient: user.email,
      subject
    });

  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
