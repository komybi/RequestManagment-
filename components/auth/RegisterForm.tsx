'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, studentId: role === 'student' ? studentId : undefined }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Registration failed');
        return;
      }

      router.push('/auth/login?registered=true');
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
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join DocHub to start requesting documents</CardDescription>
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
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <Input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-input border-border placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
            />
          </div>
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
          {role === 'student' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Student ID</label>
              <Input
                type="text"
                placeholder="STU123456"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="bg-input border-border placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Account Type</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-input border-border focus:border-primary focus:ring-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="registrar">Registrar</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-secondary to-primary hover:shadow-lg hover:shadow-primary/20 transition-all text-base font-medium py-5 mt-6" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card/50 text-muted-foreground">Already have an account?</span>
            </div>
          </div>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full border-border hover:bg-primary hover:text-primary-foreground transition-colors">
              Sign In
            </Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
