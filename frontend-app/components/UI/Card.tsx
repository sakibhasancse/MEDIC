'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = '',
  elevated = false,
  hoverable = false,
  onClick,
}: CardProps) {
  const baseClasses = elevated ? 'md-card-elevated' : 'md-card';
  const hoverClasses = hoverable ? 'cursor-pointer hover:shadow-lg' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';
  
  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${clickClasses} ${className}`.trim()}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-gray-100 ${className}`.trim()}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`px-6 py-4 ${className}`.trim()}>{children}</div>;
}

interface CardActionsProps {
  children: ReactNode;
  className?: string;
}

export function CardActions({ children, className = '' }: CardActionsProps) {
  return (
    <div className={`px-6 py-4 border-t border-gray-100 flex items-center gap-2 ${className}`.trim()}>
      {children}
    </div>
  );
}
