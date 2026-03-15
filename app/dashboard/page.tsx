import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RequestTypeSelector from '@/components/student/RequestTypeSelector';
import ProfileSection from '@/components/student/ProfileSection';
import RequestsList from '@/components/student/RequestsList';
import SignOutButton from '@/components/SignOutButton';

export const metadata = {
  title: 'Dashboard - Document Management',
  description: 'Manage your document requests',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  if (session.user?.role === 'admin') {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {session.user?.name}</p>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <RequestTypeSelector />
            <ProfileSection />
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Your Requests</h2>
            <RequestsList />
          </div>
        </div>
      </main>
    </div>
  );
}
