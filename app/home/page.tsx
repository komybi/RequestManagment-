'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/layout/DashboardNav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  User,
  GraduationCap,
  Building,
  CreditCard,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const { data: session } = useSession();

  if (!session) {
    redirect('/auth/login');
  }

  const role = (session.user as any)?.role;

  const getRoleFeatures = () => {
    switch (role) {
      case 'student':
        return [
          {
            icon: <FileText className="w-8 h-8 text-blue-600" />,
            title: 'Document Requests',
            description: 'Submit and track your document requests',
            href: '/dashboard',
            color: 'from-blue-500 to-blue-600',
          },
          {
            icon: <Clock className="w-8 h-8 text-green-600" />,
            title: 'Request Status',
            description: 'Monitor progress of your requests',
            href: '/dashboard/requests',
            color: 'from-green-500 to-green-600',
          },
          {
            icon: <User className="w-8 h-8 text-purple-600" />,
            title: 'Profile',
            description: 'Manage your personal information',
            href: '/dashboard/profile',
            color: 'from-purple-500 to-purple-600',
          },
        ];
      case 'admin':
        return [
          {
            icon: <Users className="w-8 h-8 text-orange-600" />,
            title: 'User Management',
            description: 'Manage system users and roles',
            href: '/admin/users',
            color: 'from-orange-500 to-orange-600',
          },
          {
            icon: <TrendingUp className="w-8 h-8 text-red-600" />,
            title: 'Reports',
            description: 'View system analytics and reports',
            href: '/admin/reports',
            color: 'from-red-500 to-red-600',
          },
          {
            icon: <Settings className="w-8 h-8 text-gray-600" />,
            title: 'System Settings',
            description: 'Configure system preferences',
            href: '/admin/settings',
            color: 'from-gray-500 to-gray-600',
          },
        ];
      case 'registrar':
        return [
          {
            icon: <FileText className="w-8 h-8 text-blue-600" />,
            title: 'Request Review',
            description: 'Review and approve document requests',
            href: '/registrar/requests',
            color: 'from-blue-500 to-blue-600',
          },
          {
            icon: <Building className="w-8 h-8 text-green-600" />,
            title: 'Clearance Management',
            description: 'Manage student clearances',
            href: '/registrar/clearance',
            color: 'from-green-500 to-green-600',
          },
          {
            icon: <Bell className="w-8 h-8 text-purple-600" />,
            title: 'Notifications',
            description: 'Send notifications to students',
            href: '/registrar/notifications',
            color: 'from-purple-500 to-purple-600',
          },
        ];
      case 'revenue':
        return [
          {
            icon: <CreditCard className="w-8 h-8 text-orange-600" />,
            title: 'Payment Verification',
            description: 'Verify and process payments',
            href: '/revenue/payments',
            color: 'from-orange-500 to-orange-600',
          },
          {
            icon: <TrendingUp className="w-8 h-8 text-red-600" />,
            title: 'Financial Reports',
            description: 'View revenue and financial reports',
            href: '/revenue/reports',
            color: 'from-red-500 to-red-600',
          },
          {
            icon: <CheckCircle className="w-8 h-8 text-green-600" />,
            title: 'Receipt Generation',
            description: 'Generate payment receipts',
            href: '/revenue/receipts',
            color: 'from-green-500 to-green-600',
          },
        ];
      default:
        return [];
    }
  };

  const getRoleStats = () => {
    switch (role) {
      case 'student':
        return [
          { label: 'Active Requests', value: '3', color: 'text-blue-600' },
          { label: 'Completed', value: '12', color: 'text-green-600' },
          { label: 'Pending', value: '1', color: 'text-orange-600' },
        ];
      case 'admin':
        return [
          { label: 'Total Users', value: '1,234', color: 'text-blue-600' },
          { label: 'Active Sessions', value: '89', color: 'text-green-600' },
          { label: 'System Health', value: '98%', color: 'text-purple-600' },
        ];
      case 'registrar':
        return [
          { label: 'Pending Review', value: '15', color: 'text-orange-600' },
          { label: 'Approved Today', value: '28', color: 'text-green-600' },
          { label: 'This Week', value: '142', color: 'text-blue-600' },
        ];
      case 'revenue':
        return [
          { label: 'Payments Pending', value: '8', color: 'text-orange-600' },
          { label: 'Verified Today', value: '24', color: 'text-green-600' },
          { label: 'Revenue This Month', value: '$12,450', color: 'text-purple-600' },
        ];
      default:
        return [];
    }
  };

  const features = getRoleFeatures();
  const stats = getRoleStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav title="Home" role={role} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {session.user?.name}!
            </h1>
            <p className="text-blue-100 mb-4">
              {role === 'student' && 'Manage your document requests and track their progress'}
              {role === 'admin' && 'System administration and user management'}
              {role === 'registrar' && 'Review requests and manage academic records'}
              {role === 'revenue' && 'Payment verification and financial management'}
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span className="text-sm">{new Date().toLocaleDateString()}</span>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                {role?.charAt(0).toUpperCase() + role?.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className={`text-2xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white">
              <CardContent className="p-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <Link href={feature.href}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Access
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Quick Actions</CardTitle>
              <CardDescription className="text-gray-600">
                Frequently used actions for your role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {role === 'student' && (
                  <>
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="mr-2 w-4 h-4" />
                        New Request
                      </Button>
                    </Link>
                    <Link href="/dashboard/requests">
                      <Button variant="outline" className="w-full justify-start">
                        <Clock className="mr-2 w-4 h-4" />
                        My Requests
                      </Button>
                    </Link>
                  </>
                )}
                {role === 'admin' && (
                  <>
                    <Link href="/admin/users">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="mr-2 w-4 h-4" />
                        Manage Users
                      </Button>
                    </Link>
                    <Link href="/admin/reports">
                      <Button variant="outline" className="w-full justify-start">
                        <TrendingUp className="mr-2 w-4 h-4" />
                        View Reports
                      </Button>
                    </Link>
                  </>
                )}
                {role === 'registrar' && (
                  <>
                    <Link href="/registrar/requests">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="mr-2 w-4 h-4" />
                        Review Requests
                      </Button>
                    </Link>
                    <Link href="/registrar/clearance">
                      <Button variant="outline" className="w-full justify-start">
                        <Building className="mr-2 w-4 h-4" />
                        Clearance
                      </Button>
                    </Link>
                  </>
                )}
                {role === 'revenue' && (
                  <>
                    <Link href="/revenue/payments">
                      <Button variant="outline" className="w-full justify-start">
                        <CreditCard className="mr-2 w-4 h-4" />
                        Verify Payments
                      </Button>
                    </Link>
                    <Link href="/revenue/reports">
                      <Button variant="outline" className="w-full justify-start">
                        <TrendingUp className="mr-2 w-4 h-4" />
                        Financial Reports
                      </Button>
                    </Link>
                  </>
                )}
                <Link href="/dashboard/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="mr-2 w-4 h-4" />
                    Profile
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 w-4 h-4" />
                    Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
