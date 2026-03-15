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

    const stats = {
      pending: await Request.countDocuments({ status: 'PENDING' }),
      processing: await Request.countDocuments({ status: 'PROCESSING' }),
      approved: await Request.countDocuments({ status: 'APPROVED' }),
      rejected: await Request.countDocuments({ status: 'REJECTED' }),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
