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

export default function CostShareForm() {
  const { data: session } = useSession();
  const [requestType, setRequestType] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
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
      formData.append('department', department);
      formData.append('program', program);
      formData.append('phoneNumber', phoneNumber);
      formData.append('academicYear', academicYear);
      
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      const response = await fetch('/api/cost-share', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        setError('Failed to submit cost share request. Please try again.');
      } else {
        // Show success alert
        alert('Cost share request submitted successfully!');
        router.refresh();
        setRequestType('');
        setAmount('');
        setPaymentMethod('');
        setDepartment('');
        setProgram('');
        setPhoneNumber('');
        setAcademicYear('');
        setReceiptFile(null);
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
      <Card className="border-orange-200 bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Cost Share Request</CardTitle>
          <CardDescription>Request cost sharing for educational expenses</CardDescription>
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
            <label className="text-sm font-medium text-blue-700">Request Type</label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger className="mt-1 bg-white border-blue-200 text-black">
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
            <label className="text-sm font-medium text-blue-700">Amount Requested</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="mt-1 bg-white border-blue-200 text-black"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-blue-700">Payment Method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="mt-1 bg-white border-blue-200 text-black">
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
            <label className="text-sm font-medium text-blue-700">Payment Receipt</label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="mt-1 bg-white border-blue-200 text-black"
            />
            {receiptFile && (
              <p className="text-sm text-blue-600 mt-1">
                Selected: {receiptFile.name}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>

      {/* Image Section */}
      <div className="hidden lg:block">
        <div className="relative h-full min-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6">
              <div className="w-32 h-32 bg-orange-300 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 3 3 3 3-1.343 3-3-3-1.343-3-3-3zm0 8c1.657 0 3-.895 3-2s-.895-2-2-2-2 1.343-2 3-2 2 .895 2 2-.895 2-2 2z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 1v6m0 6v6m0-6h6m-6 0h6"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-orange-800 mb-4">Cost Share Made Easy</h3>
              <p className="text-orange-700 max-w-sm">
                Get financial assistance for your educational expenses with our streamlined cost sharing program.
              </p>
              <div className="space-y-2 text-left bg-white/50 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Quick approval process</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Flexible payment options</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Secure transactions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
