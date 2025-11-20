import React, { useState } from 'react';
import { Calculator, Target, AlertTriangle, Crosshair, DollarSign, TrendingUp } from 'lucide-react';

export const PositionSizer: React.FC = () => {
  const [inputs, setInputs] = useState({
    accountBalance: 10000,
    riskPercent: 1.0,
    leverage: 1,
    entryPrice: 150.00,
    stopLoss: 147.50,
    targetPrice: 160.00
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  // Calculations
  const riskAmount = (inputs.accountBalance * inputs.riskPercent) / 100;
  const riskPerShare = Math.abs(inputs.entryPrice - inputs.stopLoss);
  
  // Position Sizing (shares) is determined by risk, not leverage
  const positionSize = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
  
  // Capital required is adjusted by leverage
  const positionValue = positionSize * inputs.entryPrice;
  const capitalRequired = inputs.leverage > 0 ? positionValue / inputs.leverage : positionValue;
  
  // Reward Stats
  const rewardPerShare = Math.abs(inputs.targetPrice - inputs.entryPrice);
  const potentialProfit = positionSize * rewardPerShare;
  const rrRatio = riskPerShare > 0 ? (rewardPerShare / riskPerShare) : 0;
  
  // Capital usage check
  const capitalUsagePercent = inputs.accountBalance > 0 ? (capitalRequired / inputs.accountBalance) * 100 : 0;

  return (
    <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-500/20 rounded-lg">
          <Calculator className="text-amber-500" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Position Size Calculator</h2>
          <p className="text-zinc-400 text-sm">Calculate risk-adjusted lot sizes instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-700 space-y-4">
            <h3 className="text-zinc-300 font-bold mb-4 flex items-center gap-2">
              <DollarSign size={16} className="text-amber-400"/> Account Settings
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Account Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-500">$</span>
                <input
                  type="number"
                  name="accountBalance"
                  value={inputs.accountBalance}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-8 pr-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Risk per Trade (%)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  name="riskPercent"
                  value={inputs.riskPercent}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-3 pr-8 text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
                <span className="absolute right-3 top-2.5 text-zinc-500">%</span>
              </div>
              <p className="text-xs text-rose-400 mt-1 text-right font-mono">-${riskAmount.toFixed(2)} Risk</p>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Leverage</label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  name="leverage"
                  value={inputs.leverage}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-3 pr-8 text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
                 <span className="absolute right-3 top-2.5 text-zinc-500">x</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-700 space-y-4">
            <h3 className="text-zinc-300 font-bold mb-4 flex items-center gap-2">
              <Crosshair size={16} className="text-blue-400"/> Trade Parameters
            </h3>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Entry Price</label>
              <input
                type="number"
                step="0.01"
                name="entryPrice"
                value={inputs.entryPrice}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Stop Loss</label>
              <input
                type="number"
                step="0.01"
                name="stopLoss"
                value={inputs.stopLoss}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-rose-500 transition-colors"
              />
               <p className="text-xs text-zinc-500 mt-1 text-right">Distance: {(Math.abs(inputs.entryPrice - inputs.stopLoss)).toFixed(2)}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Target Price</label>
              <input
                type="number"
                step="0.01"
                name="targetPrice"
                value={inputs.targetPrice}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
          
          {/* Recommended Size Card */}
          <div className="md:col-span-2 bg-zinc-900 border border-amber-500/30 p-6 rounded-xl flex flex-col items-center justify-center text-center">
             <h3 className="text-amber-400 font-bold uppercase tracking-wider text-sm mb-2">Recommended Position Size</h3>
             <div className="text-5xl md:text-6xl font-black text-white tracking-tight mb-2">
                {positionSize.toLocaleString()} <span className="text-2xl font-medium text-zinc-400">Shares</span>
             </div>
             <p className="text-zinc-400 text-sm bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
               Capital Required: <span className="text-white font-bold">${capitalRequired.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
             </p>
          </div>

          {/* Risk Metrics */}
          <div className="bg-zinc-900/50 border border-zinc-700 p-5 rounded-xl">
             <div className="flex items-center gap-2 mb-3 text-rose-400">
                <AlertTriangle size={18} />
                <h4 className="font-bold uppercase text-xs">Risk Analysis</h4>
             </div>
             <div className="space-y-3">
                <div className="flex justify-between items-end">
                   <span className="text-zinc-400 text-sm">Total Risk</span>
                   <span className="text-xl font-bold text-white">${riskAmount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-rose-500 h-full rounded-full" style={{width: '100%'}}></div>
                </div>
                <p className="text-xs text-zinc-500">
                  You are risking <strong>{inputs.riskPercent}%</strong> of your account on this trade.
                </p>
             </div>
          </div>

          {/* Reward Metrics */}
          <div className="bg-zinc-900/50 border border-zinc-700 p-5 rounded-xl">
             <div className="flex items-center gap-2 mb-3 text-amber-400">
                <Target size={18} />
                <h4 className="font-bold uppercase text-xs">Profit Potential</h4>
             </div>
             <div className="space-y-3">
                <div className="flex justify-between items-end">
                   <span className="text-zinc-400 text-sm">Estimated Profit</span>
                   <span className="text-xl font-bold text-white">${potentialProfit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-zinc-700 pt-2">
                   <span className="text-zinc-400 text-sm">Risk : Reward</span>
                   <span className={`px-3 py-1 text-base font-bold rounded-full transition-colors ${
                      rrRatio >= 2
                        ? 'bg-amber-500/20 text-amber-400'
                        : rrRatio >= 1
                        ? 'bg-zinc-500/20 text-zinc-400'
                        : 'bg-rose-500/20 text-rose-400'
                   }`}>
                     1 : {rrRatio.toFixed(2)}
                   </span>
                </div>
             </div>
          </div>

          {/* Capital Usage */}
           <div className="md:col-span-2 bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-zinc-700 rounded-lg text-zinc-300">
                    <TrendingUp size={20} />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase">Capital Usage</p>
                    <p className="text-sm text-zinc-300">Requires <span className="text-white font-bold">{capitalUsagePercent.toFixed(1)}%</span> of account</p>
                 </div>
              </div>
              {inputs.leverage > 1 && (
                <span className="px-2 py-1 bg-rose-500/20 text-rose-400 text-xs font-bold rounded border border-rose-500/30">
                   Margin Used
                </span>
              )}
           </div>

        </div>
      </div>
    </div>
  );
};