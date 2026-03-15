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

export default function IDReplacementForm() {
  const { data: session } = useSession();
  const [reason, setReason] = useState('');
  const [replacementReason, setReplacementReason] = useState('');
  const [replacementType, setReplacementType] = useState('');
  const [file, setFile] = useState<File | null>(null);
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
      setFile(file);
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
      formData.append('description', reason); // API expects 'description' field
      formData.append('replacementType', replacementType);
      formData.append('department', department);
      formData.append('program', program);
      formData.append('phoneNumber', phoneNumber);
      formData.append('academicYear', academicYear);
      
      if (file) {
        formData.append('receipt', file);
      }

      const response = await fetch('/api/id-replacement', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        setError('Failed to submit ID replacement request. Please try again.');
      } else {
        // Show success alert
        alert('ID replacement request submitted successfully!');
        router.refresh();
        setReason('');
        setReplacementType('');
        setDepartment('');
        setProgram('');
        setPhoneNumber('');
        setAcademicYear('');
        setFile(null);
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
      <Card className="border-green-200 bg-white shadow-lg">
        <CardHeader>
          <CardTitle>ID Replacement Request</CardTitle>
          <CardDescription>Request a replacement for your student ID</CardDescription>
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
              <label className="text-sm font-medium text-green-700">Full Name</label>
              <Input
                type="text"
                value={userData.name || ''}
                disabled
                className="mt-1 bg-green-50 border-green-200 text-green-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-green-700">Student ID</label>
              <Input
                type="text"
                value={userData.studentId || ''}
                disabled
                className="mt-1 bg-green-50 border-green-200 text-green-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-green-700">Email</label>
              <Input
                type="email"
                value={userData.email || ''}
                disabled
                className="mt-1 bg-green-50 border-green-200 text-green-900"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-green-700">Department</label>
              <Input
                type="text"
                placeholder="Enter your department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="mt-1 bg-white border-green-200 text-black"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-green-700">Program</label>
              <Input
                type="text"
                placeholder="Enter your program"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                required
                className="mt-1 bg-white border-green-200 text-black"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-green-700">Phone Number</label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="mt-1 bg-white border-green-200 text-black"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-green-700">Academic Year</label>
              <Input
                type="text"
                placeholder="Enter your academic year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
                className="mt-1 bg-white border-green-200 text-black"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-green-700">Replacement Type</label>
            <Select value={replacementType} onValueChange={setReplacementType}>
              <SelectTrigger className="mt-1 bg-white border-green-200 text-black">
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
            <label className="text-sm font-medium text-green-700">Reason</label>
            <Textarea
              placeholder="Please explain why you need a replacement ID"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="mt-1 bg-white border-green-200 text-black"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-green-700">Payment Receipt</label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="mt-1 bg-white border-green-200 text-black"
            />
            {file && (
              <p className="text-sm text-green-600 mt-1">
                Selected: {file.name}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>

      {/* Image Section */}
      <div className="hidden lg:block">
        <div className="relative h-full min-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-green-100 to-green-200 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6">
              <div className="w-32 h-32 bg-green-300 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0 0h3m-3-9l-3 9m0 0v3m0-6h3m0 6v3m0-6v3m0 0h3"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 3a2.5 2.5 0 012.5 2.5 2.5 2.5 0 002.5-2.5 2.5 2.5 0 00-2.5-2.5 2.5 2.5 0 00-2.5-2.5 2.5 2.5 0 00-2.5-2.5z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-4">ID Card Replacement</h3>
              <p className="text-green-700 max-w-sm">
                Get your student ID replaced quickly and easily with our streamlined replacement process.
              </p>
              <div className="space-y-2 text-left bg-white/50 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Fast processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Secure verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Quick delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
