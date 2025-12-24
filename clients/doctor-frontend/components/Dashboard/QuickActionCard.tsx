'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface QuickActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  color?: 'blue' | 'teal' | 'indigo' | 'purple' | 'green' | 'pink';
}

export default function QuickActionCard({
  icon,
  title,
  description,
  href,
  color = 'blue',
}: QuickActionCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    teal: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
    indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
  };

  return (
    <Link
      href={href}
      className={`
        block bg-gradient-to-br ${colorClasses[color]}
        text-white rounded-xl p-6 shadow-md hover:shadow-xl
        transition-all duration-300 transform hover:-translate-y-1
      `}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/90 text-sm">{description}</p>
    </Link>
  );
}
