'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Request {
  _id: string;
  studentId: { _id: string; name: string; email: string };
  requestType: string;
  documentType?: string;
  status: string;
  deliveryMethod: string;
  createdAt: string;
  paymentFile?: string;
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
        fetchRequests();
        setSelectedRequest(null);
        setNotes('');
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
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
              <th className="px-4 py-2 text-left">Student</th>
              <th className="px-4 py-2 text-left">Request Type</th>
              <th className="px-4 py-2 text-left">Status</th>
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
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Review Request</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Student: {selectedRequest.studentId.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedRequest.studentId.email}</p>
              </div>

              {selectedRequest.paymentFile && (
                <Button variant="outline" className="w-full">
                  View Payment
                </Button>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Delivery Date</label>
                <Input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleApprove} className="flex-1">
                  Approve
                </Button>
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  className="flex-1"
                >
                  Reject
                </Button>
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
