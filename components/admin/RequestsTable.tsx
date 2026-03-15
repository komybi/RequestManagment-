'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DocumentRequest {
  _id: string;
  studentName: string;
  documentType: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  trackingNumber: string;
  createdAt: string;
}

export default function RequestsTable() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const response = await fetch('/api/documents');
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

  async function handleStatusChange(id: string, status: string) {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          rejectionReason: status === 'rejected' ? rejectionReason : undefined,
        }),
      });

      if (response.ok) {
        // Send email notification
        await sendEmailNotification(id);
        fetchRequests();
        setSelectedRequest(null);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Failed to update request:', error);
    }
  }

  async function sendEmailNotification(id: string) {
    try {
      await fetch(`/api/documents/${id}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Student</th>
              <th className="px-4 py-2 text-left font-semibold">Document</th>
              <th className="px-4 py-2 text-left font-semibold">Purpose</th>
              <th className="px-4 py-2 text-left font-semibold">Tracking #</th>
              <th className="px-4 py-2 text-left font-semibold">Status</th>
              <th className="px-4 py-2 text-left font-semibold">Date</th>
              <th className="px-4 py-2 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-2">{request.studentName}</td>
                <td className="px-4 py-2 capitalize">{request.documentType}</td>
                <td className="px-4 py-2 text-sm text-muted-foreground">
                  {request.purpose.substring(0, 30)}...
                </td>
                <td className="px-4 py-2 text-sm">{request.trackingNumber}</td>
                <td className="px-4 py-2">
                  <Badge className={getStatusColor(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-sm">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  {request.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRequest(request)}
                    >
                      Review
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Request</DialogTitle>
              <DialogDescription>
                {selectedRequest.studentName} - {selectedRequest.documentType}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Purpose</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedRequest.purpose}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Decision</label>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => handleStatusChange(selectedRequest._id, 'approved')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => setRejectionReason('Enter reason...')}
                    variant="outline"
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
              </div>

              {rejectionReason && (
                <div>
                  <label className="text-sm font-medium">Rejection Reason</label>
                  <Textarea
                    placeholder="Enter rejection reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1"
                  />
                  <Button
                    onClick={() => handleStatusChange(selectedRequest._id, 'rejected')}
                    variant="destructive"
                    className="w-full mt-2"
                  >
                    Confirm Rejection
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
