import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import DocumentRequest from '@/lib/models/DocumentRequest';

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

    // Students can only view their own documents
    if (
      session.user?.role === 'student' &&
      document.studentId.toString() !== session.user.id
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { status, rejectionReason } = await req.json();

    await dbConnect();
    const document = await DocumentRequest.findByIdAndUpdate(
      params.id,
      {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
        approvedAt: status === 'approved' ? new Date() : undefined,
        approvedBy: session.user?.id,
      },
      { new: true }
    );

    if (!document) {
      return NextResponse.json(
        { message: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Update document error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Students can only delete their own pending documents
    if (session.user?.role === 'student') {
      if (
        document.studentId.toString() !== session.user.id ||
        document.status !== 'pending'
      ) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
      }
    }

    await DocumentRequest.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
