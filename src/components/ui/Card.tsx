import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 ${
        hover ? 'cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; label: string };
  color?: string;
}

export function StatCard({ title, value, icon, trend, color = 'brand' }: StatCardProps) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
  };

  return (
    <Card hover className="animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`text-xs font-medium ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend.value >= 0 ? '+' : ''}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={`rounded-xl p-3 ${colorMap[color]}`}>{icon}</div>
      </div>
    </Card>
  );
}
