import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Register - Document Management',
  description: 'Create a new account',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-10 space-y-3">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-white">+</span>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Get Started</h1>
            <p className="text-muted-foreground text-sm">Create your DocHub account to request documents</p>
          </div>
        </div>
        <RegisterForm />
        <p className="text-center text-xs text-muted-foreground mt-6">
          Already have an account? <span className="text-primary hover:underline cursor-pointer">Sign in instead</span>
        </p>
      </div>
    </div>
  );
}
