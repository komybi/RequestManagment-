'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError('Invalid email or password');
        return;
      }

      // Redirect to appropriate dashboard based on user role
      const userRole = (result as any)?.user?.role;
      switch (userRole) {
        case 'admin':
          router.push('/admin');
          break;
        case 'registrar':
          router.push('/registrar');
          break;
        case 'revenue':
          router.push('/revenue');
          break;
        case 'student':
        default:
          router.push('/dashboard');
          break;
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full border border-border bg-card/50 backdrop-blur">
      <CardHeader className="space-y-3">
        <div className="space-y-1">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm border border-destructive/20">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-input border-border placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-input border-border placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/20 transition-all text-base font-medium py-5" 
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
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card/50 text-muted-foreground">Don't have an account?</span>
            </div>
          </div>
          <Link href="/auth/register">
            <Button variant="outline" className="w-full border-border hover:bg-accent hover:text-accent-foreground transition-colors">
              Create New Account
            </Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
