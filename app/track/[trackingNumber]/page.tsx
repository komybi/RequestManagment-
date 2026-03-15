import dbConnect from '@/lib/db';
import DocumentRequest from '@/lib/models/DocumentRequest';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export async function generateMetadata({
  params,
}: {
  params: { trackingNumber: string };
}) {
  return {
    title: `Track Document - ${params.trackingNumber}`,
  };
}

export default async function TrackingPage({
  params,
}: {
  params: { trackingNumber: string };
}) {
  await dbConnect();
  const document = await DocumentRequest.findOne({
    trackingNumber: params.trackingNumber,
  });

  if (!document) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Document not found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Tracking number: {params.trackingNumber}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Your document request has been approved. You can now download it.';
      case 'rejected':
        return 'Your document request has been rejected.';
      case 'completed':
        return 'Your document request is complete.';
      default:
        return 'Your document request is pending review.';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Document Tracking</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="capitalize">{document.documentType}</CardTitle>
                <CardDescription>
                  Tracking Number: {document.trackingNumber}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(document.status)}>
                {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">{getStatusMessage(document.status)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Student Name</label>
                <p className="text-lg font-semibold">{document.studentName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Submitted Date
                </label>
                <p className="text-lg font-semibold">
                  {new Date(document.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-sm mt-1">{document.description}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Purpose</label>
              <p className="text-sm mt-1">{document.purpose}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Quantity</label>
              <p className="text-sm mt-1">{document.quantity}</p>
            </div>

            {document.rejectionReason && (
              <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                <label className="text-sm font-medium text-destructive">Rejection Reason</label>
                <p className="text-sm text-destructive/90 mt-1">{document.rejectionReason}</p>
              </div>
            )}

            {document.approvedAt && (
              <div className="text-sm text-muted-foreground">
                <strong>Approved Date:</strong>{' '}
                {new Date(document.approvedAt).toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
