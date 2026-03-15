import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';
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

    // Filter by user role
    if (role === 'student') {
      query.studentId = (session.user as any)?.id;
    }
    // For registrar and admin, show all student requests
    // No additional filtering needed - they see all requests

    const requests = await Request.find(query)
      .populate('studentId', 'name email studentId')
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
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
    const { requestType, documentType, deliveryMethod, paymentFile } = body;

    // Generate tracking number
    const trackingNumber = `TR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const newRequest = await Request.create({
      studentId: (session.user as any)?.id,
      requestType,
      documentType,
      deliveryMethod,
      paymentFile,
      trackingNumber,
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('[v0] Failed to create request:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
