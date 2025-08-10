// src/modules/dashboard/ui/components/dashboard-navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export function DashboardNavbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  const searchItems = [
    { 
      title: 'Meetings', 
      description: 'View and manage your meetings',
      url: '/dashboard/meetings',
    },
    { 
      title: 'Agents', 
      description: 'AI agents and assistants',
      url: '/dashboard/agents',
    },
    { 
      title: 'Upgrade', 
      description: 'Upgrade your plan',
      url: '/dashboard/upgrade',
    },
    { 
      title: 'Billing', 
      description: 'Manage billing and payments',
      url: '/dashboard/billing',
    },
  ];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleItemSelect = (url: string) => {
    setIsSearchOpen(false);
    router.push(url);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200/50 bg-white/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-4 px-4">
          <SidebarTrigger className="h-7 w-7" />
          
          <div className="flex items-center gap-2 flex-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h1 className="font-semibold text-gray-900">Dashboard</h1>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsSearchOpen(true)}
            className="relative w-64 justify-start text-sm text-gray-500 bg-gray-50/80 border-gray-200/50 hover:bg-gray-100/80"
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search anything...</span>
            <div className="ml-auto flex items-center gap-0.5">
              <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-600 opacity-100 hidden sm:flex">
                <Command className="h-3 w-3" />
              </kbd>
              <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-600 opacity-100 hidden sm:flex">
                K
              </kbd>
            </div>
          </Button>
        </div>
      </header>

      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center py-6 text-center">
              <Search className="h-6 w-6 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">No results found.</p>
            </div>
          </CommandEmpty>
          <CommandGroup heading="Quick Actions">
            {searchItems.map((item) => (
              <CommandItem 
                key={item.title}
                onSelect={() => handleItemSelect(item.url)}
                className="flex items-center py-2 cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}