import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, DotProps } from 'recharts';
import { EquityPoint } from '../types';

interface EquityChartProps {
  data: EquityPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const pointData = payload[0].payload as EquityPoint;
    return (
      <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg shadow-lg text-xs animate-fade-in">
        <div className="flex justify-between items-center mb-2">
          <p className="font-bold text-white">{pointData.symbol}</p>
          <p className="text-zinc-400">{label}</p>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center gap-4">
            <span className="text-zinc-400">Trade P&L:</span>
            <span className={`font-bold ${pointData.tradePnl >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {pointData.tradePnl >= 0 ? '+' : ''}${pointData.tradePnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center gap-4 border-t border-zinc-800 pt-1 mt-1">
            <span className="text-zinc-400">Net Equity:</span>
            <span className="font-bold text-white">
              ${pointData.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface CustomDotProps extends DotProps {
  payload?: EquityPoint;
}

const CustomDot: React.FC<CustomDotProps> = (props) => {
  const { cx, cy, payload } = props;

  if (!payload || !cx || !cy) return null;

  const isWin = payload.tradePnl >= 0;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      stroke={isWin ? 'rgba(250, 204, 21, 0.9)' : 'rgba(244, 63, 94, 0.9)'}
      strokeWidth={2}
      fill={isWin ? '#18181b' : 'rgba(244, 63, 94, 0.7)'}
    />
  );
};


export const EquityChart: React.FC<EquityChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-zinc-500 text-sm">
        Not enough data to display equity curve
      </div>
    );
  }

  // Calculate domain for better chart scaling
  const equityValues = data.map(d => d.equity);
  const minEquity = Math.min(0, ...equityValues);
  const maxEquity = Math.max(0, ...equityValues);
  const padding = (maxEquity - minEquity) * 0.1 || 10;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
        <XAxis 
          dataKey="date" 
          tick={{ fill: '#a1a1aa', fontSize: 10 }} 
          axisLine={false}
          tickLine={false}
          minTickGap={30}
        />
        <YAxis 
          tick={{ fill: '#a1a1aa', fontSize: 10 }} 
          axisLine={false}
          tickLine={false}
          domain={[Math.floor(minEquity - padding), Math.ceil(maxEquity + padding)]}
          tickFormatter={(val) => `$${val.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '3 3' }} />
        <Area 
          type="monotone" 
          dataKey="equity" 
          stroke="#facc15" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorEquity)" 
          dot={<CustomDot />}
          activeDot={{ r: 6, stroke: '#e4e4e7', strokeWidth: 2, fill: '#18181b' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};