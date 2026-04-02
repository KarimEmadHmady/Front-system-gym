import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground',
  };

  return (
    <div className={cn(variants[variant], className)} {...props} />
  );
}

export { Badge };
