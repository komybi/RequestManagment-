'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role, 
          studentId: role === 'student' ? studentId : undefined
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Registration failed');
        return;
      }

      router.push('/auth/login?registered=true');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full border border-purple-200 bg-white/90 backdrop-blur-md shadow-2xl hover:shadow-3xl transition-shadow duration-300">
      <CardHeader className="space-y-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">K</span>
          </div>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl text-gray-900">Create Account</CardTitle>
          <CardDescription className="text-gray-600">Join komydochub to start requesting documents</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <Input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white border-blue-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 text-black"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white border-blue-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 text-black"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white border-blue-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 text-black"
            />
          </div>
          {role === 'student' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Student ID</label>
                <Input
                  type="text"
                  placeholder="STU123456"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  className="bg-white border-blue-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 text-black"
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Account Type</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="registrar">Registrar</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-xl hover:shadow-purple-500/25 transition-all text-base font-medium py-4 mt-6 transform hover:scale-[1.02]" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/90 text-purple-600">Already have an account?</span>
            </div>
          </div>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full border-purple-200 hover:bg-purple-50 hover:text-purple-700 transition-colors">
              Sign In
            </Button>
          </Link>
          <div className="mt-4">
            <Link href="/studentrequest">
              <Button variant="ghost" className="w-full text-purple-600 hover:text-purple-800 hover:bg-purple-50">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
