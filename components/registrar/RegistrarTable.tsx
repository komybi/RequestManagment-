'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Request {
  _id: string;
  studentId: { _id: string; name: string; email: string; studentId?: string };
  requestType: string;
  documentType?: string;
  status: string;
  deliveryMethod: string;
  createdAt: string;
  paymentFile?: string;
  department?: string;
  costShareStatus?: string;
  clearanceStatus?: string;
  uploadedForm?: string;
  paymentProof?: string;
  registrarNotes?: string;
  deliveryDate?: string;
}

export default function RegistrarTable() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const response = await fetch('/api/requests?status=PENDING,PROCESSING');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/requests/${selectedRequest._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          deliveryDate,
          registrarNotes: notes,
        }),
      });

      if (response.ok) {
        // Send notification to student
        await sendStudentNotification(selectedRequest, 'approved');
        
        // If document request, send to revenue office
        if (selectedRequest.requestType === 'DOCUMENT') {
          await sendToRevenueOffice(selectedRequest);
        }
        
        fetchRequests();
        setSelectedRequest(null);
        setDeliveryDate('');
        setNotes('');
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  }

  async function handleReject() {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/requests/${selectedRequest._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          registrarNotes: notes,
        }),
      });

      if (response.ok) {
        // Send notification to student
        await sendStudentNotification(selectedRequest, 'rejected');
        
        fetchRequests();
        setSelectedRequest(null);
        setNotes('');
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  }

  async function sendStudentNotification(request: Request, action: 'approved' | 'rejected') {
    try {
      const message = action === 'approved' 
        ? `Your ${request.requestType.toLowerCase()} request has been ${action}. ${request.requestType === 'ID_REPLACEMENT' ? `Your new ID card will be delivered on ${request.deliveryDate}.` : 'Your request is currently under review.'}`
        : `Your ${request.requestType.toLowerCase()} request has been ${action}. Reason: ${request.registrarNotes || 'No reason provided'}`;
      
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: request.studentId._id,
          message,
          requestId: request._id,
        }),
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  async function sendToRevenueOffice(request: Request) {
    try {
      await fetch('/api/revenue/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request._id,
          studentName: request.studentId.name,
          studentId: request.studentId.studentId,
          requestType: request.requestType,
          documentType: request.documentType,
          paymentProof: request.paymentProof,
        }),
      });
    } catch (error) {
      console.error('Failed to send to revenue office:', error);
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading requests...</div>;
  }

  if (requests.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No pending requests</div>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Student Name</th>
              <th className="px-4 py-2 text-left">Student ID</th>
              <th className="px-4 py-2 text-left">Department</th>
              <th className="px-4 py-2 text-left">Request Type</th>
              <th className="px-4 py-2 text-left">Document Type</th>
              <th className="px-4 py-2 text-left">Payment Proof</th>
              <th className="px-4 py-2 text-left">Cost Share Status</th>
              <th className="px-4 py-2 text-left">Clearance Status</th>
              <th className="px-4 py-2 text-left">Request Date</th>
              <th className="px-4 py-2 text-left">Current Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id} className="border-t">
                <td className="px-4 py-3">
                  <p className="font-medium">{request.studentId.name}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm">{request.studentId.studentId || 'N/A'}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm">{request.department || 'N/A'}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">
                    {request.requestType}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">
                    {request.documentType || 'N/A'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {request.paymentProof ? (
                    <Button variant="outline" size="sm">
                      View Receipt
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not uploaded</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={request.costShareStatus === 'VERIFIED' ? 'default' : 'secondary'}>
                    {request.costShareStatus || 'N/A'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={request.clearanceStatus === 'COMPLETE' ? 'default' : 'secondary'}>
                    {request.clearanceStatus || 'N/A'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                  >
                    Review
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Verify Student Request</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Student Information */}
              <div>
                <h4 className="font-semibold mb-3">Student Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.studentId.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Student ID</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.studentId.studentId || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div>
                <h4 className="font-semibold mb-3">Request Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Request Type</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.requestType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Document Type</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.documentType || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <h4 className="font-semibold mb-3">Verification Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Cost Share Status</label>
                    <Badge variant={selectedRequest.costShareStatus === 'VERIFIED' ? 'default' : 'secondary'}>
                      {selectedRequest.costShareStatus || 'NOT APPLICABLE'}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Clearance Status</label>
                    <Badge variant={selectedRequest.clearanceStatus === 'COMPLETE' ? 'default' : 'secondary'}>
                      {selectedRequest.clearanceStatus || 'NOT APPLICABLE'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Payment Verification */}
              <div>
                <h4 className="font-semibold mb-3">Payment Verification</h4>
                {selectedRequest.paymentProof ? (
                  <Button variant="outline" className="w-full">
                    View Payment Proof
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">No payment proof uploaded</p>
                )}
              </div>

              {/* Requirements Check */}
              <div>
                <h4 className="font-semibold mb-3">Requirements Check</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Student Information:</span>
                    <Badge variant="outline">✓ Complete</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Uploaded Request Form:</span>
                    <Badge variant={selectedRequest.uploadedForm ? 'default' : 'destructive'}>
                      {selectedRequest.uploadedForm ? '✓ Uploaded' : '✗ Missing'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Payment Proof:</span>
                    <Badge variant={selectedRequest.paymentProof ? 'default' : 'destructive'}>
                      {selectedRequest.paymentProof ? '✓ Uploaded' : '✗ Missing'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Cost Sharing Balance:</span>
                    <Badge variant={selectedRequest.costShareStatus === 'VERIFIED' ? 'default' : 'destructive'}>
                      {selectedRequest.costShareStatus === 'VERIFIED' ? '✓ Cleared' : '✗ Outstanding'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Clearance Status:</span>
                    <Badge variant={selectedRequest.clearanceStatus === 'COMPLETE' ? 'default' : 'destructive'}>
                      {selectedRequest.clearanceStatus === 'COMPLETE' ? '✓ Complete' : '✗ Incomplete'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="font-semibold mb-3">Registrar Actions</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Delivery Date</label>
                    <Input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Comments</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add comments or request additional information..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleApprove} className="flex-1">
                      Approve Request
                    </Button>
                    <Button
                      onClick={handleReject}
                      variant="destructive"
                      className="flex-1"
                    >
                      Reject Request
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800';
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
