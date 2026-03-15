import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import DocumentRequest from '@/lib/models/DocumentRequest';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    let query: any = {};

    // Students see only their documents
    if (session.user?.role === 'student') {
      query.studentId = session.user.id;
    }

    const documents = await DocumentRequest.find(query)
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { documentType, description, purpose, quantity } = await req.json();

    await dbConnect();

    const document = await DocumentRequest.create({
      studentId: session.user?.id,
      studentName: session.user?.name,
      documentType,
      description,
      purpose,
      quantity,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Create document error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
