'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if there's a redirect parameter
    const redirectUrl = searchParams.get('redirect');
    if (redirectUrl) {
      console.log('LoginForm - Redirect URL:', decodeURIComponent(redirectUrl));
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const redirectUrl = searchParams.get('redirect');
      await signIn('credentials', {
        email,
        password,
        redirect: false, // We'll handle redirect manually
        callbackUrl: redirectUrl ? decodeURIComponent(redirectUrl) : '/',
      });
      
      // If there's a redirect URL, navigate to it after successful login
      if (redirectUrl) {
        router.push(decodeURIComponent(redirectUrl));
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full border border-blue-200 bg-white/90 backdrop-blur-md shadow-2xl hover:shadow-3xl transition-shadow duration-300">
      <CardHeader className="space-y-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">K</span>
          </div>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">Sign in to your account to continue</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white border-blue-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 text-black"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white border-blue-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 text-black"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:shadow-blue-500/25 transition-all text-base font-medium py-4 transform hover:scale-[1.02]" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-blue-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-blue-600">Don't have an account?</span>
            </div>
          </div>
          <Link href="/auth/register">
            <Button variant="outline" className="w-full border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors">
              Create New Account
            </Button>
          </Link>
          <div className="mt-4">
            <Link href="/studentrequest">
              <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
