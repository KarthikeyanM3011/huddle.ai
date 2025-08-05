'use client';

import { useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/');
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]" />
      
      <div className="relative z-10">
        <header className="border-b border-white/20 bg-white/80 backdrop-blur-md">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-sm"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">HuddleAI</h1>
                  <p className="text-sm text-gray-600">Dashboard</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      {session.user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                    <p className="text-xs text-gray-600">{session.user.email}</p>
                  </div>
                </div>

                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {session.user.name?.split(' ')[0]}! 👋
            </h2>
            <p className="text-gray-600">Here's your dashboard overview.</p>
          </div>
        </main>
      </div>
    </div>
  );
}