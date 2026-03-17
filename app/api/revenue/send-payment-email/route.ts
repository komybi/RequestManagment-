import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { sendEmail } from '@/lib/email';
import Request from '@/lib/models/Request';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user?.role !== 'revenue' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId, amount, accountDetails, paymentInstructions } = await request.json();

    await dbConnect();

    // Get request details
    const requestDoc = await Request.findById(requestId).populate('studentId', 'name email studentId');
    
    if (!requestDoc) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Generate payment email content
    const paymentEmailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #1e40af; margin: 0; font-size: 28px; }
        .payment-details { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        .payment-details h3 { color: #1e40af; margin-top: 0; }
        .upload-section { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .upload-section h3 { color: #92400e; margin-top: 0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
        .transaction-id { background: #dbeafe; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Required - Document Request</h1>
            <p>Bule Hora University - Revenue Office</p>
        </div>

        <p>Dear ${requestDoc.studentId?.name},</p>

        <p>Your document request has been processed and is ready for payment. Please complete the payment to proceed with your document issuance.</p>

        <div class="payment-details">
            <h3>Payment Details</h3>
            <p><strong>Amount to Pay:</strong> ${amount} ETB</p>
            <p><strong>Request ID:</strong> ${requestDoc.revenueLetterId || requestDoc.trackingNumber}</p>
            <p><strong>Student ID:</strong> ${requestDoc.studentId?.studentId}</p>
            <p><strong>Document Type:</strong> ${requestDoc.documentType}</p>
        </div>

        <div class="payment-details">
            <h3>Account Information</h3>
            <p>${accountDetails}</p>
        </div>

        <div class="payment-details">
            <h3>Payment Instructions</h3>
            <p>${paymentInstructions}</p>
        </div>

        <div class="upload-section">
            <h3>Important: Upload Payment Receipt</h3>
            <p>After making the payment, you must upload your payment receipt with transaction ID to complete the process.</p>
            
            <div class="transaction-id">
                <strong>Your Transaction ID Format:</strong><br>
                DOC-{requestDoc.studentId?.studentId?.slice(-4)}-${Date.now().toString().slice(-6)}
            </div>

            <p>Click the button below to upload your payment receipt:</p>
            <a href="http://localhost:3000/payment-receipt?requestId=${requestId}&transactionId=DOC-${requestDoc.studentId?.studentId?.slice(-4)}-${Date.now().toString().slice(-6)}" class="button">
                Upload Payment Receipt
            </a>
        </div>

        <p><strong>Note:</strong> Your document will be processed only after payment verification.</p>

        <div class="footer">
            <p>Revenue Office, Bule Hora University</p>
            <p>Email: revenue@bulehorauniversity.edu.et | Phone: +251 XXX XXX XXX</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `;

    // Send payment email to student
    await sendEmail({
      to: requestDoc.studentId?.email,
      subject: `Payment Required - Document Request ${requestDoc.revenueLetterId || requestDoc.trackingNumber}`,
      html: paymentEmailContent
    });

    // Update request status
    await Request.findByIdAndUpdate(requestId, {
      paymentRequested: true,
      paymentRequestedAt: new Date(),
      paymentAmount: amount,
      paymentAccountDetails: accountDetails,
      status: 'PAYMENT_PENDING'
    });

    console.log('Payment email sent:', {
      requestId,
      studentEmail: requestDoc.studentId?.email,
      amount,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Payment email sent to student',
      studentEmail: requestDoc.studentId?.email
    });

  } catch (error) {
    console.error('Failed to send payment email:', error);
    return NextResponse.json({ error: 'Failed to send payment email' }, { status: 500 });
  }
}
