import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { getLetterTemplate } from '@/lib/letterTemplate';
import Request from '@/lib/models/Request';

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
      studentEmail,
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

    await dbConnect();

    // Generate formal letter content using template
    const letterContent = getLetterTemplate({
      registrarName: session.user?.name || 'Registrar',
      date: new Date().toLocaleDateString(),
      studentName,
      studentId: studentIdNumber,
      department: department || '',
      program: program || '',
      academicYear: academicYear || '',
      documentType: documentType || 'Document',
      description: purpose || 'Document request processing'
    });

    // Convert to HTML format for email
    const htmlLetterContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; white-space: pre-wrap; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .content { margin: 20px 0; }
        .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
        .signature { margin-top: 30px; }
    </style>
</head>
<body>
    <div class="content">
        ${letterContent.replace(/\n/g, '<br>')}
    </div>
</body>
</html>
    `;

    // Send email to STUDENT (not revenue office)
    await sendEmail({
      to: studentEmail,
      subject: `Document Request Confirmation - ${studentName} (${studentIdNumber})`,
      html: htmlLetterContent
    });

    // Generate letter ID for tracking
    const letterId = `LET-${Date.now()}-${requestId?.slice(-6).toUpperCase()}`;

    // Update the request with letter information for revenue dashboard
    await Request.findByIdAndUpdate(requestId, {
      revenueLetterId: letterId,
      revenueLetterContent: letterContent,
      revenueLetterSentAt: new Date(),
      sentToRevenueAt: new Date(),
      status: 'REVENUE_REVIEW'
    });

    console.log('Student letter generated and sent:', {
      letterId,
      requestId,
      studentName,
      studentEmail,
      studentIdNumber,
      documentType,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Letter sent to student and stored for revenue review',
      letterId,
      sentTo: studentEmail
    });

  } catch (error) {
    console.error('Failed to generate letter:', error);
    return NextResponse.json({ error: 'Failed to generate letter' }, { status: 500 });
  }
}
