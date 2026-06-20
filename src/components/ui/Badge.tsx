type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-400',
  danger: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950 dark:text-red-400',
  info: 'bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-950 dark:text-brand-400',
  neutral: 'bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-400',
};

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-brand-500',
  neutral: 'bg-gray-400',
};

export default function Badge({ variant = 'neutral', children, dot }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variants[variant]}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

export function getStockBadgeVariant(status: 'in-stock' | 'low-stock' | 'out-of-stock'): BadgeVariant {
  switch (status) {
    case 'in-stock':
      return 'success';
    case 'low-stock':
      return 'warning';
    case 'out-of-stock':
      return 'danger';
  }
}

export function getStockBadgeLabel(status: 'in-stock' | 'low-stock' | 'out-of-stock'): string {
  switch (status) {
    case 'in-stock':
      return 'In Stock';
    case 'low-stock':
      return 'Low Stock';
    case 'out-of-stock':
      return 'Out of Stock';
  }
}
