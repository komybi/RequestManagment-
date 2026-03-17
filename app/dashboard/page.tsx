'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/layout/DashboardNav';
import RequestTypeSelector from '@/components/student/RequestTypeSelector';
import ProfileSection from '@/components/student/ProfileSection';
import DocumentRequestForm from '@/components/student/DocumentRequestForm';
import IDReplacementForm from '@/components/student/IDReplacementForm';
import ClearanceForm from '@/components/student/ClearanceForm';
import CostShareForm from '@/components/student/CostShareForm';
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
  const [selectedRequestType, setSelectedRequestType] = useState<string | null>(null);

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
  });

  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  if (!session) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">Session not found</div>
    </div>;
  }

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

        {/* Status Cards - 4 Cards in One Row, Modern Design */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Pending Requests Card */}
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{stats.pending}</span>
              </div>
              <div className="text-sm font-semibold text-gray-600">Pending Requests</div>
              <div className="mt-2 text-xs text-gray-500">Awaiting processing</div>
            </CardContent>
          </Card>

          {/* Processing Card */}
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{stats.processing}</span>
              </div>
              <div className="text-sm font-semibold text-gray-600">Processing</div>
              <div className="mt-2 text-xs text-gray-500">Currently being processed</div>
            </CardContent>
          </Card>

          {/* Approved Card */}
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{stats.approved}</span>
              </div>
              <div className="text-sm font-semibold text-gray-600">Approved</div>
              <div className="mt-2 text-xs text-gray-500">Successfully approved</div>
            </CardContent>
          </Card>

          {/* Rejected Card */}
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{stats.rejected}</span>
              </div>
              <div className="text-sm font-semibold text-gray-600">Rejected</div>
              <div className="mt-2 text-xs text-gray-500">Request was rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Request Center - Modern Card Design with Status Bar */}
        <div className="mb-8">
          {/* Status Bar */}
          <div className="bg-white border-0 shadow-lg rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">System Status</span>
                <span className="text-sm text-gray-500">All services operational</span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span>Response time: 45ms</span>
                <span>Last updated: Just now</span>
              </div>
            </div>
          </div>

          {/* Request Cards or Form Display */}
          {!selectedRequestType ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Center</h2>
                <p className="text-gray-600">Choose a document type to start your request</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Document Request Card */}
                <Card 
                  className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl cursor-pointer group"
                  onClick={() => setSelectedRequestType('document')}
                >
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Document Request</h3>
                    <p className="text-sm text-gray-600 mb-4">Request academic documents like transcripts, certificates, and letters</p>
                    <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-700">
                      <span>Start Request</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>

                {/* ID Replacement Card */}
                <Card 
                  className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl cursor-pointer group"
                  onClick={() => setSelectedRequestType('id-replacement')}
                >
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <span className="text-3xl">🪪</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">ID Replacement</h3>
                    <p className="text-sm text-gray-600 mb-4">Request a replacement for lost or damaged student ID</p>
                    <div className="flex items-center text-green-600 font-semibold text-sm group-hover:text-green-700">
                      <span>Start Request</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>

                {/* Clearance Request Card */}
                <Card 
                  className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl cursor-pointer group"
                  onClick={() => setSelectedRequestType('clearance')}
                >
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <span className="text-3xl">✅</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Clearance Request</h3>
                    <p className="text-sm text-gray-600 mb-4">Request clearance certificates for various purposes</p>
                    <div className="flex items-center text-orange-600 font-semibold text-sm group-hover:text-orange-700">
                      <span>Start Request</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>

                {/* MA Document Request Card */}
                <Card 
                  className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl cursor-pointer group"
                  onClick={() => setSelectedRequestType('ma-document')}
                >
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <span className="text-3xl">🎓</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">MA Document Request</h3>
                    <p className="text-sm text-gray-600 mb-4">Request Master's degree documents and certificates</p>
                    <div className="flex items-center text-purple-600 font-semibold text-sm group-hover:text-purple-700">
                      <span>Start Request</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Share Request Card */}
                <Card 
                  className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl cursor-pointer group"
                  onClick={() => setSelectedRequestType('cost-share')}
                >
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <span className="text-3xl">💰</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Cost Share Request</h3>
                    <p className="text-sm text-gray-600 mb-4">Request cost sharing for educational expenses</p>
                    <div className="flex items-center text-yellow-600 font-semibold text-sm group-hover:text-yellow-700">
                      <span>Start Request</span>
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            /* Form Display */
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-purple-800">Request Center</CardTitle>
                    <CardDescription className="text-purple-600">Create and manage your document requests</CardDescription>
                  </div>
                  <button
                    onClick={() => setSelectedRequestType(null)}
                    className="px-4 py-2 bg-white border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 transition-colors"
                  >
                    ← Back to Cards
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedRequestType === 'document' && <DocumentRequestForm isMARequest={false} />}
                {selectedRequestType === 'ma-document' && <DocumentRequestForm isMARequest={true} />}
                {selectedRequestType === 'id-replacement' && <IDReplacementForm />}
                {selectedRequestType === 'clearance' && <ClearanceForm />}
                {selectedRequestType === 'cost-share' && <CostShareForm />}
              </CardContent>
            </Card>
          )}
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
