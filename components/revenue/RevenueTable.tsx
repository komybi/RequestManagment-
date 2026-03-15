'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Request {
  _id: string;
  studentId: { _id: string; name: string; email: string };
  requestType: string;
  documentType?: string;
  paymentVerified: boolean;
  deliveryMethod: string;
  createdAt: string;
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
      const response = await fetch('/api/requests?status=APPROVED');
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
        fetchRequests();
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Failed to verify payment:', error);
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
              <th className="px-4 py-2 text-left">Student</th>
              <th className="px-4 py-2 text-left">Request</th>
              <th className="px-4 py-2 text-left">Payment Status</th>
              <th className="px-4 py-2 text-left">Delivery</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id} className="border-t">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{request.studentId.name}</p>
                    <p className="text-sm text-muted-foreground">{request.studentId.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">
                    {request.documentType || request.requestType}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={request.paymentVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {request.paymentVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </td>
                <td className="px-4 py-3">{request.deliveryMethod}</td>
                <td className="px-4 py-3 text-sm">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                    disabled={request.paymentVerified}
                  >
                    {request.paymentVerified ? 'Verified' : 'Review'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Verify Payment</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Student: {selectedRequest.studentId.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedRequest.studentId.email}</p>
              </div>

              <div className="bg-muted p-4 rounded">
                <p className="text-sm text-muted-foreground">Request Type</p>
                <p className="font-medium">{selectedRequest.documentType || selectedRequest.requestType}</p>
              </div>

              <div className="bg-muted p-4 rounded">
                <p className="text-sm text-muted-foreground">Delivery Method</p>
                <p className="font-medium">{selectedRequest.deliveryMethod}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleVerifyPayment}
                  className="flex-1"
                >
                  Verify & Generate Receipt
                </Button>
                <Button
                  onClick={() => setSelectedRequest(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
