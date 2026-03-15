'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RevenueTable from '@/components/revenue/RevenueTable';

export default function RevenueDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'revenue') {
      redirect('/auth/login');
    }
  }, [session, status]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/revenue/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Revenue Dashboard</h1>
          <p className="text-muted-foreground">Manage payments and verify transactions</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Verification</CardTitle>
            <CardDescription>Verify payments and manage receipts</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueTable />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
