import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import DocumentRequest from '@/lib/models/DocumentRequest';
import { generateDocumentPDF } from '@/lib/pdf';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
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

    // Students can only download their own documents
    if (
      session.user?.role === 'student' &&
      document.studentId.toString() !== session.user.id
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Only approved or completed documents can be downloaded
    if (!['approved', 'completed'].includes(document.status)) {
      return NextResponse.json(
        { message: 'Document is not available for download' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfData = generateDocumentPDF(
      document.studentName,
      document.documentType,
      document.trackingNumber,
      document.approvedAt || new Date(),
      `This is to certify that ${document.studentName} has requested a ${document.documentType}.`
    );

    return new NextResponse(pdfData, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="document-${document.trackingNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
