import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import dbConnect from './db';
import User from './models/User';

const nextAuthConfig = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          await dbConnect();
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            return null;
          }

          // Compare passwords directly since we're storing in plain text
          const passwordsMatch = credentials.password === user.password;

          if (!passwordsMatch) {
            return null;
          }
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            studentId: user.studentId,
            image: user.image,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.studentId = user.studentId;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub!;
        session.user.role = token.role as 'student' | 'admin' | 'registrar' | 'revenue';
        session.user.studentId = token.studentId as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(nextAuthConfig);
export const authOptions = nextAuthConfig;
