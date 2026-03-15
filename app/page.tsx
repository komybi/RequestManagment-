import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Document Management System',
  description: 'Manage your academic document requests efficiently',
};

export default async function Home() {
  const session = await auth();

  if (session) {
    const role = (session.user as any)?.role;
    if (role === 'admin') {
      redirect('/admin');
    }
    if (role === 'registrar') {
      redirect('/registrar');
    }
    if (role === 'revenue') {
      redirect('/revenue');
    }
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">DocHub</h1>
              <p className="text-xs text-muted-foreground">Academic Documents</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <section className="text-center mb-20 space-y-6">
          <div className="space-y-3">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Manage Academic Documents
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Streamline your document requests with our modern, secure platform. From submission to delivery, track every step with transparency.
            </p>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/20 transition-all">
                Start Today
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="hover:border-primary hover:text-primary transition-colors">Sign In</Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="group bg-card hover:bg-card/80 border border-border hover:border-primary/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Students</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Submit requests, track status, and download approved documents instantly.
            </p>
            <Link href="/auth/register">
              <Button variant="outline" size="sm" className="w-full text-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                Register Now
              </Button>
            </Link>
          </div>

          <div className="group bg-card hover:bg-card/80 border border-border hover:border-secondary/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/10">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mb-4 group-hover:from-secondary/30 group-hover:to-primary/30 transition-colors">
              <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Admin</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Manage users, assign roles, and monitor comprehensive statistics.
            </p>
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="w-full text-sm hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-colors">
                Admin Login
              </Button>
            </Link>
          </div>

          <div className="group bg-card hover:bg-card/80 border border-border hover:border-accent/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:from-accent/30 group-hover:to-secondary/30 transition-colors">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Registrar</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Review submissions, approve requests, generate formal letters.
            </p>
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="w-full text-sm hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors">
                Registrar Login
              </Button>
            </Link>
          </div>

          <div className="group bg-card hover:bg-card/80 border border-border hover:border-chart-4/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-chart-4/10">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-chart-4/20 to-accent/20 flex items-center justify-center mb-4 group-hover:from-chart-4/30 group-hover:to-accent/30 transition-colors">
              <svg className="w-6 h-6 text-chart-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Revenue</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Verify payments, issue receipts, manage delivery status.
            </p>
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="w-full text-sm hover:border-chart-4 transition-colors">
                Revenue Login
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-8 hover:border-primary/50 transition-colors">
            <div className="text-4xl font-bold text-primary mb-3">Fast</div>
            <p className="text-muted-foreground">Process requests in minutes with our streamlined workflow.</p>
          </div>
          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-8 hover:border-accent/50 transition-colors">
            <div className="text-4xl font-bold text-accent mb-3">Secure</div>
            <p className="text-muted-foreground">Enterprise-grade security protects all sensitive documents.</p>
          </div>
          <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-8 hover:border-secondary/50 transition-colors">
            <div className="text-4xl font-bold text-secondary mb-3">Transparent</div>
            <p className="text-muted-foreground">Track every request status in real-time with QR codes.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
