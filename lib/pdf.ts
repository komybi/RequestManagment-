import jsPDF from 'jspdf';

export function generateDocumentPDF(
  studentName: string,
  documentType: string,
  trackingNumber: string,
  approvalDate: Date,
  documentContent: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.text('Official Document', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;

  // Student info
  doc.setFontSize(12);
  doc.text(`Student Name: ${studentName}`, 20, yPosition);
  yPosition += 10;

  doc.text(`Document Type: ${documentType}`, 20, yPosition);
  yPosition += 10;

  doc.text(`Tracking Number: ${trackingNumber}`, 20, yPosition);
  yPosition += 10;

  doc.text(
    `Date Approved: ${approvalDate.toLocaleDateString()}`,
    20,
    yPosition
  );
  yPosition += 15;

  // Content
  doc.setFontSize(11);
  const splitContent = doc.splitTextToSize(documentContent, pageWidth - 40);
  doc.text(splitContent, 20, yPosition);

  return doc.output();
}
