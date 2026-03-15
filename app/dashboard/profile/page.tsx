import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/layout/DashboardNav';
import ProfileSection from '@/components/student/ProfileSection';

export const metadata = {
  title: 'Profile - Student Dashboard',
  description: 'Manage your profile information',
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  // Only allow students to access this page
  if (session.user?.role !== 'student') {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav title="Profile" role="student" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and account settings</p>
        </div>
        
        <ProfileSection />
      </main>
    </div>
  );
}
