// components/comparison/PlatformHeader.tsx
import Image from 'next/image';
import type { Platform } from '@/types';
import { cn } from '@/lib/utils';

interface PlatformHeaderProps {
  platform: Platform;
  className?: string;
  /** Size variant for responsive scaling */
  size?: 'sm' | 'md' | 'lg';
}

export function PlatformHeader({ platform, className, size = 'lg' }: PlatformHeaderProps) {
  // Responsive size classes
  const sizeClasses = {
    sm: 'w-[80px] h-[32px]',
    md: 'w-[120px] h-[48px]',
    lg: 'w-full max-w-[200px] h-[60px]',
  };

  return (
    <div className={cn('flex items-center justify-center w-full px-4', className)}>
      <div className={cn('relative logo-white', sizeClasses[size])}>
        <Image
          src={platform.logo}
          alt={platform.name}
          fill
          className="object-contain logo-white"
          sizes="(max-width: 768px) 100px, (max-width: 1024px) 150px, 200px"
        />
      </div>
    </div>
  );
}
