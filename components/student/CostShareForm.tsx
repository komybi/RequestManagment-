'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CostShareForm() {
  const { data: session } = useSession();
  const [requestType, setRequestType] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [description, setDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      // Check file type
      if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
        setError('Only image files and PDFs are allowed');
        return;
      }
      setReceiptFile(file);
      setError('');
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('requestType', requestType);
      formData.append('amount', amount);
      formData.append('paymentMethod', paymentMethod);
      formData.append('description', description);
      
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      const response = await fetch('/api/cost-share', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit cost share request');
      }

      router.refresh();
      setRequestType('');
      setAmount('');
      setPaymentMethod('');
      setDescription('');
      setReceiptFile(null);
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Share Request</CardTitle>
        <CardDescription>Request cost sharing for educational expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input
                type="text"
                value={session?.user?.name || ''}
                disabled
                className="mt-1 bg-muted"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Student ID</label>
              <Input
                type="text"
                value={session?.user?.studentId || ''}
                disabled
                className="mt-1 bg-muted"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Request Type</label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tuition">Tuition Fee</SelectItem>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="books">Books & Materials</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="medical">Medical Expenses</SelectItem>
                <SelectItem value="other">Other Expenses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Amount Requested</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Payment Method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                <SelectItem value="mobile-money">Mobile Money</SelectItem>
                <SelectItem value="cash">Cash Deposit</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="online">Online Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Payment Receipt</label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="mt-1"
            />
            {receiptFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {receiptFile.name}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Please describe why you need cost sharing"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
