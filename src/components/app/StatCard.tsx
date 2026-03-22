import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  className?: string;
  trend?: {
    value: number;
    label: string;
    type: 'up' | 'down' | 'neutral';
  };
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, className, trend }) => {
  return (
    <div className={cn("bg-white p-6 rounded-2xl border border-slate-100 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {trend && (
          <div className={cn(
            "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
            trend.type === 'up' ? "text-emerald-600 bg-emerald-50" :
            trend.type === 'down' ? "text-red-600 bg-red-50" :
            "text-slate-600 bg-slate-50"
          )}>
            {trend.type === 'up' && <ArrowUpRight className="w-2.5 h-2.5" />}
            {trend.type === 'down' && <ArrowDownRight className="w-2.5 h-2.5" />}
            {trend.type === 'neutral' && <Minus className="w-2.5 h-2.5" />}
            {trend.value} {trend.label}
          </div>
        )}
      </div>
    </div>
  );
};
