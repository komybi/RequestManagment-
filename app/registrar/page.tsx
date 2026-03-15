'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/layout/DashboardNav';
import RegistrarTable from '@/components/registrar/RegistrarTable';

export default function RegistrarDashboard() {
  const { data: session, status } = useSession();

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
        <RegistrarTable />
      </main>
    </div>
  );
}
