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
    const reason = formData.get('reason') as string;
    const replacementType = formData.get('replacementType') as string;
    const description = formData.get('description') as string;
    const receiptFile = formData.get('receipt') as File;

    if (!reason || !replacementType) {
      return NextResponse.json(
        { error: 'Reason and replacement type are required' },
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

    // Create ID replacement request
    const idReplacementRequest = {
      _id: new mongoose.Types.ObjectId(),
      studentId: new mongoose.Types.ObjectId(session.user.id),
      studentName: session.user.name,
      requestType: 'ID_REPLACEMENT',
      replacementType,
      reason,
      description,
      receiptPath,
      status: 'PENDING',
      paymentVerified: false,
      trackingNumber: `ID-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database (you might want to create a separate model for this)
    // For now, we'll use the existing Request model if it supports these fields
    const Request = (mongoose.models && mongoose.models.Request) || mongoose.model('Request');
    
    const newRequest = new Request(idReplacementRequest);
    await newRequest.save();

    return NextResponse.json({
      message: 'ID replacement request submitted successfully',
      request: newRequest,
    });
  } catch (error) {
    console.error('ID replacement request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit ID replacement request' },
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
      requestType: 'ID_REPLACEMENT'
    }).sort({ createdAt: -1 });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Get ID replacement requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ID replacement requests' },
      { status: 500 }
    );
  }
}
