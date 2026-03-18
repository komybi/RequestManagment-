import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user?.role !== 'registrar' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    console.log('Fetching formal receipts for registrar...');

    // Fetch requests with formal receipts available to registrar
    const formalReceipts = await Request.find({
      availableToRegistrar: true,
      formalReceiptId: { $exists: true, $ne: null },
      formalReceiptContent: { $exists: true, $ne: null }
    })
    .populate('studentId', 'name email studentId')
    .sort({ forwardedToRegistrarAt: -1 })
    .lean();

    console.log('Found formal receipts:', formalReceipts.length);

    // Transform data for registrar dashboard
    const formattedReceipts = formalReceipts.map(receipt => ({
      _id: receipt._id,
      formalReceiptId: (receipt as any).formalReceiptId,
      formalReceiptContent: (receipt as any).formalReceiptContent,
      formalReceiptIssuedAt: (receipt as any).formalReceiptIssuedAt,
      formalReceiptIssuedBy: (receipt as any).formalReceiptIssuedBy,
      forwardedToRegistrarAt: (receipt as any).forwardedToRegistrarAt,
      studentName: (receipt as any).studentId?.name || 'Unknown',
      studentEmail: (receipt as any).studentId?.email || 'Unknown',
      studentId: (receipt as any).studentId?.studentId || 'Unknown',
      documentType: receipt.documentType || 'Unknown',
      department: receipt.department || '',
      program: receipt.program || '',
      academicYear: receipt.academicYear || '',
      paymentAmount: receipt.paymentAmount,
      paymentTransactionId: receipt.paymentTransactionId,
      paymentReceiptPath: receipt.paymentReceiptPath,
      paymentReceiptUploadedAt: receipt.paymentReceiptUploadedAt,
      status: receipt.status,
      registrarProcessed: (receipt as any).registrarProcessed || false,
      availableToRegistrar: (receipt as any).availableToRegistrar || false
    }));

    console.log('Formatted receipts:', formattedReceipts.length);

    return NextResponse.json(formattedReceipts);

  } catch (error) {
    console.error('Failed to fetch formal receipts:', error);
    return NextResponse.json({ error: 'Failed to fetch formal receipts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user?.role !== 'registrar' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId, action } = await request.json();

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Request ID and action are required' }, { status: 400 });
    }

    await dbConnect();

    let updateData = {};

    switch (action) {
      case 'mark_processed':
        updateData = {
          registrarProcessed: true,
          registrarProcessedAt: new Date(),
          registrarProcessedBy: session.user?.name || 'Registrar',
          status: 'FORMAL_RECEIPT_ISSUED'
        };
        break;
      case 'mark_pending':
        updateData = {
          registrarProcessed: false,
          status: 'FORMAL_RECEIPT_PENDING'
        };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true }
    ).populate('studentId', 'name email studentId');

    if (!updatedRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Request ${action.replace('_', ' ')} successfully`,
      requestDetails: {
        requestId: updatedRequest._id,
        studentName: (updatedRequest as any).studentId?.name,
        status: updatedRequest.status,
        registrarProcessed: (updatedRequest as any).registrarProcessed
      }
    });

  } catch (error) {
    console.error('Failed to update formal receipt:', error);
    return NextResponse.json({ error: 'Failed to update formal receipt' }, { status: 500 });
  }
}
