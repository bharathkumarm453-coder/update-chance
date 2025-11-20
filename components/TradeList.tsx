import React from 'react';
import { Trade, TradeStatus, TradeDirection } from '../types';
import { Trash2, Eye } from 'lucide-react';

interface TradeListProps {
  trades: Trade[];
  onDelete: (id: string) => void;
}

export const TradeList: React.FC<TradeListProps> = ({ trades, onDelete }) => {
  if (trades.length === 0) {
    return (
      <div className="p-10 text-center bg-zinc-800 rounded-xl border border-zinc-700">
        <p className="text-zinc-500">No trades recorded yet. Start journaling!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-zinc-800 border border-zinc-700/50 rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-700 text-zinc-400 text-xs">
            <th className="p-4 font-semibold capitalize">Date</th>
            <th className="p-4 font-semibold capitalize">Symbol</th>
            <th className="p-4 font-semibold capitalize">Type</th>
            <th className="p-4 font-semibold capitalize">Setup</th>
            <th className="p-4 font-semibold capitalize text-right">Price In</th>
            <th className="p-4 font-semibold capitalize text-right">Price Out</th>
            <th className="p-4 font-semibold capitalize text-right">Size</th>
            <th className="p-4 font-semibold capitalize text-right">Net P&L</th>
            <th className="p-4 font-semibold capitalize text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-zinc-700/50">
          {trades.map((trade) => (
            <tr key={trade.id} className="hover:bg-zinc-700/50 transition-colors text-zinc-300">
              <td className="p-4">{trade.exitDate}</td>
              <td className="p-4 font-bold text-zinc-100">{trade.symbol}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${trade.direction === TradeDirection.LONG ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                  {trade.direction}
                </span>
              </td>
              <td className="p-4 text-zinc-400">{trade.setup || '-'}</td>
              <td className="p-4 text-right text-zinc-400">${trade.entryPrice}</td>
              <td className="p-4 text-right text-zinc-400">${trade.exitPrice}</td>
              <td className="p-4 text-right">{trade.quantity}</td>
              <td className={`p-4 text-right font-bold ${trade.pnl >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="p-4">
                <div className="flex items-center justify-center gap-2">
                  <button 
                    onClick={() => onDelete(trade.id)}
                    className="p-1.5 rounded hover:bg-rose-900/30 text-zinc-500 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};