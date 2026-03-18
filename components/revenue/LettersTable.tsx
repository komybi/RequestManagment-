'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Mail, Calendar, CreditCard, FileText, CheckCircle, AlertCircle, ExternalLink, Search, Send, Receipt } from 'lucide-react';

interface Letter {
  _id: string;
  revenueLetterId: string;
  revenueLetterContent: string;
  revenueLetterSentAt: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  documentType: string;
  department: string;
  program: string;
  academicYear: string;
  sentToRevenueAt: string;
  status: string;
  paymentRequested?: boolean;
  paymentRequestedAt?: string;
  paymentAmount?: number;
  paymentAccountDetails?: string;
  paymentReceiptPath?: string;
  paymentTransactionId?: string;
  paymentReceiptUploadedAt?: string;
  paymentAdditionalInfo?: string;
}

export default function LettersTable() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [showTransactionChecker, setShowTransactionChecker] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [transactionResult, setTransactionResult] = useState<Letter | null>(null);
  const [transactionError, setTransactionError] = useState('');
  const [checkingTransaction, setCheckingTransaction] = useState(false);

  useEffect(() => {
    fetchLetters();
  }, []);

  const handleSendPaymentEmail = async (letter: Letter) => {
    try {
      const amount = prompt('Enter payment amount (ETB):', '100');
      const accountDetails = prompt('Enter account details:', 'Commercial Bank of Ethiopia\nAccount: 1000123456789\nBranch: Bule Hora');
      const paymentInstructions = prompt('Enter payment instructions:', 'Please deposit the amount at any Commercial Bank branch or through mobile banking. Keep your transaction receipt for verification.');

      if (!amount || !accountDetails || !paymentInstructions) {
        alert('All payment details are required');
        return;
      }

      const response = await fetch('/api/revenue/send-payment-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: letter._id,
          amount,
          accountDetails,
          paymentInstructions
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to send payment email: ${error.error || 'Unknown error'}`);
        return;
      }

      const result = await response.json();
      alert(`Payment email sent successfully to ${result.studentEmail}`);
      
      // Refresh letters to update payment status
      fetchLetters();
    } catch (error) {
      console.error('Failed to send payment email:', error);
      alert('Failed to send payment email. Please try again.');
    }
  };

  const handleViewReceipt = async (item: Letter) => {
    if (!item.paymentReceiptPath) {
      alert('No receipt file uploaded for this request');
      return;
    }
    
    // Open receipt in new tab
    window.open(`http://localhost:3000/${item.paymentReceiptPath}`, '_blank');
  };

  const handleCheckTransaction = async () => {
    if (!transactionId.trim()) {
      setTransactionError('Please enter a transaction ID');
      return;
    }

    setCheckingTransaction(true);
    setTransactionError('');
    setTransactionResult(null);

    try {
      const response = await fetch('/api/transaction/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: transactionId.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        setTransactionError(error.error || 'Transaction not found');
        return;
      }

      const result = await response.json();
      setTransactionResult(result);
    } catch (error) {
      console.error('Failed to check transaction:', error);
      setTransactionError('Failed to check transaction. Please try again.');
    } finally {
      setCheckingTransaction(false);
    }
  };

  const handleForwardToRegistrar = async (item: Letter) => {
    if (!item.paymentReceiptPath) {
      alert('No payment receipt to forward');
      return;
    }

    try {
      const response = await fetch('/api/revenue/forward-to-registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: item._id,
          studentName: item.studentName,
          studentEmail: item.studentEmail,
          studentId: item.studentId,
          documentType: item.documentType,
          department: item.department,
          program: item.program,
          academicYear: item.academicYear,
          paymentAmount: item.paymentAmount,
          paymentTransactionId: item.paymentTransactionId,
          paymentReceiptPath: item.paymentReceiptPath,
          paymentReceiptUploadedAt: item.paymentReceiptUploadedAt
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to forward to registrar: ${error.error || 'Unknown error'}`);
        return;
      }

      const result = await response.json();
      alert(`Formal receipt generated and stored successfully! Receipt ID: ${result.formalReceiptId}\n\nAvailable in registrar dashboard for processing.`);
      
      // Refresh letters to update status
      fetchLetters();
    } catch (error) {
      console.error('Failed to forward to registrar:', error);
      alert('Failed to forward to registrar. Please try again.');
    }
  };

  async function fetchLetters() {
    try {
      const response = await fetch('/api/letters');
      if (response.ok) {
        const data = await response.json();
        setLetters(data);
      }
    } catch (error) {
      console.error('Failed to fetch letters:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading letters...</div>;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-lg">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Letter ID</th>
              <th className="px-6 py-4 text-left font-semibold">Student Name</th>
              <th className="px-6 py-4 text-left font-semibold">Student ID</th>
              <th className="px-6 py-4 text-left font-semibold">Document Type</th>
              <th className="px-6 py-4 text-left font-semibold">Sent Date</th>
              <th className="px-6 py-4 text-left font-semibold">Payment Status</th>
              <th className="px-6 py-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {letters.map((item, index) => (
              <tr key={item._id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="px-6 py-4">
                  <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {item.revenueLetterId}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{item.studentName}</p>
                    <p className="text-xs text-gray-500">{item.studentEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">{item.studentId}</p>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {item.documentType}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(item.revenueLetterSentAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    {item.revenueLetterContent && (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                        <span className="text-sm text-green-700">Letter Sent</span>
                      </div>
                    )}
                    {item.paymentReceiptPath && (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 text-blue-600" />
                        <span className="text-sm text-blue-700">Receipt Uploaded</span>
                      </div>
                    )}
                    {item.paymentRequested && !item.paymentReceiptPath && (
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1 text-yellow-600" />
                        <span className="text-sm text-yellow-700">Payment Pending</span>
                      </div>
                    )}
                    {!item.revenueLetterContent && !item.paymentRequested && !item.paymentReceiptPath && (
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="text-sm text-gray-500">Not Requested</span>
                      </div>
                    )}
                    {item.paymentTransactionId && (
                      <span className="text-xs text-gray-500">ID: {item.paymentTransactionId}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLetter(item)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {!item.paymentRequested && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendPaymentEmail(item)}
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      >
                        <CreditCard className="w-4 h-4 mr-1" />
                        Request Payment
                      </Button>
                    )}
                    {item.paymentReceiptPath && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReceipt(item)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          View Receipt
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleForwardToRegistrar(item)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Forward to Registrar
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTransactionChecker(true)}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                    >
                      <Search className="w-4 h-4 mr-1" />
                      Check Transaction
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLetter && (
        <Dialog open={!!selectedLetter} onOpenChange={() => setSelectedLetter(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg p-6">
              <DialogTitle className="text-2xl font-bold">
                Letter: {selectedLetter.revenueLetterId}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 p-6">
              {/* Letter Header */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-lg mb-4 text-gray-900">Student Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Name</label>
                        <p className="text-base font-medium text-gray-900 bg-white p-3 rounded border border-gray-200">
                          {selectedLetter.studentName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Student ID</label>
                        <p className="text-base font-medium text-gray-900 bg-white p-3 rounded border border-gray-200">
                          {selectedLetter.studentId}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">Email</label>
                        <p className="text-base font-medium text-gray-900 bg-white p-3 rounded border border-gray-200">
                          {selectedLetter.studentEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded border border-gray-200 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                      {selectedLetter.revenueLetterContent}
                    </pre>
                  </div>
                  <div className="text-xs text-gray-500 mt-4">
                    ID: {selectedLetter.revenueLetterId} | 
                    Sent: {new Date(selectedLetter.revenueLetterSentAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Payment Receipt */}
              {selectedLetter.paymentReceiptPath && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                  <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold">P</span>
                    </div>
                    Payment Receipt (Uploaded by Student)
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-semibold text-gray-700">Payment Details</label>
                        <div className="text-xs text-gray-500">
                          Transaction ID: {selectedLetter.paymentTransactionId} | 
                          Uploaded: {selectedLetter.paymentReceiptUploadedAt ? new Date(selectedLetter.paymentReceiptUploadedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-xs text-gray-600">Amount</label>
                          <p className="font-medium text-gray-900">{selectedLetter.paymentAmount} ETB</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Account Used</label>
                          <p className="font-medium text-gray-900">{selectedLetter.paymentAccountDetails?.split('\n')[0] || 'N/A'}</p>
                        </div>
                      </div>
                      {selectedLetter.paymentAdditionalInfo && (
                        <div className="mb-4">
                          <label className="text-xs text-gray-600">Additional Information</label>
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{selectedLetter.paymentAdditionalInfo}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReceipt(letter)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          View Receipt
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve Payment
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Reject Payment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Requested but No Receipt Yet */}
              {selectedLetter.paymentRequested && !selectedLetter.paymentReceiptPath && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                  <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold">P</span>
                    </div>
                    Payment Requested - Waiting for Receipt
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-xs text-gray-600">Amount</label>
                          <p className="font-medium text-gray-900">{selectedLetter.paymentAmount} ETB</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Account Details</label>
                          <p className="font-medium text-gray-900">{selectedLetter.paymentAccountDetails?.split('\n')[0] || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                        <h4 className="font-medium text-yellow-800 mb-2">Payment Status</h4>
                        <p className="text-sm text-yellow-700">
                          Payment has been requested from student. Waiting for payment receipt upload.
                        </p>
                        <div className="text-xs text-yellow-600 mt-2">
                          Requested: {selectedLetter.paymentRequestedAt ? new Date(selectedLetter.paymentRequestedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Resend
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* No Letter or Payment Yet */}
              {!selectedLetter.revenueLetterContent && !selectedLetter.paymentRequested && !selectedLetter.paymentReceiptPath && (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold">I</span>
                    </div>
                    No Letter or Payment Yet
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-gray-600 mb-4">
                        This request has not been processed for payment yet.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Request Payment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Transaction Checker Dialog */}
      {showTransactionChecker && (
        <Dialog open={showTransactionChecker} onOpenChange={() => setShowTransactionChecker(false)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg p-6">
              <DialogTitle className="text-2xl font-bold flex items-center">
                <Search className="w-8 h-8 mr-3" />
                Transaction Checker
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 space-y-6">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-2">Check Transaction Status</h4>
                <p className="text-sm text-purple-700">
                  Enter a transaction ID to verify payment details and receipt information.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Transaction ID</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID (e.g., DOC-1234-567890)"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCheckTransaction}
                    disabled={checkingTransaction || !transactionId.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                  >
                    {checkingTransaction ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span> Checking...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Check Transaction
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTransactionId('');
                      setTransactionResult(null);
                      setTransactionError('');
                    }}
                  >
                    Clear
                  </Button>
                </div>

                {transactionError && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-medium text-red-800 mb-2">Error</h4>
                    <p className="text-sm text-red-700">{transactionError}</p>
                  </div>
                )}

                {transactionResult && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Transaction Found</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-600">Student Name</label>
                          <p className="font-medium text-gray-900">{transactionResult.studentName}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Student ID</label>
                          <p className="font-medium text-gray-900">{transactionResult.studentId}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Amount</label>
                          <p className="font-medium text-gray-900">{transactionResult.paymentAmount} ETB</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Upload Date</label>
                          <p className="font-medium text-gray-900">
                            {transactionResult.paymentReceiptUploadedAt ? 
                              new Date(transactionResult.paymentReceiptUploadedAt).toLocaleDateString() : 
                              'N/A'
                            }
                          </p>
                        </div>
                      </div>
                      {transactionResult.paymentReceiptPath && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReceipt(transactionResult)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            View Receipt
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLetter(transactionResult);
                              setShowTransactionChecker(false);
                            }}
                            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Full Details
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
