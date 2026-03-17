'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DocumentDetail from './DocumentDetail';

interface DocumentRequest {
  _id: string;
  requestType: string;
  documentType: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  trackingNumber: string;
  createdAt: string;
  rejectionReason?: string;
  department?: string;
  program?: string;
  phoneNumber?: string;
  academicYear?: string;
  studentId?: {
    _id: string;
    name: string;
    email: string;
    studentId?: string;
  };
}

export default function RequestsList() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch('/api/requests');
        if (response.ok) {
          const data = await response.json();
          // Filter only document requests for current student
          const documentRequests = data.filter((req: DocumentRequest) => 
            req.requestType === 'DOCUMENT'
          );
          setRequests(documentRequests);
        }
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

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

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRequests(requests.filter((r) => r._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete request:', error);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No document requests yet. Create one to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="capitalize">{request.documentType}</CardTitle>
                  <CardDescription>
                    Tracking: {request.trackingNumber}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(request.status)}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{request.description}</p>
              
              {/* Display additional student information */}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">Department:</span> {request.department || (request.studentId as any)?.department || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Program:</span> {request.program || (request.studentId as any)?.program || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Academic Year:</span> {request.academicYear || (request.studentId as any)?.year || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {request.phoneNumber || (request.studentId as any)?.phoneNumber || 'N/A'}
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Submitted: {new Date(request.createdAt).toLocaleDateString()}
              </p>
              {request.rejectionReason && (
                <div className="bg-destructive/10 p-3 rounded text-sm text-destructive">
                  <strong>Rejection Reason:</strong> {request.rejectionReason}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedId(request._id)}
                >
                  View Details
                </Button>
                {request.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(request._id)}
                  >
                    Cancel Request
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedId && (
        <DocumentDetail
          id={selectedId}
          open={!!selectedId}
          onOpenChange={(open) => !open && setSelectedId(null)}
        />
      )}
    </>
  );
}
