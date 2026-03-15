import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import DocumentRequest from '@/lib/models/DocumentRequest';
import QRCode from 'qrcode';

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

    // Only approved documents can have QR codes
    if (document.status !== 'approved') {
      return NextResponse.json(
        { message: 'Document must be approved to generate QR code' },
        { status: 400 }
      );
    }

    // Generate QR code
    const qrData = `${process.env.NEXTAUTH_URL}/track/${document.trackingNumber}`;
    const qrCode = await QRCode.toDataURL(qrData);

    // Update document with QR code
    document.qrCode = qrCode;
    await document.save();

    return NextResponse.json({ qrCode });
  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
