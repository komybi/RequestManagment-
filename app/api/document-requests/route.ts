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
      .populate('studentId', 'name email studentId')
      .sort({ createdAt: -1 });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Get document requests error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('Document request POST received');
    
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'student') {
      console.error('Unauthorized access attempt:', { session: session?.user });
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    console.log('Database connected');

    const body = await req.json();
    console.log('Request body received:', body);

    const { 
      documentType, 
      quantity, 
      department, 
      program, 
      phoneNumber, 
      academicYear, 
      description 
    } = body;

    console.log('Parsed fields:', {
      documentType,
      quantity,
      department,
      program,
      phoneNumber,
      academicYear,
      description,
      studentId: (session.user as any)?.id,
      studentName: (session.user as any)?.name
    });

    // Validate required fields
    if (!documentType) {
      console.error('Missing document type');
      return NextResponse.json({ message: 'Document type is required' }, { status: 400 });
    }

    // Generate tracking number
    const trackingNumber = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    console.log('Generated tracking number:', trackingNumber);

    const newDocumentRequest = await DocumentRequest.create({
      studentId: (session.user as any)?.id,
      studentName: (session.user as any)?.name,
      documentType,
      quantity: parseInt(quantity) || 1,
      department,
      program,
      phoneNumber,
      academicYear,
      description,
      trackingNumber,
      status: 'pending',
      paymentStatus: 'unpaid',
      amount: 0,
    });

    console.log('Document request created successfully:', {
      id: newDocumentRequest._id,
      trackingNumber,
      documentType,
      studentName: (session.user as any)?.name,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(newDocumentRequest, { status: 201 });
  } catch (error) {
    console.error('Failed to create document request:', error);
    return NextResponse.json(
      { message: 'Failed to submit request. Please try again.', error: String(error) },
      { status: 500 }
    );
  }
}
