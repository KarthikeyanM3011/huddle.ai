// src/components/generated-avatar.tsx
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface GeneratedAvatarProps {
  name: string;
  image?: string | null;
  size?: number;
  className?: string;
}

export function GeneratedAvatar({ 
  name, 
  image, 
  size = 32, 
  className 
}: GeneratedAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const generateAvatarUrl = (name: string) => {
    const initials = getInitials(name);
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=3b82f6,6366f1&textColor=ffffff`;
  };

  return (
    <Avatar 
      className={className}
      style={{ width: size, height: size }}
    >
      {image && (
        <AvatarImage src={image} alt={name} />
      )}
      <AvatarFallback>
        <img 
          src={generateAvatarUrl(name)} 
          alt={name}
          width={size}
          height={size}
        />
      </AvatarFallback>
    </Avatar>
  );
}