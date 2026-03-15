import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Login - Document Management',
  description: 'Sign in to your account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Back to Dashboard Button */}
      <div className="absolute top-8 left-8 z-10">
        <Link href="/">
          <Button variant="ghost" className="bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Form Section */}
            <div className="p-8 lg:p-12">
              <div className="mb-10 space-y-3">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">K</span>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900">komydochub</h1>
                  <p className="text-gray-600 text-sm">Sign in to access your academic documents</p>
                </div>
              </div>
              <LoginForm />
              <p className="text-center text-xs text-gray-500 mt-6">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>

            {/* Image Section */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0">
                <img 
                  src="/placeholder.jpg" 
                  alt="Login illustration" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80"></div>
              </div>
              <div className="relative z-10 flex items-center justify-center h-full p-8">
                <div className="text-center space-y-6 text-white">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                    <img src="/komy-logo.svg" alt="Komydochub" className="w-16 h-16" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Welcome Back</h3>
                  <p className="text-white/90 max-w-sm mb-8">
                    Access your personalized dashboard and manage your academic documents with ease.
                  </p>
                  <div className="space-y-3 bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 1.035-.432 2.033-1.19 2.825a4.988 4.988 0 01-1.924 1.924A4.988 4.988 0 0112.001 12a4.988 4.988 0 011.924-1.924A4.988 4.988 0 0116 8.001c0 .68-.056 1.35-.166 2.001zM10 8a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-white font-medium">Secure authentication</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100-4h2a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2H6zm0 2h8v6H6V7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-white font-medium">Quick access to documents</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-white font-medium">Personalized experience</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
