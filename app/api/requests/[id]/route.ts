import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const request = await Request.findById(params.id).populate('studentId', 'name email studentId');

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error('Failed to fetch request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    if (!['registrar', 'admin', 'revenue'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const body = await req.json();
    const { status, deliveryDate, registrarNotes, paymentVerified } = body;

    const updatedRequest = await Request.findByIdAndUpdate(
      params.id,
      {
        status,
        deliveryDate,
        registrarNotes,
        paymentVerified,
      },
      { new: true }
    ).populate('studentId', 'name email studentId');

    if (!updatedRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Failed to update request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
