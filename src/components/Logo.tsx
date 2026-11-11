import { HeartHandshake } from 'lucide-react';

interface LogoProps {
  variant?: 'light' | 'dark';
}

export function Logo({ variant = 'dark' }: LogoProps) {
  const text = variant === 'light' ? 'text-white' : 'text-primary-900';
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
        <HeartHandshake className="h-5 w-5" />
      </span>
      <span className={`font-display text-xl font-bold tracking-tight ${text}`}>GiveRoot</span>
    </span>
  );
}
