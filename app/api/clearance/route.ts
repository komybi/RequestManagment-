import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clearanceType, purpose, department, description } = await request.json();

    if (!clearanceType || !purpose || !department) {
      return NextResponse.json(
        { error: 'Clearance type, purpose, and department are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create clearance request
    const clearanceRequest = {
      _id: new mongoose.Types.ObjectId(),
      studentId: new mongoose.Types.ObjectId(session.user.id),
      studentName: session.user.name,
      requestType: 'CLEARANCE',
      clearanceType,
      purpose,
      department,
      description,
      status: 'PENDING',
      paymentVerified: false,
      trackingNumber: `CLR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database (you might want to create a separate model for this)
    // For now, we'll use the existing Request model if it supports these fields
    const Request = (mongoose.models && mongoose.models.Request) || mongoose.model('Request');
    
    const newRequest = new Request(clearanceRequest);
    await newRequest.save();

    return NextResponse.json({
      message: 'Clearance request submitted successfully',
      request: newRequest,
    });
  } catch (error) {
    console.error('Clearance request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit clearance request' },
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
      requestType: 'CLEARANCE'
    }).sort({ createdAt: -1 });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Get clearance requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clearance requests' },
      { status: 500 }
    );
  }
}
