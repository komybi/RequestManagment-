'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

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
  revenueLetterId?: string;
  revenueLetterContent?: string;
  revenueLetterSentAt?: string;
  sentToRevenueAt?: string;
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
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-lg">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Student Name</th>
              <th className="px-6 py-4 text-left font-semibold">Student ID</th>
              <th className="px-6 py-4 text-left font-semibold">Request Type</th>
              <th className="px-6 py-4 text-left font-semibold">Document Type</th>
              <th className="px-6 py-4 text-left font-semibold">Payment Status</th>
              <th className="px-6 py-4 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((request, index) => (
              <tr key={request._id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-xs">{request.studentId.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{request.studentId.name}</p>
                      <p className="text-xs text-gray-500">{request.studentId.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">{request.studentId.studentId || 'N/A'}</p>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {request.requestType}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {request.documentType || 'N/A'}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge className={`${
                    request.paymentStatus === 'VERIFIED' ? 'bg-green-100 text-green-800 border-green-200' :
                    request.paymentStatus === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }`}>
                    {request.paymentStatus || 'PENDING'}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                    disabled={request.paymentStatus === 'VERIFIED'}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 hover:border-purple-300"
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg p-6">
              <DialogTitle className="text-2xl font-bold">Payment Verification</DialogTitle>
            </DialogHeader>

            <div className="space-y-8 p-6">
              {/* Student Information */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold">S</span>
                  </div>
                  Student Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Full Name</label>
                    <p className="text-base font-medium text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">{selectedRequest.studentId.name}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Student ID</label>
                    <p className="text-base font-medium text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">{selectedRequest.studentId.studentId || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold">R</span>
                  </div>
                  Request Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Request Type</label>
                    <p className="text-base font-medium text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">{selectedRequest.requestType}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Document Type</label>
                    <p className="text-base font-medium text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">{selectedRequest.documentType || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold">P</span>
                  </div>
                  Current Payment Status
                </h4>
                <div className="flex items-center justify-center">
                  <Badge className={`text-lg px-6 py-3 font-semibold ${
                    selectedRequest.paymentStatus === 'VERIFIED' ? 'bg-green-100 text-green-800 border-green-300' :
                    selectedRequest.paymentStatus === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-300' :
                    'bg-yellow-100 text-yellow-800 border-yellow-300'
                  }`}>
                    {selectedRequest.paymentStatus || 'PENDING'}
                  </Badge>
                </div>
              </div>

              {/* Generated Letter */}
              {selectedRequest.revenueLetterContent && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold">L</span>
                    </div>
                    Generated Letter (Sent to Student)
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-semibold text-gray-700">Letter Content</label>
                        <div className="text-xs text-gray-500">
                          ID: {selectedRequest.revenueLetterId} | 
                          Sent: {selectedRequest.revenueLetterSentAt ? new Date(selectedRequest.revenueLetterSentAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-60 overflow-y-auto">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                          {selectedRequest.revenueLetterContent}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Revenue Actions */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                <h4 className="font-bold text-lg mb-6 text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold">A</span>
                  </div>
                  Revenue Actions
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      onClick={handleVerifyPayment}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                      disabled={selectedRequest.paymentStatus === 'VERIFIED'}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approve Payment
                    </Button>
                    <Button
                      onClick={handleRejectPayment}
                      variant="destructive"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3"
                      disabled={selectedRequest.paymentStatus === 'VERIFIED'}
                    >
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Reject Payment
                    </Button>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRequest(null)}
                      className="flex-1 border-gray-300 hover:bg-gray-50 font-semibold py-3"
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
