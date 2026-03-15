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
  Send,
  Users,
  AlertTriangle,
  Package,
  CreditCard,
  Calendar
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
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'REVENUE_REVIEW'>('all');
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  async function handleNotifyStudent(messageType?: 'id-delivered' | 'under-review') {
    if (!selectedRequest) return;

    try {
      let message = '';
      
      if (messageType === 'id-delivered' || selectedRequest.requestType === 'ID_REPLACEMENT') {
        message = `ID Replacement: Your new ID will be delivered on ${deliveryDate}`;
      } else if (messageType === 'under-review' || selectedRequest.requestType === 'DOCUMENT') {
        message = `Document Request: Your request is currently under review`;
      } else {
        // Default message
        message = `Your request has been received and is being processed`;
      }
      
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedRequest.studentId?._id,
          message,
          requestId: selectedRequest._id,
          messageType: messageType || (selectedRequest.requestType === 'ID_REPLACEMENT' ? 'id-delivered' : 'under-review')
        }),
      });

      // Show success message
      alert('Email sent to student successfully!');
      
      // Close dialog after successful notification
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('Failed to send email. Please try again.');
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

  const handleReviewClick = (request: Request) => {
    setSelectedRequest(request);
    // Small delay to ensure dialog is rendered before scrolling
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleGenerateRevenueLetter = async () => {
    if (!selectedRequest) return;

    try {
      // Generate formal letter for revenue office
      const letterData = {
        requestId: selectedRequest._id,
        studentId: selectedRequest.studentId?._id,
        studentName: selectedRequest.studentId?.name,
        studentIdNumber: selectedRequest.studentId?.studentId,
        documentType: selectedRequest.documentType,
        department: selectedRequest.department,
        program: selectedRequest.program,
        academicYear: selectedRequest.academicYear,
        requestDate: selectedRequest.createdAt,
        deliveryDate: deliveryDate || null,
        urgency: (selectedRequest as any).urgency || 'Normal',
        purpose: (selectedRequest as any).purpose || 'Official Document Request'
      };

      const response = await fetch('/api/revenue/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(letterData),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to generate revenue letter: ${error.error || 'Unknown error'}`);
        return;
      }

      const result = await response.json();
      
      // Update request to show it's sent to revenue
      await fetch(`/api/requests/${selectedRequest._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedRequest,
          status: 'REVENUE_REVIEW',
          deliveryDate: deliveryDate || null,
          sentToRevenueAt: new Date(),
          revenueLetterId: result.letterId
        }),
      });

      alert('Revenue letter generated successfully! Request sent to revenue office.');
      
      // Refresh requests to show updated status
      fetchRequests();
      
      // Close dialog
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to generate revenue letter:', error);
      alert('Failed to generate revenue letter. Please try again.');
    }
  };

  const handleDownload = async (request: Request) => {
    try {
      const response = await fetch(`/api/requests/${request._id}/download`);
      
      if (!response.ok) {
        const error = await response.json();
        alert(`Download failed: ${error.error || 'Unknown error'}`);
        return;
      }

      // Get the filename from the response headers or create a default one
      const contentDisposition = response.headers.get('content-disposition');
      let fileName = `document-${request._id}`;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log(`Downloaded file: ${fileName}`);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleCloseDialog = () => {
    setSelectedRequest(null);
    setDeliveryDate('');
    setNotes('');
    setShowDatePicker(false);
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.status === filter);

  return (
    <div className="space-y-6">
      {/* Clean Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Requests</h1>
            <p className="text-gray-600 mt-1">Review and manage student document and ID replacement requests</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
              {filteredRequests.length} requests
            </span>
          </div>
        </div>
        
        {/* Status Filter Tabs */}
        <div className="flex gap-2 mt-6 border-b">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              filter === 'all' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({requests.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              filter === 'PENDING' 
                ? 'border-yellow-500 text-yellow-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending ({requests.filter(r => r.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilter('REVENUE_REVIEW')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              filter === 'REVENUE_REVIEW' 
                ? 'border-purple-500 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Revenue Review ({requests.filter(r => r.status === 'REVENUE_REVIEW').length})
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              filter === 'APPROVED' 
                ? 'border-green-500 text-green-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Approved ({requests.filter(r => r.status === 'APPROVED').length})
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              filter === 'REJECTED' 
                ? 'border-red-500 text-red-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Rejected ({requests.filter(r => r.status === 'REJECTED').length})
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Student requests will appear here once submitted'
                : `No ${filter.toLowerCase()} requests at this time`
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">{request.studentId?.name ?? 'N/A'}</p>
                        <p className="text-sm text-gray-500">{request.studentId?.email ?? 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={request.status === 'PENDING' ? 'secondary' : 'default'}>
                        {request.requestType === 'ID_REPLACEMENT' ? 'ID Replacement' : 'Document'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.requestType === 'ID_REPLACEMENT' 
                        ? 'ID Replacement' 
                        : request.documentType || 'N/A'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReviewClick(request)}
                          disabled={request.status !== 'PENDING'}
                          variant={request.status !== 'PENDING' ? 'outline' : 'default'}
                        >
                          Review
                        </Button>
                        {request.status === 'APPROVED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(request)}
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
      </div>

      {/* Common Tasks - Moved Below */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Send Notifications</h4>
                <p className="text-sm text-gray-500">Notify students about their requests</p>
              </div>
            </div>
          </div>
          <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Generate Reports</h4>
                <p className="text-sm text-gray-500">Create monthly and annual reports</p>
              </div>
            </div>
          </div>
          <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Manage Payments</h4>
                <p className="text-sm text-gray-500">Track and verify payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200">
            <DialogHeader>
              <DialogTitle>Review Student Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pb-6">
              {/* Student Information */}
              <div>
                <h4 className="font-semibold mb-3">Student Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.phoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Department</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.department || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Program</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.program || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Academic Year</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.academicYear || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Request Details - What Student Filled */}
              <div>
                <h4 className="font-semibold mb-3">Request Details (Student Submission)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Request Type</label>
                    <p className="p-2 bg-muted rounded">
                      {selectedRequest.requestType === 'ID_REPLACEMENT' ? 'ID Replacement' : 'Document Request'}
                    </p>
                  </div>
                  {selectedRequest.documentType && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Document Type</label>
                      <p className="p-2 bg-muted rounded">{selectedRequest.documentType}</p>
                    </div>
                  )}
                  {selectedRequest.reason && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Reason for Request</label>
                      <p className="p-2 bg-muted rounded">{selectedRequest.reason}</p>
                    </div>
                  )}
                  {selectedRequest.replacementType && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Replacement Type</label>
                      <p className="p-2 bg-muted rounded">{selectedRequest.replacementType}</p>
                    </div>
                  )}
                  {selectedRequest.amount && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount Paid</label>
                      <p className="p-2 bg-muted rounded">${selectedRequest.amount}</p>
                    </div>
                  )}
                  {selectedRequest.paymentMethod && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment Method</label>
                      <p className="p-2 bg-muted rounded">{selectedRequest.paymentMethod}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1">Delivery Method</label>
                    <p className="p-2 bg-muted rounded">{selectedRequest.deliveryMethod}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Request Date</label>
                    <p className="p-2 bg-muted rounded">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
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
                </div>
              </div>

              {/* Action Section */}
              {selectedRequest.status === 'PENDING' && (
                <div>
                  <h4 className="font-semibold mb-3">Actions</h4>
                  
                  {selectedRequest.requestType === 'ID_REPLACEMENT' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Delivery Date</label>
                        <div className="flex gap-2">
                          <Input
                            id="delivery-date-input"
                            type="date"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            onClick={() => {
                              const input = document.getElementById('delivery-date-input') as HTMLInputElement;
                              if (input) {
                                try {
                                  input.showPicker();
                                } catch (e) {
                                  input.focus();
                                }
                              }
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => handleNotifyStudent('id-delivered')}
                          className="flex-1"
                          disabled={!deliveryDate}
                        >
                          Notify Student
                        </Button>
                        <Button 
                          onClick={() => handleApprove()}
                          variant="default"
                          className="flex-1"
                        >
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleReject()}
                          variant="destructive"
                          className="flex-1"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ) : selectedRequest.requestType === 'DOCUMENT' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Optional Delivery Date</label>
                        <div className="flex gap-2">
                          <Input
                            id="document-delivery-date"
                            type="date"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            onClick={() => {
                              const input = document.getElementById('document-delivery-date') as HTMLInputElement;
                              if (input) {
                                try {
                                  input.showPicker();
                                } catch (e) {
                                  input.focus();
                                }
                              }
                            }}
                            variant="outline"
                            size="sm"
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => handleNotifyStudent('under-review')}
                          className="flex-1"
                        >
                          Notify Student (Under Review)
                        </Button>
                        <Button 
                          onClick={() => handleGenerateRevenueLetter()}
                          variant="secondary"
                          className="flex-1"
                        >
                          Generate Revenue Letter
                        </Button>
                        <Button 
                          onClick={() => handleApprove()}
                          variant="default"
                          className="flex-1"
                        >
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleReject()}
                          variant="destructive"
                          className="flex-1"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleApprove()}
                        className="flex-1"
                      >
                        Approve
                      </Button>
                      <Button 
                        onClick={() => handleReject()}
                        variant="destructive"
                        className="flex-1"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Approved Status with Notify Button */}
              {selectedRequest.status === 'APPROVED' && (
                <div>
                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-green-800 mb-2">Request Approved</h4>
                    <p className="text-green-700">
                      {selectedRequest.requestType === 'ID_REPLACEMENT' 
                        ? `Student's ID replacement request has been approved. New ID will be delivered on ${selectedRequest.deliveryDate}.`
                        : 'Student document request has been approved and is being processed.'
                      }
                    </p>
                  </div>
                  
                  {/* Notify Button for ID Replacement */}
                  {selectedRequest.requestType === 'ID_REPLACEMENT' && (
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleNotifyStudent('id-delivered')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Notify Student
                      </Button>
                    </div>
                  )}
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
