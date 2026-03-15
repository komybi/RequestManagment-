'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/layout/DashboardNav';
import RequestTypeSelector from '@/components/student/RequestTypeSelector';
import ProfileSection from '@/components/student/ProfileSection';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import RequestsList from '@/components/student/RequestsList';
import SignOutButton from '@/components/SignOutButton';
import { useEffect, useState } from 'react';

interface DashboardStats {
  pending: number;
  processing: number;
  approved: number;
  rejected: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    pending: 0,
    processing: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    }

    if (session) {
      fetchStats();
    }
  }, [session]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav title="Student Dashboard" role="student" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {session.user?.name}!</h1>
            <p className="text-blue-100 mb-4">Manage your document requests and track their progress</p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">Student ID: {session.user?.studentId || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span className="text-sm">Member since {new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Form Display in Middle */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-purple-800">Request Center</CardTitle>
              <CardDescription className="text-purple-600">Create and manage your document requests</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestTypeSelector />
            </CardContent>
          </Card>
        </div>

        {/* Status Cards - 4 Cards in One Row, Minimized Size */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Pending Requests Card */}
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 text-center">
              <div className="flex justify-center mb-2">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-xl font-bold text-gray-800 mb-1">{stats.pending}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </CardContent>
          </Card>

          {/* Processing Card */}
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 text-center">
              <div className="flex justify-center mb-2">
                <AlertCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-xl font-bold text-gray-800 mb-1">{stats.processing}</div>
              <div className="text-xs text-gray-600">Processing</div>
            </CardContent>
          </Card>

          {/* Approved Card */}
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 text-center">
              <div className="flex justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-xl font-bold text-gray-800 mb-1">{stats.approved}</div>
              <div className="text-xs text-gray-600">Approved</div>
            </CardContent>
          </Card>

          {/* Rejected Card */}
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 text-center">
              <div className="flex justify-center mb-2">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-xl font-bold text-gray-800 mb-1">{stats.rejected}</div>
              <div className="text-xs text-gray-600">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <div>
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">📋 Recent Requests</CardTitle>
              <CardDescription className="text-gray-600">Your latest document requests and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <RequestsList />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
