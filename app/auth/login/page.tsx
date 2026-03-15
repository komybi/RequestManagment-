import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login - Document Management',
  description: 'Sign in to your account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-10 space-y-3">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-white">D</span>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">DocHub</h1>
            <p className="text-muted-foreground text-sm">Sign in to access your academic documents</p>
          </div>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
