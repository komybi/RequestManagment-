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

export default function ClearanceForm() {
  const { data: session } = useSession();
  const [clearanceType, setClearanceType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/clearance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clearanceType,
          purpose,
          department,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit clearance request');
      }

      router.refresh();
      setClearanceType('');
      setPurpose('');
      setDepartment('');
      setDescription('');
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clearance Request</CardTitle>
        <CardDescription>Request clearance certificates for various purposes</CardDescription>
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
            <label className="text-sm font-medium">Clearance Type</label>
            <Select value={clearanceType} onValueChange={setClearanceType}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select clearance type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academic">Academic Clearance</SelectItem>
                <SelectItem value="financial">Financial Clearance</SelectItem>
                <SelectItem value="library">Library Clearance</SelectItem>
                <SelectItem value="disciplinary">Disciplinary Clearance</SelectItem>
                <SelectItem value="graduation">Graduation Clearance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Department</label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academics">Academics</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="library">Library</SelectItem>
                <SelectItem value="student-affairs">Student Affairs</SelectItem>
                <SelectItem value="registrar">Registrar</SelectItem>
                <SelectItem value="it">IT Department</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Purpose</label>
            <Textarea
              placeholder="What is the purpose of this clearance?"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
