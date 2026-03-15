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

export default function IDReplacementForm() {
  const { data: session } = useSession();
  const [reason, setReason] = useState('');
  const [replacementType, setReplacementType] = useState('');
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
      formData.append('reason', reason);
      formData.append('replacementType', replacementType);
      formData.append('description', description);
      
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      const response = await fetch('/api/id-replacement', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit ID replacement request');
      }

      router.refresh();
      setReason('');
      setReplacementType('');
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
        <CardTitle>ID Replacement Request</CardTitle>
        <CardDescription>Request a replacement for your student ID</CardDescription>
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
            <label className="text-sm font-medium">Replacement Type</label>
            <Select value={replacementType} onValueChange={setReplacementType}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select replacement type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lost">Lost ID</SelectItem>
                <SelectItem value="damaged">Damaged ID</SelectItem>
                <SelectItem value="stolen">Stolen ID</SelectItem>
                <SelectItem value="name-change">Name Change</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Reason</label>
            <Textarea
              placeholder="Please explain why you need a replacement ID"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Additional Details</label>
            <Textarea
              placeholder="Any additional information we should know"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
