import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';
import IDReplacementRequest from '@/lib/models/IDReplacementRequest';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Try to find in Request model first
    let request = await Request.findById(params.id).populate('studentId', 'name email studentId');
    
    // If not found, try IDReplacementRequest model
    if (!request) {
      request = await IDReplacementRequest.findById(params.id).populate('studentId', 'name email studentId');
    }

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Format the response to match the combined structure
    const formattedRequest = {
      ...request.toObject(),
      requestType: request.requestType || 'DOCUMENT',
      documentType: request.documentType || null,
      paymentFile: request.paymentFile || request.receiptPath,
      reason: request.reason || null,
      replacementType: request.replacementType || null,
      department: request.department || 'N/A',
      program: request.program || 'N/A',
      phoneNumber: request.phoneNumber || 'N/A',
      academicYear: request.academicYear || 'N/A',
      // Ensure status is uppercase for consistency
      status: request.status.toUpperCase(),
    };

    return NextResponse.json(formattedRequest);
  } catch (error) {
    console.error('Failed to fetch request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const body = await req.json();
    const { status, deliveryDate, registrarNotes, paymentVerified } = body;

    // Try to update in Request model first
    let updatedRequest = await Request.findByIdAndUpdate(
      id,
      {
        status,
        deliveryDate,
        registrarNotes,
        paymentVerified,
      },
      { new: true }
    ).populate('studentId', 'name email studentId');

    if (updatedRequest) {
      return NextResponse.json(updatedRequest);
    }

    // If not found in Request model, try IDReplacementRequest
    const idReplacementStatus = status.toLowerCase();
    updatedRequest = await IDReplacementRequest.findByIdAndUpdate(
      id,
      {
        status: idReplacementStatus,
        registrarNotes,
        paymentVerified,
        approvedBy: (session.user as any)?.id,
        approvedAt: status === 'APPROVED' ? new Date() : undefined,
      },
      { new: true }
    ).populate('studentId', 'name email studentId');

    if (!updatedRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Format the response to match the combined structure
    const formattedRequest = {
      ...updatedRequest.toObject(),
      requestType: updatedRequest.requestType || 'DOCUMENT',
      documentType: updatedRequest.documentType || null,
      paymentFile: updatedRequest.paymentFile || updatedRequest.receiptPath,
      reason: updatedRequest.reason || null,
      replacementType: updatedRequest.replacementType || null,
      department: updatedRequest.department || 'N/A',
      program: updatedRequest.program || 'N/A',
      phoneNumber: updatedRequest.phoneNumber || 'N/A',
      academicYear: updatedRequest.academicYear || 'N/A',
      // Ensure status is uppercase for consistency
      status: updatedRequest.status.toUpperCase(),
    };

    return NextResponse.json(formattedRequest);
  } catch (error) {
    console.error('Failed to update request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
