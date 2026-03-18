import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Check all requests that have been forwarded to registrar
    const allRequests = await Request.find({
      availableToRegistrar: true
    })
    .select('formalReceiptId formalReceiptContent availableToRegistrar forwardedToRegistrarAt status')
    .sort({ forwardedToRegistrarAt: -1 })
    .lean();

    console.log('All forwarded requests:', allRequests.length);

    // Check requests with formal receipt ID
    const withReceiptId = await Request.find({
      formalReceiptId: { $exists: true, $ne: null }
    })
    .select('formalReceiptId formalReceiptContent availableToRegistrar forwardedToRegistrarAt status')
    .sort({ forwardedToRegistrarAt: -1 })
    .lean();

    console.log('Requests with receipt ID:', withReceiptId.length);

    // Check requests with formal receipt content
    const withReceiptContent = await Request.find({
      formalReceiptContent: { $exists: true, $ne: null }
    })
    .select('formalReceiptId formalReceiptContent availableToRegistrar forwardedToRegistrarAt status')
    .sort({ forwardedToRegistrarAt: -1 })
    .lean();

    console.log('Requests with receipt content:', withReceiptContent.length);

    return NextResponse.json({
      totalForwarded: allRequests.length,
      withReceiptId: withReceiptId.length,
      withReceiptContent: withReceiptContent.length,
      details: {
        allRequests: allRequests.map(req => ({
          formalReceiptId: req.formalReceiptId,
          availableToRegistrar: req.availableToRegistrar,
          forwardedToRegistrarAt: req.forwardedToRegistrarAt,
          status: req.status,
          hasContent: !!req.formalReceiptContent
        })),
        withReceiptId: withReceiptId.map(req => ({
          formalReceiptId: req.formalReceiptId,
          availableToRegistrar: req.availableToRegistrar,
          forwardedToRegistrarAt: req.forwardedToRegistrarAt,
          status: req.status,
          hasContent: !!req.formalReceiptContent
        })),
        withReceiptContent: withReceiptContent.map(req => ({
          formalReceiptId: req.formalReceiptId,
          availableToRegistrar: req.availableToRegistrar,
          forwardedToRegistrarAt: req.forwardedToRegistrarAt,
          status: req.status,
          hasContent: !!req.formalReceiptContent
        }))
      }
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}
