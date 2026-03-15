import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'revenue') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const stats = {
      total: await Request.countDocuments({ status: 'APPROVED' }),
      pending: await Request.countDocuments({ status: 'APPROVED', paymentVerified: false }),
      verified: await Request.countDocuments({ status: 'APPROVED', paymentVerified: true }),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
