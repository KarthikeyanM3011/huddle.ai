// src/modules/dashboard/ui/components/user-profile-drawer.tsx
'use client';

import { useRouter } from 'next/navigation';
import { LogOut, CreditCard, Settings, User, Mail, Calendar } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { authClient } from '@/lib/auth-client';
import { GeneratedAvatar } from '@/components/generated-avatar';

interface UserProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDrawer({ open, onOpenChange }: UserProfileDrawerProps) {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/');
  };

  const handleBilling = () => {
    router.push('/billing');
    onOpenChange(false);
  };

  if (!session) return null;

  const joinDate = new Date(session.user.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-white/95 backdrop-blur-xl border-t border-gray-200/50">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="pb-4">
            <DrawerTitle className="text-center text-lg font-semibold text-gray-900">
              Account Settings
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="px-4 pb-6">
            <div className="relative p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl border border-white/50 shadow-lg mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-indigo-100/20 rounded-2xl"></div>
              <div className="relative flex flex-col items-center space-y-4">
                <div className="relative">
                  <GeneratedAvatar 
                    name={session.user.name || 'User'} 
                    image={session.user.image}
                    size={64}
                    className="ring-4 ring-white shadow-xl"
                  />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-3 border-white shadow-sm flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {session.user.name}
                  </h3>
                  <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                    <Mail className="w-3 h-3" />
                    <span>{session.user.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={handleBilling}
                className="w-full justify-start h-12 px-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:scale-[1.02] transition-all duration-200 group"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg mr-3 group-hover:from-green-500 group-hover:to-emerald-500 transition-colors">
                  <CreditCard className="w-4 h-4 text-green-600 group-hover:text-white" />
                </div>
                <span className="font-medium">Billing & Plans</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start h-12 px-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:scale-[1.02] transition-all duration-200 group text-red-600 hover:text-red-700"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg mr-3 group-hover:from-red-500 group-hover:to-pink-500 transition-colors">
                <LogOut className="w-4 h-4 text-red-600 group-hover:text-white" />
              </div>
              <span className="font-medium">Sign Out</span>
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}