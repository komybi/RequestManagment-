import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Request from '@/lib/models/Request';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const stats = {
      totalUsers: await User.countDocuments(),
      students: await User.countDocuments({ role: 'student' }),
      registrars: await User.countDocuments({ role: 'registrar' }),
      revenue: await User.countDocuments({ role: 'revenue' }),
      admins: await User.countDocuments({ role: 'admin' }),
      totalRequests: await Request.countDocuments(),
      pendingRequests: await Request.countDocuments({ status: 'PENDING' }),
      approvedRequests: await Request.countDocuments({ status: 'APPROVED' }),
      rejectedRequests: await Request.countDocuments({ status: 'REJECTED' }),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
