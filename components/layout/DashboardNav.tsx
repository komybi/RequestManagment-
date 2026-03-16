'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  Home,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  CreditCard,
  Users,
  Shield,
} from 'lucide-react';

interface DashboardNavProps {
  title: string;
  role?: 'student' | 'admin' | 'registrar' | 'revenue';
  navigationItems?: Array<{
    name: string;
    href: string;
    icon: React.ReactNode;
  }>;
}

export default function DashboardNav({ title, role = 'student', navigationItems = [] }: DashboardNavProps) {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const defaultNavigationItems = {
    student: [
      { name: 'Home', href: '/home', icon: <Home className="w-4 h-4" /> },
      { name: 'Requests', href: '/dashboard/requests', icon: <FileText className="w-4 h-4" /> },
      { name: 'Profile', href: '/dashboard/profile', icon: <User className="w-4 h-4" /> },
    ],
    admin: [
      { name: 'Home', href: '/home', icon: <Home className="w-4 h-4" /> },
      { name: 'Users', href: '/admin/users', icon: <Users className="w-4 h-4" /> },
      { name: 'Reports', href: '/admin/reports', icon: <FileText className="w-4 h-4" /> },
      { name: 'Profile', href: '/admin/profile', icon: <User className="w-4 h-4" /> },
    ],
    registrar: [
      { name: 'Home', href: '/home', icon: <Home className="w-4 h-4" /> },
      { name: 'Requests', href: '/registrar/requests', icon: <FileText className="w-4 h-4" /> },
      { name: 'Reports', href: '/registrar/reports', icon: <FileText className="w-4 h-4" /> },
      { name: 'Profile', href: '/registrar/profile', icon: <User className="w-4 h-4" /> },
    ],
    revenue: [
      { name: 'Home', href: '/home', icon: <Home className="w-4 h-4" /> },
      { name: 'Payments', href: '/revenue/payments', icon: <CreditCard className="w-4 h-4" /> },
      { name: 'Reports', href: '/revenue/reports', icon: <FileText className="w-4 h-4" /> },
    ],
  };

  const getProfileHref = () => {
    switch (role) {
      case 'admin':
        return '/admin/profile';
      case 'registrar':
        return '/registrar/profile';
      case 'revenue':
        return '/revenue/profile';
      default:
        return '/dashboard/profile';
    }
  };

  const getSettingsHref = () => {
    switch (role) {
      case 'admin':
        return '/admin/settings';
      case 'registrar':
        return '/registrar/settings';
      case 'revenue':
        return '/revenue/settings';
      default:
        return '/dashboard/settings';
    }
  };

  const navItems = navigationItems.length > 0 ? navigationItems : defaultNavigationItems[role];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="text-xl font-bold text-gray-900">komydochub</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center ml-10 space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={session?.user?.image || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {session?.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {session?.user?.role || role}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getProfileHref()} className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={getSettingsHref()} className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
              <Link
                href={getProfileHref()}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                <span className="ml-3">Profile</span>
              </Link>
              <Link
                href={getSettingsHref()}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="w-4 h-4" />
                <span className="ml-3">Settings</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
              >
                <LogOut className="w-4 h-4" />
                <span className="ml-3">Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
