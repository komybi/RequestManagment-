import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role, studentId, department, program, phoneNumber, year } = await req.json();

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      email,
      password: password, // Store password in plain text as requested
      name,
      role: role || 'student',
      studentId: studentId || undefined,
      department: department || undefined,
      program: program || undefined,
      phoneNumber: phoneNumber || undefined,
      year: year || undefined,
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
