import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'student' | 'admin' | 'registrar' | 'revenue';
      studentId?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'admin' | 'registrar' | 'revenue';
    studentId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'student' | 'admin' | 'registrar' | 'revenue';
  }
}
