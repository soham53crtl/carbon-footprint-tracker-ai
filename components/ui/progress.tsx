import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 to 100
  barClassName?: string;
}

export function Progress({ className, value = 0, barClassName, ...props }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  
  return (
    <div
      className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedValue}
      {...props}
    >
      <div
        className={cn('h-full w-full bg-emerald-500 dark:bg-emerald-600 transition-all duration-500 ease-out', barClassName)}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
