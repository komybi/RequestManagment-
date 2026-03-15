import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import DocumentRequest from '@/lib/models/DocumentRequest';
import User from '@/lib/models/User';
import { sendEmail, getStatusEmailTemplate } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const document = await DocumentRequest.findById(params.id);

    if (!document) {
      return NextResponse.json(
        { message: 'Document not found' },
        { status: 404 }
      );
    }

    // Get student email
    const student = await User.findById(document.studentId);
    if (!student) {
      return NextResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      );
    }

    // Send email
    const emailTemplate = getStatusEmailTemplate(
      document.studentName,
      document.documentType,
      document.status,
      document.trackingNumber,
      document.rejectionReason
    );

    await sendEmail({
      to: student.email,
      subject: `Document Request ${document.status.toUpperCase()}: ${document.trackingNumber}`,
      html: emailTemplate,
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
