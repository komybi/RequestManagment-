import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Request from '@/lib/models/Request';
import IDReplacementRequest from '@/lib/models/IDReplacementRequest';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    // Find the request in either model
    let requestDoc = await Request.findById(id).populate('studentId');
    if (!requestDoc) {
      requestDoc = await IDReplacementRequest.findById(id).populate('studentId');
    }

    if (!requestDoc) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check if user has permission (registrar, admin, or the request owner)
    const role = session.user?.role;
    const userId = session.user?.id;
    
    if (role !== 'registrar' && role !== 'admin' && requestDoc.studentId?._id.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the file path from the request
    let filePath = '';
    let fileName = '';

    if (requestDoc.paymentFile) {
      filePath = requestDoc.paymentFile;
      fileName = `payment-receipt-${requestDoc.studentId?.studentId || requestDoc._id}.pdf`;
    } else if (requestDoc.receiptPath) {
      filePath = requestDoc.receiptPath;
      fileName = `receipt-${requestDoc.studentId?.studentId || requestDoc._id}.pdf`;
    } else {
      return NextResponse.json({ error: 'No file available for download' }, { status: 404 });
    }

    // Handle different file path formats
    let fullPath = filePath;
    
    // If it's a relative path, convert to absolute
    if (!filePath.startsWith('/')) {
      fullPath = path.join(process.cwd(), 'public', filePath);
    } else if (filePath.startsWith('/uploads/')) {
      fullPath = path.join(process.cwd(), 'public', filePath);
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.error('File not found:', fullPath);
      return NextResponse.json({ error: 'File not found on server' }, { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(fullPath);
    
    // Determine content type based on file extension
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.doc':
      case '.docx':
        contentType = 'application/msword';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    // Create response with proper headers for download
    const response = new NextResponse(fileBuffer);
    
    // Set headers to force download
    response.headers.set('Content-Type', contentType);
    response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    response.headers.set('Content-Length', fileBuffer.length.toString());
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    console.log(`File downloaded: ${fileName} for user ${session.user?.email}`);
    
    return response;

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
