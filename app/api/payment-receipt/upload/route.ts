import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user?.role !== 'student')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const requestId = formData.get('requestId') as string;
    const transactionId = formData.get('transactionId') as string;
    const receiptFile = formData.get('receipt') as File;
    const additionalInfo = formData.get('additionalInfo') as string;

    if (!requestId || !transactionId || !receiptFile) {
      return NextResponse.json(
        { error: 'Request ID, transaction ID, and receipt file are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get request details
    const requestDoc = await Request.findById(requestId).populate('studentId', 'name email studentId');
    
    if (!requestDoc) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Verify the request belongs to the logged-in student
    if (requestDoc.studentId?._id.toString() !== (session.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized access to this request' }, { status: 403 });
    }

    // Handle file upload
    const bytes = await receiptFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'payment-receipts');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${receiptFile.name}`;
    const receiptPath = path.join('uploads', 'payment-receipts', filename);
    const fullPath = path.join(process.cwd(), 'public', receiptPath);

    await writeFile(fullPath, buffer);

    // Update request with payment receipt information
    await Request.findByIdAndUpdate(requestId, {
      paymentReceiptPath: receiptPath,
      paymentTransactionId: transactionId,
      paymentReceiptUploadedAt: new Date(),
      paymentAdditionalInfo: additionalInfo,
      status: 'PAYMENT_VERIFICATION_PENDING'
    });

    // Send confirmation email to student
    const confirmationEmail = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #059669; margin: 0; font-size: 28px; }
        .success-box { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .details-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Receipt Received</h1>
            <p>Bule Hora University - Revenue Office</p>
        </div>

        <p>Dear ${requestDoc.studentId?.name},</p>

        <div class="success-box">
            <h3>✅ Payment Receipt Successfully Uploaded</h3>
            <p>Your payment receipt has been received and is now being reviewed by our revenue office.</p>
        </div>

        <div class="details-box">
            <h3>Payment Details</h3>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Request ID:</strong> ${requestDoc.revenueLetterId || requestDoc.trackingNumber}</p>
            <p><strong>Student ID:</strong> ${requestDoc.studentId?.studentId}</p>
            <p><strong>Document Type:</strong> ${requestDoc.documentType}</p>
            <p><strong>Receipt Uploaded:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <p><strong>Next Steps:</strong></p>
        <ul>
            <li>Your payment receipt will be verified by the revenue office</li>
            <li>You will receive a confirmation email once verified</li>
            <li>Your document will be processed after payment verification</li>
        </ul>

        <p><strong>Status:</strong> Payment Verification Pending</p>

        <div class="footer">
            <p>Revenue Office, Bule Hora University</p>
            <p>Email: revenue@bulehorauniversity.edu.et | Phone: +251 XXX XXX XXX</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `;

    await sendEmail({
      to: requestDoc.studentId?.email,
      subject: `Payment Receipt Received - ${transactionId}`,
      html: confirmationEmail
    });

    // Send notification to revenue office
    const revenueNotification = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #f59e0b; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #d97706; margin: 0; font-size: 28px; }
        .alert-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .details-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Payment Receipt Uploaded</h1>
            <p>Bule Hora University - Revenue Office Notification</p>
        </div>

        <div class="alert-box">
            <h3>📬 Action Required: Payment Receipt Verification</h3>
            <p>A student has uploaded their payment receipt and requires verification.</p>
        </div>

        <div class="details-box">
            <h3>Payment Details</h3>
            <p><strong>Student Name:</strong> ${requestDoc.studentId?.name}</p>
            <p><strong>Student ID:</strong> ${requestDoc.studentId?.studentId}</p>
            <p><strong>Student Email:</strong> ${requestDoc.studentId?.email}</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Request ID:</strong> ${requestDoc.revenueLetterId || requestDoc.trackingNumber}</p>
            <p><strong>Document Type:</strong> ${requestDoc.documentType}</p>
            <p><strong>Receipt Uploaded:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Additional Info:</strong> ${additionalInfo || 'None provided'}</p>
        </div>

        <p><strong>Next Steps:</strong></p>
        <ul>
            <li>Review the uploaded payment receipt</li>
            <li>Verify the transaction details</li>
            <li>Approve or reject the payment</li>
        </ul>

        <a href="http://localhost:3000/revenue" class="button">
            Review Payment Receipt
        </a>

        <div class="footer">
            <p>Revenue Office, Bule Hora University</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `;

    await sendEmail({
      to: 'revenue@bulehorauniversity.edu.et',
      subject: `New Payment Receipt - ${transactionId} - ${requestDoc.studentId?.name}`,
      html: revenueNotification
    });

    console.log('Payment receipt uploaded:', {
      requestId,
      transactionId,
      studentEmail: requestDoc.studentId?.email,
      receiptPath,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Payment receipt uploaded successfully',
      transactionId,
      requestId
    });

  } catch (error) {
    console.error('Failed to upload payment receipt:', error);
    return NextResponse.json({ error: 'Failed to upload payment receipt' }, { status: 500 });
  }
}
