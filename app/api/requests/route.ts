import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';
import IDReplacementRequest from '@/lib/models/IDReplacementRequest';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await dbConnect();
    } catch (dbError) {
      console.error('[v0] Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', message: 'Please check your MongoDB configuration' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const role = (session.user as any)?.role;
    const roleParam = searchParams.get('role');

    let query: any = {};

    // Build status filter
    if (status) {
      const statuses = status.split(',');
      query.status = { $in: statuses };
    }

    // Build request type filter for registrar
    if (role === 'registrar') {
      query.requestType = { $in: ['DOCUMENT', 'MA_DOCUMENT', 'ID_REPLACEMENT'] };
    }

    // Filter by user role
    if (role === 'student') {
      query.studentId = (session.user as any)?.id;
    }

    // Fetch document requests
    const documentRequests = await Request.find(query)
      .populate('studentId', 'name email studentId department program phoneNumber year')
      .sort({ createdAt: -1 });

    // Fetch ID replacement requests
    const idReplacementRequests = await IDReplacementRequest.find(query)
      .populate('studentId', 'name email studentId department program phoneNumber year')
      .sort({ createdAt: -1 });

    // Combine and format all requests
    const allRequests = [
      ...documentRequests.map(req => ({
        ...req.toObject(),
        requestType: req.requestType, // Keep original requestType (DOCUMENT or MA_DOCUMENT)
        documentType: req.documentType,
        paymentFile: req.paymentFile,
        department: req.department,
        program: req.program,
        phoneNumber: req.phoneNumber,
        academicYear: req.academicYear,
      })),
      ...idReplacementRequests.map(req => ({
        ...req.toObject(),
        requestType: 'ID_REPLACEMENT',
        documentType: null,
        paymentFile: req.receiptPath,
        reason: req.reason,
        replacementType: req.replacementType,
        department: req.department,
        program: req.program,
        phoneNumber: req.phoneNumber,
        academicYear: req.academicYear,
        // Convert status to uppercase for consistency
        status: req.status.toUpperCase(),
      })),
    ];

    // Sort all requests by creation date
    allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(allRequests);
  } catch (error) {
    console.error('[v0] Failed to fetch requests:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await dbConnect();
    } catch (dbError) {
      console.error('[v0] Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', message: 'Please check your MongoDB configuration' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { 
      requestType, 
      documentType, 
      deliveryMethod, 
      paymentFile,
      department,
      program,
      phoneNumber,
      academicYear,
      description
    } = body;

    // Generate tracking number
    const trackingNumber = `TR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    console.log('Creating request with data:', {
      studentId: (session.user as any)?.id,
      requestType,
      documentType,
      deliveryMethod,
      paymentFile,
      department,
      program,
      phoneNumber,
      academicYear,
      description,
      trackingNumber,
    });

    const newRequest = await Request.create({
      studentId: (session.user as any)?.id,
      requestType,
      documentType,
      deliveryMethod,
      paymentFile,
      department,
      program,
      phoneNumber,
      academicYear,
      description,
      trackingNumber,
      paymentVerified: false,
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('[v0] Failed to create request:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
