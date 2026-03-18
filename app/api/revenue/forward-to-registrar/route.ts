import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user?.role !== 'revenue' && session.user?.role !== 'registrar' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      requestId,
      studentName,
      studentEmail,
      studentId,
      documentType,
      department,
      program,
      academicYear,
      paymentAmount,
      paymentTransactionId,
      paymentReceiptPath,
      paymentReceiptUploadedAt
    } = await request.json();

    if (!requestId || !paymentReceiptPath) {
      return NextResponse.json({ error: 'Request ID and payment receipt are required' }, { status: 400 });
    }

    await dbConnect();

    // Generate formal receipt ID
    const formalReceiptId = `FR-${Date.now()}-${requestId?.slice(-6).toUpperCase()}`;

    // Create formal receipt content
    const formalReceiptContent = generateFormalReceipt({
      formalReceiptId,
      studentName,
      studentId,
      documentType,
      department,
      program,
      academicYear,
      paymentAmount,
      paymentTransactionId,
      paymentReceiptUploadedAt,
      issuedDate: new Date().toLocaleDateString(),
      issuedBy: session.user?.name || 'Revenue Officer'
    });

    // Update request with formal receipt - STORE IN DATABASE
    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      {
        // Store formal receipt details in database
        formalReceiptId,
        formalReceiptContent,
        formalReceiptIssuedAt: new Date(),
        formalReceiptIssuedBy: session.user?.name || 'Revenue Officer',
        forwardedToRegistrarAt: new Date(),
        status: 'FORMAL_RECEIPT_PENDING',
        
        // Mark as ready for registrar processing
        availableToRegistrar: true,
        registrarProcessed: false
      },
      { new: true }
    ).populate('studentId', 'name email studentId');

    if (!updatedRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Formal receipt generated and stored successfully. Available in registrar dashboard.',
      formalReceiptId,
      requestDetails: {
        requestId: updatedRequest._id,
        studentName: (updatedRequest as any).studentId?.name,
        studentEmail: (updatedRequest as any).studentId?.email,
        documentType: updatedRequest.documentType,
        paymentAmount: updatedRequest.paymentAmount,
        paymentTransactionId: updatedRequest.paymentTransactionId,
        status: updatedRequest.status,
        availableToRegistrar: true,
        forwardedToRegistrarAt: new Date()
      }
    });

  } catch (error) {
    console.error('Failed to generate formal receipt:', error);
    return NextResponse.json({ error: 'Failed to generate formal receipt' }, { status: 500 });
  }
}

function generateFormalReceipt(data: {
  formalReceiptId: string;
  studentName: string;
  studentId: string;
  documentType: string;
  department: string;
  program: string;
  academicYear: string;
  paymentAmount: number;
  paymentTransactionId: string;
  paymentReceiptUploadedAt: string;
  issuedDate: string;
  issuedBy: string;
}) {
  return `
FORMAL PAYMENT RECEIPT

Bule Hora University
Revenue Office
${data.issuedDate}

RECEIPT ID: ${data.formalReceiptId}

===============================================================================
STUDENT INFORMATION
===============================================================================
Name: ${data.studentName}
Student ID: ${data.studentId}
Department: ${data.department}
Program: ${data.program}
Academic Year: ${data.academicYear}

===============================================================================
PAYMENT DETAILS
===============================================================================
Document Type: ${data.documentType}
Amount Paid: ${data.paymentAmount} ETB
Transaction ID: ${data.paymentTransactionId}
Payment Date: ${data.paymentReceiptUploadedAt ? new Date(data.paymentReceiptUploadedAt).toLocaleDateString() : 'N/A'}

===============================================================================
RECEIPT INFORMATION
===============================================================================
This receipt confirms that the payment has been verified and processed.
The student's payment receipt has been reviewed and approved by the Revenue Office.

Receipt Status: VERIFIED AND APPROVED
Issued By: ${data.issuedBy}
Issue Date: ${data.issuedDate}

===============================================================================
IMPORTANT NOTES
===============================================================================
- This formal receipt serves as official proof of payment
- Please keep this receipt for your records
- For any inquiries, contact the Revenue Office
- This receipt can be used for document collection

===============================================================================
CONTACT INFORMATION
===============================================================================
Revenue Office, Bule Hora University
Email: revenue@bulehorauniversity.edu.et
Phone: +251 XXX XXX XXX

This is an electronically generated receipt and is valid without signature.
  `.trim();
}
