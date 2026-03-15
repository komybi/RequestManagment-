import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const requestType = formData.get('requestType') as string;
    const amount = formData.get('amount') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const description = formData.get('description') as string;
    const receiptFile = formData.get('receipt') as File;

    if (!requestType || !amount || !paymentMethod || !description) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Handle file upload if present
    let receiptPath = null;
    if (receiptFile) {
      const bytes = await receiptFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      // Generate unique filename
      const filename = `${Date.now()}-${receiptFile.name}`;
      receiptPath = path.join('uploads', 'receipts', filename);
      const fullPath = path.join(process.cwd(), 'public', receiptPath);

      await writeFile(fullPath, buffer);
    }

    // Create cost share request
    const costShareRequest = {
      _id: new mongoose.Types.ObjectId(),
      studentId: new mongoose.Types.ObjectId(session.user.id),
      studentName: session.user.name,
      requestType: 'COST_SHARE',
      costShareType: requestType,
      amount: parseFloat(amount),
      paymentMethod,
      description,
      receiptPath,
      status: 'PENDING',
      paymentVerified: false,
      trackingNumber: `CS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database
    const Request = (mongoose.models && mongoose.models.Request) || mongoose.model('Request');
    
    const newRequest = new Request(costShareRequest);
    await newRequest.save();

    return NextResponse.json({
      message: 'Cost share request submitted successfully',
      request: newRequest,
    });
  } catch (error) {
    console.error('Cost share request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit cost share request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const Request = (mongoose.models && mongoose.models.Request) || mongoose.model('Request');
    
    const requests = await Request.find({
      studentId: session.user.id,
      requestType: 'COST_SHARE'
    }).sort({ createdAt: -1 });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Get cost share requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cost share requests' },
      { status: 500 }
    );
  }
}
