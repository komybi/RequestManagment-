'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export default function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ redirectTo: '/auth/login' });
  };

  return (
    <Button type="button" variant="outline" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
