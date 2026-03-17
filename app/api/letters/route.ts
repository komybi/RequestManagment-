import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user?.role !== 'revenue' && session.user?.role !== 'registrar' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Fetch only requests that have letters generated
    const letters = await Request.find({
      revenueLetterContent: { $exists: true, $ne: null }
    })
    .populate('studentId', 'name email studentId')
    .sort({ revenueLetterSentAt: -1 })
    .lean();

    // Transform data for letters table
    const formattedLetters = letters.map(letter => ({
      _id: letter._id,
      revenueLetterId: letter.revenueLetterId,
      revenueLetterContent: letter.revenueLetterContent,
      revenueLetterSentAt: letter.revenueLetterSentAt,
      studentName: letter.studentId?.name || 'Unknown',
      studentEmail: letter.studentId?.email || 'Unknown',
      studentId: letter.studentId?.studentId || 'Unknown',
      documentType: letter.documentType || 'Unknown',
      department: letter.department || '',
      program: letter.program || '',
      academicYear: letter.academicYear || '',
      sentToRevenueAt: letter.sentToRevenueAt,
      status: 'Sent to Student',
      paymentRequested: letter.paymentRequested || false,
      paymentAmount: letter.paymentAmount,
      paymentAccountDetails: letter.paymentAccountDetails,
      paymentReceiptPath: letter.paymentReceiptPath,
      paymentTransactionId: letter.paymentTransactionId,
      paymentReceiptUploadedAt: letter.paymentReceiptUploadedAt,
      paymentAdditionalInfo: letter.paymentAdditionalInfo
    }));

    return NextResponse.json(formattedLetters);

  } catch (error) {
    console.error('Failed to fetch letters:', error);
    return NextResponse.json({ error: 'Failed to fetch letters' }, { status: 500 });
  }
}
