import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user?.role !== 'revenue' && session.user?.role !== 'registrar' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transactionId } = await request.json();

    if (!transactionId || !transactionId.trim()) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    await dbConnect();

    // Find request with matching transaction ID
    const requestDoc = await Request.findOne({
      paymentTransactionId: transactionId.trim()
    })
    .populate('studentId', 'name email studentId')
    .lean();

    if (!requestDoc) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Format response
    const result = {
      _id: (requestDoc as any)._id,
      revenueLetterId: (requestDoc as any).revenueLetterId,
      revenueLetterContent: (requestDoc as any).revenueLetterContent,
      revenueLetterSentAt: (requestDoc as any).revenueLetterSentAt,
      studentName: (requestDoc as any).studentId?.name || 'Unknown',
      studentEmail: (requestDoc as any).studentId?.email || 'Unknown',
      studentId: (requestDoc as any).studentId?.studentId || 'Unknown',
      documentType: (requestDoc as any).documentType || 'Unknown',
      department: (requestDoc as any).department || '',
      program: (requestDoc as any).program || '',
      academicYear: (requestDoc as any).academicYear || '',
      sentToRevenueAt: (requestDoc as any).sentToRevenueAt,
      status: (requestDoc as any).revenueLetterContent ? 'Letter Sent' : 
             ((requestDoc as any).paymentReceiptPath ? 'Receipt Uploaded' : 
             ((requestDoc as any).paymentRequested && !(requestDoc as any).paymentReceiptPath ? 'Payment Pending' : 'Not Requested')),
      paymentRequested: (requestDoc as any).paymentRequested || false,
      paymentRequestedAt: (requestDoc as any).paymentRequestedAt,
      paymentAmount: (requestDoc as any).paymentAmount,
      paymentAccountDetails: (requestDoc as any).paymentAccountDetails,
      paymentReceiptPath: (requestDoc as any).paymentReceiptPath,
      paymentTransactionId: (requestDoc as any).paymentTransactionId,
      paymentReceiptUploadedAt: (requestDoc as any).paymentReceiptUploadedAt,
      paymentAdditionalInfo: (requestDoc as any).paymentAdditionalInfo
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Failed to check transaction:', error);
    return NextResponse.json({ error: 'Failed to check transaction' }, { status: 500 });
  }
}
