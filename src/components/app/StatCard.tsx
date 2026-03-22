import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, className }) => {
  return (
    <div className={cn("bg-white p-6 rounded-2xl border border-slate-100 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
};
