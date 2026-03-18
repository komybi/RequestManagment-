'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/layout/DashboardNav';
import RegistrarTable from '@/components/registrar/RegistrarTable';
import FormalReceiptsTable from '@/components/registrar/FormalReceiptsTable';

export default function RegistrarDashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'registrar') {
      redirect('/auth/login');
    }
  }, [session, status]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav title="Registrar Dashboard" role="registrar" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Simple Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Document Requests
            </button>
            <button
              onClick={() => setActiveTab('formal-receipts')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'formal-receipts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Formal Receipts
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'requests' && <RegistrarTable />}
        {activeTab === 'formal-receipts' && <FormalReceiptsTable />}
      </main>
    </div>
  );
}
