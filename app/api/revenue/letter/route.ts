import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { getLetterTemplate } from '@/lib/letterTemplate';

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

    // Generate formal letter content using template
    const letterContent = getLetterTemplate({
      registrarName: session.user?.name || 'Registrar',
      date: new Date().toLocaleDateString(),
      studentName,
      studentId: studentIdNumber,
      department: department || 'N/A',
      program: program || 'N/A',
      academicYear: academicYear || 'N/A',
      documentType: documentType || 'Document',
      description: purpose || 'Document request for revenue processing'
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

    // Send email to revenue office
    const revenueEmail = 'revenue@university.edu'; // Update with actual revenue office email
    
    await sendEmail({
      to: revenueEmail,
      subject: `Document Request Processing - ${studentName} (${studentIdNumber})`,
      html: htmlLetterContent
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
