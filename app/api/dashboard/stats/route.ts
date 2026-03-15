import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get counts for the current student
    const studentId = (session.user as any)?.id;
    
    const [pendingCount, processingCount, approvedCount, rejectedCount] = await Promise.all([
      Request.countDocuments({ studentId, status: 'PENDING' }),
      Request.countDocuments({ studentId, status: 'PROCESSING' }),
      Request.countDocuments({ studentId, status: 'APPROVED' }),
      Request.countDocuments({ studentId, status: 'REJECTED' })
    ]);

    return NextResponse.json({
      pending: pendingCount,
      processing: processingCount,
      approved: approvedCount,
      rejected: rejectedCount
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
