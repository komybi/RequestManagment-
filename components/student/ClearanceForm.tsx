'use client';

import { useState, useEffect } from 'react';
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
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: '',
    program: '',
    phoneNumber: '',
    year: ''
  });
  const router = useRouter();

  // Fetch user data from database
  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/user?email=${session?.user?.email}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

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
          department,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit clearance request');
      }

      router.refresh();
      setClearanceType('');
      setDepartment('');
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <Card className="border-purple-200 bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Clearance Request</CardTitle>
          <CardDescription>Request clearance certificates for various purposes</CardDescription>
        </CardHeader>
        <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-purple-700">Full Name</label>
              <Input
                type="text"
                value={userData.name || ''}
                disabled
                className="mt-1 bg-purple-50 border-purple-200 text-purple-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-purple-700">Student ID</label>
              <Input
                type="text"
                value={userData.studentId || ''}
                disabled
                className="mt-1 bg-purple-50 border-purple-200 text-purple-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-purple-700">Email</label>
              <Input
                type="email"
                value={userData.email || ''}
                disabled
                className="mt-1 bg-purple-50 border-purple-200 text-purple-900"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-purple-700">Clearance Type</label>
            <Select value={clearanceType} onValueChange={setClearanceType}>
              <SelectTrigger className="mt-1 bg-white border-purple-200 text-black">
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
            <label className="text-sm font-medium text-purple-700">Department</label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="mt-1 bg-white border-purple-200 text-black">
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
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>

      {/* Image Section */}
      <div className="hidden lg:block">
        <div className="relative h-full min-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6">
              <div className="w-32 h-32 bg-purple-300 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6.44 4.44L12 12m-3-8.44L4.56 3.56M9 12l2 2 4-4m6.44 4.44L12 12m-3-8.44L4.56 3.56"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v6m0 0h6m-6 0h6"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-purple-800 mb-4">Clearance Certificates</h3>
              <p className="text-purple-700 max-w-sm">
                Obtain official clearance certificates for various academic and administrative purposes.
              </p>
              <div className="space-y-2 text-left bg-white/50 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Official documents</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Quick processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Digital delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
