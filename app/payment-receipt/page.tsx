'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function PaymentReceiptUpload() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [requestId, setRequestId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!session) {
      redirect('/auth/login');
    }

    // Get parameters from URL
    const reqId = searchParams.get('requestId');
    const transId = searchParams.get('transactionId');
    
    if (reqId) setRequestId(reqId);
    if (transId) setTransactionId(transId);
  }, [session, searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a valid image (JPG, PNG) or PDF file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setReceiptFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!receiptFile || !transactionId) {
      setError('Please upload receipt and provide transaction ID');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('requestId', requestId);
      formData.append('transactionId', transactionId);
      formData.append('receipt', receiptFile);
      formData.append('additionalInfo', additionalInfo);

      const response = await fetch('/api/payment-receipt/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload receipt');
        return;
      }

      setSuccess(true);
      setReceiptFile(null);
      setAdditionalInfo('');

    } catch (err) {
      setError('Failed to upload receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Payment Receipt Uploaded!</CardTitle>
            <CardDescription>
              Your payment receipt has been successfully uploaded and is being reviewed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-2xl flex items-center">
              <Upload className="w-8 h-8 mr-3" />
              Upload Payment Receipt
            </CardTitle>
            <CardDescription className="text-blue-100">
              Upload your payment receipt to complete your document request
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            {requestId && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">
                  <strong>Request ID:</strong> {requestId}
                </p>
                {transactionId && (
                  <p className="text-sm font-medium text-blue-800 mt-1">
                    <strong>Transaction ID:</strong> {transactionId}
                  </p>
                )}
              </div>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="transactionId" className="text-sm font-medium text-gray-700">
                  Transaction ID *
                </Label>
                <Input
                  id="transactionId"
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter your transaction ID"
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This should match the transaction ID from your payment confirmation
                </p>
              </div>

              <div>
                <Label htmlFor="receipt" className="text-sm font-medium text-gray-700">
                  Payment Receipt *
                </Label>
                <div className="mt-1 flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      id="receipt"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      required
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: JPG, PNG, PDF (max 5MB)
                </p>
              </div>

              {receiptFile && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{receiptFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="additionalInfo" className="text-sm font-medium text-gray-700">
                  Additional Information (Optional)
                </Label>
                <Textarea
                  id="additionalInfo"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Any additional information about your payment"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !receiptFile || !transactionId}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              >
                {loading ? 'Uploading...' : 'Upload Payment Receipt'}
              </Button>
            </form>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">Important Notes:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Ensure the receipt clearly shows the transaction ID and amount</li>
                <li>• Receipt must be clear and readable</li>
                <li>• Processing will begin after payment verification</li>
                <li>• You will receive a confirmation email once verified</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
