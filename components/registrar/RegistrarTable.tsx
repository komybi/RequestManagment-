'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Bell, 
  Send,
  Users,
  AlertTriangle,
  Package,
  CreditCard
} from 'lucide-react';

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
  program?: string;
  phoneNumber?: string;
  academicYear?: string;
  costShareStatus?: string;
  clearanceStatus?: string;
  uploadedForm?: string;
  paymentProof?: string;
  registrarNotes?: string;
  deliveryDate?: string;
  reason?: string;
  replacementType?: string;
  amount?: number;
  paymentMethod?: string;
}

export default function RegistrarTable() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'>('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const response = await fetch('/api/requests?role=registrar');
      if (response.ok) {
        const data = await response.json();
        
        // Filter only student requests
        const studentRequests = data.filter((req: Request) => 
          req.studentId && req.studentId.email && req.studentId.email.includes('@')
        );
        
        setRequests(studentRequests);
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
        // Send email notification to student
        await sendStudentEmail(selectedRequest, 'approved');
        
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
        // Send email notification to student
        await sendStudentEmail(selectedRequest, 'rejected');
        
        fetchRequests();
        setSelectedRequest(null);
        setNotes('');
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  }

  async function sendStudentEmail(request: Request, action: 'approved' | 'rejected') {
    try {
      let message = '';
      
      if (action === 'approved') {
        if (request.requestType === 'ID_REPLACEMENT') {
          message = `ID Replacement: Your new ID will be delivered on ${request.deliveryDate}`;
        } else {
          message = `Document Request: Your request is currently being processed`;
        }
      } else {
        message = `Your ${request.requestType.toLowerCase()} request has been ${action}. Reason: ${request.registrarNotes || 'No reason provided'}`;
      }
      
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: request.studentId?._id,
          message,
          requestId: request._id,
        }),
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.status === filter);

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Student Request Management
          </CardTitle>
          <CardDescription>
            Review and manage student document and ID replacement requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Button 
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All Requests ({requests.length})
            </Button>
            <Button 
              onClick={() => setFilter('PENDING')}
              variant={filter === 'PENDING' ? 'default' : 'outline'}
              size="sm"
            >
              Pending ({requests.filter(r => r.status === 'PENDING').length})
            </Button>
            <Button 
              onClick={() => setFilter('APPROVED')}
              variant={filter === 'APPROVED' ? 'default' : 'outline'}
              size="sm"
            >
              Approved ({requests.filter(r => r.status === 'APPROVED').length})
            </Button>
            <Button 
              onClick={() => setFilter('REJECTED')}
              variant={filter === 'REJECTED' ? 'default' : 'outline'}
              size="sm"
            >
              Rejected ({requests.filter(r => r.status === 'REJECTED').length})
            </Button>
          </div>

          {/* Common Tasks */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Common Tasks</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button variant="outline" className="justify-start">
                <Send className="w-4 h-4 mr-2" />
                Send Bulk Notifications
              </Button>
              <Button variant="outline" className="justify-start">
                <Package className="w-4 h-4 mr-2" />
                Generate Reports
              </Button>
              <Button variant="outline" className="justify-start">
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Payments
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Requests</CardTitle>
          <CardDescription>
            {filter === 'all' 
              ? 'All student requests' 
              : `${filter.charAt(0).toUpperCase() + filter.slice(1)} student requests`
            } - {filteredRequests.length} items
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No {filter === 'all' ? 'student' : filter} requests found</p>
              <p className="text-sm text-gray-500">
                {filter === 'all' 
                  ? 'Student requests will appear here once submitted'
                  : `No ${filter} requests at this time`
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Request Type</th>
                    <th className="px-4 py-3 text-left">Document Type</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{request.studentId?.name ?? 'N/A'}</p>
                          <p className="text-xs text-gray-500">{request.studentId?.email ?? 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={request.status === 'PENDING' ? 'secondary' : 'default'}>
                          {request.requestType === 'ID_REPLACEMENT' ? 'ID Replacement' : 'Document'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{request.documentType || 'N/A'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">
                          {request.paymentFile ? (
                            <a 
                              href={request.paymentFile} 
                              target="_blank" 
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              View Receipt
                            </a>
                          ) : (
                            <span className="text-gray-500">Not uploaded</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                            disabled={request.status !== 'PENDING'}
                          >
                            Review
                          </Button>
                          {request.status === 'APPROVED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/api/requests/${request._id}/download`, '_blank')}
                            >
                              Download
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Student Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Student Information */}
              <div>
                <h4 className="font-semibold mb-3">Student Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.studentId?.name ?? 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Student ID</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.studentId?.studentId ?? 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.studentId?.email ?? 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Department</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.department || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Program</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.program || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div>
                <h4 className="font-semibold mb-3">Request Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Request Type</label>
                    <p className="p-2 bg-muted rounded">
                      {selectedRequest.requestType === 'ID_REPLACEMENT' ? 'ID Replacement' : 'Document Request'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Document Type</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.documentType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedRequest.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Proof</label>
                    {selectedRequest.paymentFile ? (
                      <a 
                        href={selectedRequest.paymentFile} 
                        target="_blank" 
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        View Receipt
                      </a>
                    ) : (
                      <span className="text-gray-500 text-sm">Not uploaded</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Request Date</label>
                    <p className="p-2 bg-muted rounded">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Action Section */}
              {selectedRequest.status === 'PENDING' && (
                <div>
                  <h4 className="font-semibold mb-3">Take Action</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Delivery Date (for approved requests)</label>
                      <Input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        placeholder="Enter delivery date"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Registrar Notes</label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter notes or reason for decision"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleApprove} disabled={!deliveryDate}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button variant="destructive" onClick={handleReject}>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Message */}
              {selectedRequest.status === 'APPROVED' && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Request Approved</h4>
                  <p className="text-green-700">
                    {selectedRequest.requestType === 'ID_REPLACEMENT' 
                      ? `Student's ID replacement request has been approved. New ID will be delivered on ${selectedRequest.deliveryDate}.`
                      : 'Student document request has been approved and is being processed.'
                    }
                  </p>
                </div>
              )}

              {selectedRequest.status === 'REJECTED' && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Request Rejected</h4>
                  <p className="text-red-700">
                    Reason: {selectedRequest.registrarNotes || 'No reason provided'}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
