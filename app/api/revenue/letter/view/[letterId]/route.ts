import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';

export async function GET(
  request: NextRequest,
  { params }: { params: { letterId: string } }
) {
  try {
    const session = await auth();
    if (!session || (session.user?.role !== 'registrar' && session.user?.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find the request with this letter ID
    const requestData = await Request.findOne({ 
      revenueLetterId: params.letterId 
    });

    if (!requestData) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    // Return the letter content as HTML for display
    const letterContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; color: #333; }
        .header p { margin: 5px 0; color: #666; }
        .content { margin: 20px 0; }
        .student-info { background: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
        .request-details { margin: 20px 0; }
        .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
        .signature { margin-top: 30px; }
        .urgent { color: #dc3545; font-weight: bold; }
        .normal { color: #28a745; }
        .status-badge { 
          display: inline-block; 
          padding: 4px 8px; 
          border-radius: 4px; 
          font-size: 12px; 
          font-weight: bold;
          margin: 5px 0;
        }
        .generated { background: #28a745; color: white; }
        .sent { background: #007bff; color: white; }
    </style>
</head>
<body>
    <div class="header">
        <h1>UNIVERSITY DOCUMENT REQUEST</h1>
        <p>Revenue Office Processing Letter</p>
        <p>Reference: ${requestData.revenueLetterId}</p>
        <p>Generated: ${new Date(requestData.sentToRevenueAt).toLocaleDateString()}</p>
    </div>

    <div class="content">
        <h2>Student Information</h2>
        <div class="student-info">
            <p><strong>Student Name:</strong> ${requestData.studentId?.name}</p>
            <p><strong>Student ID:</strong> ${requestData.studentId?.studentId}</p>
            <p><strong>Department:</strong> ${requestData.department}</p>
            <p><strong>Program:</strong> ${requestData.program}</p>
            <p><strong>Academic Year:</strong> ${requestData.academicYear}</p>
        </div>

        <h2>Document Request Details</h2>
        <div class="request-details">
            <p><strong>Document Type:</strong> ${requestData.documentType}</p>
            <p><strong>Request Date:</strong> ${new Date(requestData.createdAt).toLocaleDateString()}</p>
            <p><strong>Purpose:</strong> ${(requestData as any)?.purpose || 'Official Document Request'}</p>
            <p><strong>Delivery Method:</strong> ${requestData.deliveryMethod}</p>
            ${requestData.deliveryDate ? `<p><strong>Requested Delivery Date:</strong> ${new Date(requestData.deliveryDate).toLocaleDateString()}</p>` : ''}
        </div>

        <h2>Processing Status</h2>
        <div class="request-details">
            <p><strong>Current Status:</strong> 
                <span class="status-badge ${requestData.status === 'REVENUE_REVIEW' ? 'sent' : 'pending'}">
                    ${requestData.status === 'REVENUE_REVIEW' ? 'SENT TO REVENUE' : 'PENDING'}
                </span>
            </p>
            <p><strong>Sent to Revenue:</strong> 
                <span class="status-badge ${requestData.sentToRevenueAt ? 'sent' : 'pending'}">
                    ${requestData.sentToRevenueAt ? new Date(requestData.sentToRevenueAt).toLocaleDateString() : 'NOT SENT'}
                </span>
            </p>
        </div>
    </div>

    <div class="footer">
        <p><strong>Processing Instructions:</strong></p>
        <ul>
            <li>Review attached request details for completeness</li>
            <li>Verify payment status and requirements</li>
            <li>Generate official receipt upon payment confirmation</li>
            <li>Update system with processing status</li>
        </ul>
    </div>

    <div class="signature">
        <p>_________________________</p>
        <p><strong>Registrar Office</strong></p>
        <p>University Administration</p>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>
    `;

    return new NextResponse(letterContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Failed to view letter:', error);
    return NextResponse.json({ error: 'Failed to load letter' }, { status: 500 });
  }
}
