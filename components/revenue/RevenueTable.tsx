'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Request {
  _id: string;
  studentId: { _id: string; name: string; email: string; studentId?: string };
  requestType: string;
  documentType?: string;
  paymentVerified: boolean;
  deliveryMethod: string;
  createdAt: string;
  paymentProof?: string;
  registrarRequestLetter?: string;
  revenueNumber?: string;
  bankTransaction?: string;
  receiptFile?: string;
  paymentStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export default function RevenueTable() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const response = await fetch('/api/requests?status=REVENUE_REVIEW');
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

  async function handleVerifyPayment() {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/revenue/verify/${selectedRequest._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // Generate official receipt
        await generateReceipt(selectedRequest);
        
        // Send receipt back to registrar
        await sendReceiptToRegistrar(selectedRequest);
        
        fetchRequests();
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Failed to verify payment:', error);
    }
  }

  async function handleRejectPayment() {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/revenue/reject/${selectedRequest._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // Request new payment proof from student
        await requestNewPaymentProof(selectedRequest);
        
        fetchRequests();
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Failed to reject payment:', error);
    }
  }

  async function generateReceipt(request: Request) {
    try {
      await fetch('/api/revenue/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request._id,
          studentId: request.studentId.studentId,
          studentName: request.studentId.name,
          paymentAmount: '50.00', // This would come from the actual request
          transactionDate: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to generate receipt:', error);
    }
  }

  async function sendReceiptToRegistrar(request: Request) {
    try {
      await fetch('/api/registrar/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request._id,
          receiptFile: request.receiptFile,
          paymentConfirmation: true,
        }),
      });
    } catch (error) {
      console.error('Failed to send receipt to registrar:', error);
    }
  }

  async function requestNewPaymentProof(request: Request) {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: request.studentId._id,
          message: 'Please upload your payment receipt to continue processing your request.',
          requestId: request._id,
        }),
      });
    } catch (error) {
      console.error('Failed to request payment proof:', error);
    }
  }

function getPaymentStatusColor(status?: string) {
  switch (status) {
    case 'VERIFIED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'PENDING':
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
}

  if (loading) {
    return <div className="text-center py-4">Loading requests...</div>;
  }

  if (requests.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No approved requests</div>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">Student Name</th>
              <th className="px-4 py-2 text-left">Student ID</th>
              <th className="px-4 py-2 text-left">Request Type</th>
              <th className="px-4 py-2 text-left">Document Type</th>
              <th className="px-4 py-2 text-left">Registrar Request Letter</th>
              <th className="px-4 py-2 text-left">Payment Proof</th>
              <th className="px-4 py-2 text-left">Revenue Number</th>
              <th className="px-4 py-2 text-left">Bank Transaction</th>
              <th className="px-4 py-2 text-left">Payment Status</th>
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
                  {request.registrarRequestLetter ? (
                    <Button variant="outline" size="sm">
                      View Letter
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not received</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {request.paymentProof ? (
                    <Button variant="outline" size="sm">
                      View Proof
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not uploaded</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm">{request.revenueNumber || 'N/A'}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm">{request.bankTransaction || 'N/A'}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge className={getPaymentStatusColor(request.paymentStatus)}>
                    {request.paymentStatus || 'PENDING'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                    disabled={request.paymentStatus === 'VERIFIED'}
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
              <DialogTitle>Payment Verification</DialogTitle>
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

              {/* Payment Verification */}
              <div>
                <h4 className="font-semibold mb-3">Payment Verification</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Registrar Request Letter</label>
                    {selectedRequest.registrarRequestLetter ? (
                      <Button variant="outline" className="w-full">
                        View Letter
                      </Button>
                    ) : (
                      <p className="p-2 bg-muted rounded">Not received</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Proof</label>
                    {selectedRequest.paymentProof ? (
                      <Button variant="outline" className="w-full">
                        View Proof
                      </Button>
                    ) : (
                      <p className="p-2 bg-muted rounded">Not uploaded</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Revenue Number</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.revenueNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bank Transaction</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.bankTransaction || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <h4 className="font-semibold mb-3">Current Payment Status</h4>
                <div className="flex items-center gap-2">
                  <Badge className={getPaymentStatusColor(selectedRequest.paymentStatus)}>
                    {selectedRequest.paymentStatus || 'PENDING'}
                  </Badge>
                </div>
              </div>

              {/* Revenue Actions */}
              <div>
                <h4 className="font-semibold mb-3">Revenue Actions</h4>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={handleVerifyPayment}
                      className="flex-1"
                      disabled={selectedRequest.paymentStatus === 'VERIFIED'}
                    >
                      Approve Payment
                    </Button>
                    <Button
                      onClick={handleRejectPayment}
                      variant="destructive"
                      className="flex-1"
                      disabled={selectedRequest.paymentStatus === 'VERIFIED'}
                    >
                      Reject Payment
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRequest(null)}
                      className="flex-1"
                    >
                      Cancel
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
