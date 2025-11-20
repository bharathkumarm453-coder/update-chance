import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  colorClass?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, subValue, icon, trend, colorClass }) => {
  return (
    <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-1">{title}</p>
          <h3 className={`text-2xl font-bold ${colorClass ? colorClass : 'text-zinc-100'}`}>
            {value}
          </h3>
          {subValue && (
            <p className={`text-xs mt-1 ${trend === 'up' ? 'text-amber-400' : trend === 'down' ? 'text-rose-400' : 'text-zinc-500'}`}>
              {subValue}
            </p>
          )}
        </div>
        <div className="p-2 bg-zinc-700 rounded-lg text-zinc-400">
          {icon}
        </div>
      </div>
    </div>
  );
};