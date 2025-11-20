import React, { useState } from 'react';
import { TradeDirection, TradeFormData } from '../types';
import { X, Save } from 'lucide-react';

interface TradeFormProps {
  onSave: (data: TradeFormData) => void;
  onCancel: () => void;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<TradeFormData>({
    symbol: '',
    entryDate: new Date().toISOString().split('T')[0],
    exitDate: new Date().toISOString().split('T')[0],
    direction: TradeDirection.LONG,
    entryPrice: 0,
    exitPrice: 0,
    quantity: 1,
    fees: 0,
    setup: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'entryPrice' || name === 'exitPrice' || name === 'quantity' || name === 'fees' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-100">Add New Trade</h2>
          <button onClick={onCancel} className="text-zinc-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-zinc-400 text-xs font-bold uppercase mb-2">Symbol</label>
              <input
                type="text"
                name="symbol"
                required
                value={formData.symbol}
                onChange={handleChange}
                placeholder="e.g. AAPL"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 uppercase"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-bold uppercase mb-2">Direction</label>
              <select
                name="direction"
                value={formData.direction}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value={TradeDirection.LONG}>Long</option>
                <option value={TradeDirection.SHORT}>Short</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-bold uppercase mb-2">Setup / Strategy</label>
              <input
                type="text"
                name="setup"
                value={formData.setup}
                onChange={handleChange}
                placeholder="e.g. Breakout"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div>
              <label className="block text-zinc-400 text-xs font-bold uppercase mb-2">Entry Price</label>
              <input
                type="number"
                step="0.01"
                name="entryPrice"
                required
                value={formData.entryPrice}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-bold uppercase mb-2">Exit Price</label>
              <input
                type="number"
                step="0.01"
                name="exitPrice"
                required
                value={formData.exitPrice}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-bold uppercase mb-2">Quantity</label>
              <input
                type="number"
                step="1"
                name="quantity"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
             <div>
              <label className="block text-zinc-400 text-xs font-bold uppercase mb-2">Fees ($)</label>
              <input
                type="number"
                step="0.01"
                name="fees"
                value={formData.fees}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className="block text-zinc-400 text-xs font-bold uppercase mb-2">Entry Date</label>
              <input
                type="date"
                name="entryDate"
                required
                value={formData.entryDate}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs font-bold uppercase mb-2">Exit Date</label>
              <input
                type="date"
                name="exitDate"
                required
                value={formData.exitDate}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-bold uppercase mb-2">Notes & Analysis</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="What was the context? Emotions? Mistakes?"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 rounded-lg bg-transparent hover:bg-zinc-800 text-zinc-300 mr-3 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold flex items-center gap-2 transition-colors"
            >
              <Save size={18} />
              Log Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};