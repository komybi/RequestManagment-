import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';
import Receipt from '@/lib/models/Receipt';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'revenue') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const request = await Request.findById(params.id);
    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Mark payment as verified
    request.paymentVerified = true;
    await request.save();

    // Generate receipt
    const receipt = await Receipt.create({
      requestId: params.id,
      fileURL: `/receipts/receipt-${params.id}.pdf`, // In real app, generate PDF
      generatedBy: (session.user as any)?.id,
    });

    return NextResponse.json({ request, receipt });
  } catch (error) {
    console.error('Failed to verify payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
