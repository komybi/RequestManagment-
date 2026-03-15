import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user?.role !== 'registrar' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const letterData = await request.json();
    
    const {
      requestId,
      studentId,
      studentName,
      studentIdNumber,
      documentType,
      department,
      program,
      academicYear,
      requestDate,
      deliveryDate,
      urgency,
      purpose
    } = letterData;

    // Generate formal letter content
    const letterContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #333; }
        .header p { margin: 5px 0; color: #666; }
        .content { margin: 20px 0; }
        .student-info { background: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
        .request-details { margin: 20px 0; }
        .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
        .signature { margin-top: 30px; }
        .urgent { color: #dc3545; font-weight: bold; }
        .normal { color: #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>UNIVERSITY DOCUMENT REQUEST</h1>
        <p>Revenue Office Processing Letter</p>
        <p>Reference: REQ-${requestId?.slice(-8).toUpperCase()}</p>
    </div>

    <div class="content">
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>To:</strong> Revenue Office</p>
        <p><strong>From:</strong> Registrar Office</p>
        
        <h2>Student Information</h2>
        <div class="student-info">
            <p><strong>Student Name:</strong> ${studentName}</p>
            <p><strong>Student ID:</strong> ${studentIdNumber}</p>
            <p><strong>Department:</strong> ${department}</p>
            <p><strong>Program:</strong> ${program}</p>
            <p><strong>Academic Year:</strong> ${academicYear}</p>
        </div>

        <h2>Document Request Details</h2>
        <div class="request-details">
            <p><strong>Document Type:</strong> ${documentType}</p>
            <p><strong>Request Date:</strong> ${new Date(requestDate).toLocaleDateString()}</p>
            <p><strong>Purpose:</strong> ${purpose}</p>
            <p><strong>Urgency Level:</strong> <span class="${urgency === 'Urgent' ? 'urgent' : 'normal'}">${urgency}</span></p>
            ${deliveryDate ? `<p><strong>Requested Delivery Date:</strong> ${new Date(deliveryDate).toLocaleDateString()}</p>` : ''}
        </div>

        <h2>Action Required</h2>
        <p>Please review this document request and process the payment verification. The student has submitted their request through the official university portal and requires the following document:</p>
        
        <ul>
            <li>Verify payment status for the requested document</li>
            <li>Confirm fee structure based on document type and urgency</li>
            <li>Generate official receipt upon payment confirmation</li>
            <li>Update request status in the system</li>
        </ul>

        <p><strong>Next Steps:</strong></p>
        <ol>
            <li>Review the attached request details</li>
            <li>Check payment verification status</li>
            <li>Generate and upload payment receipt</li>
            <li>Send confirmation email to student</li>
            <li>Return processed request to registrar office</li>
        </ol>
    </div>

    <div class="footer">
        <p><strong>Important Notes:</strong></p>
        <ul>
            <li>This is an automated request from the university portal</li>
            <li>Please process within 2-3 business days</li>
            <li>Contact registrar office for any clarifications</li>
            <li>Student will be notified of payment status</li>
        </ul>
    </div>

    <div class="signature">
        <p>_________________________</p>
        <p><strong>Registrar Office</strong></p>
        <p>University Administration</p>
    </div>
</body>
</html>
    `;

    // Send email to revenue office
    const revenueEmail = 'revenue@university.edu'; // Update with actual revenue office email
    
    await sendEmail({
      to: revenueEmail,
      subject: `Document Request Processing - ${studentName} (${studentIdNumber})`,
      html: letterContent
    });

    // Generate letter ID for tracking
    const letterId = `REV-${Date.now()}-${requestId?.slice(-6).toUpperCase()}`;

    console.log('Revenue letter generated and sent:', {
      letterId,
      requestId,
      studentName,
      studentIdNumber,
      documentType,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Revenue letter generated successfully',
      letterId,
      sentTo: revenueEmail
    });

  } catch (error) {
    console.error('Failed to generate revenue letter:', error);
    return NextResponse.json({ error: 'Failed to generate revenue letter' }, { status: 500 });
  }
}
