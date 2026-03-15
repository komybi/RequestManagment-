'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DocumentRequestForm() {
  const { data: session } = useSession();
  const [documentType, setDocumentType] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [department, setDepartment] = useState('');
  const [program, setProgram] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [academicYear, setAcademicYear] = useState('');
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
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          quantity: parseInt(quantity),
          department,
          program,
          phoneNumber,
          academicYear,
        }),
      });

      if (!response.ok) {
        setError('Failed to submit request. Please try again.');
      } else {
        // Show success alert
        alert('Document request submitted successfully!');
        router.refresh();
        setDocumentType('');
        setQuantity('1');
        setDepartment('');
        setProgram('');
        setPhoneNumber('');
        setAcademicYear('');
      }
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <Card className="border-blue-200 bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Request New Document</CardTitle>
          <CardDescription>Submit a new document request</CardDescription>
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
              <label className="text-sm font-medium text-blue-700">Full Name</label>
              <Input
                type="text"
                value={userData.name || ''}
                disabled
                className="mt-1 bg-blue-50 border-blue-200 text-blue-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-blue-700">Student ID</label>
              <Input
                type="text"
                value={userData.studentId || ''}
                disabled
                className="mt-1 bg-blue-50 border-blue-200 text-blue-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-blue-700">Email</label>
              <Input
                type="email"
                value={userData.email || ''}
                disabled
                className="mt-1 bg-blue-50 border-blue-200 text-blue-900"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-blue-700">Department</label>
              <Input
                type="text"
                placeholder="Enter your department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="mt-1 bg-white border-blue-200 text-black"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-blue-700">Program</label>
              <Input
                type="text"
                placeholder="Enter your program"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                required
                className="mt-1 bg-white border-blue-200 text-black"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-blue-700">Phone Number</label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="mt-1 bg-white border-blue-200 text-black"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-blue-700">Academic Year</label>
              <Input
                type="text"
                placeholder="Enter your academic year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
                className="mt-1 bg-white border-blue-200 text-black"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-blue-700">Document Type</label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger className="mt-1 bg-white border-blue-200 text-black">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transcript">Transcript</SelectItem>
                <SelectItem value="certificate">Certificate</SelectItem>
                <SelectItem value="character">Character Certificate</SelectItem>
                <SelectItem value="coursework">Coursework</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-blue-700">Quantity</label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 bg-white border-blue-200 text-black"
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>

      {/* Image Section */}
      <div className="hidden lg:block">
        <div className="relative h-full min-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6">
              <div className="w-32 h-32 bg-blue-300 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-6a2 2 0 01-2-2V7a2 2 0 012-2h2z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-blue-800 mb-4">Documents at Your Fingertips</h3>
              <p className="text-blue-700 max-w-sm">
                Request and receive your academic documents quickly and efficiently with our streamlined system.
              </p>
              <div className="space-y-2 text-left bg-white/50 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Instant processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Digital delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Secure storage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
