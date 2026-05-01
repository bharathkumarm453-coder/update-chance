import React, { useMemo, useState } from 'react';
import { FlaskConical, PlayCircle, ShieldCheck, TrendingUp } from 'lucide-react';
import { Trade } from '../types';

interface BacktestLabProps {
  trades: Trade[];
}

interface SimulationResult {
  run: number;
  endingPnL: number;
  maxDrawdown: number;
  winRate: number;
}

const percentile = (values: number[], p: number) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[i];
};

export const BacktestLab: React.FC<BacktestLabProps> = ({ trades }) => {
  const [sampleSize, setSampleSize] = useState(30);
  const [runs, setRuns] = useState(250);
  const [riskPerTrade, setRiskPerTrade] = useState(100);

  const simulations = useMemo(() => {
    if (trades.length === 0) return [] as SimulationResult[];

    return Array.from({ length: runs }).map((_, runIndex) => {
      let equity = 0;
      let peak = 0;
      let maxDrawdown = 0;
      let wins = 0;

      for (let i = 0; i < sampleSize; i++) {
        const randomTrade = trades[Math.floor(Math.random() * trades.length)];
        const rr = randomTrade.entryPrice * randomTrade.quantity
          ? randomTrade.pnl / (randomTrade.entryPrice * randomTrade.quantity)
          : 0;
        const normalizedPnl = rr * riskPerTrade * 100;
        equity += normalizedPnl;

        if (normalizedPnl > 0) wins += 1;
        peak = Math.max(peak, equity);
        maxDrawdown = Math.max(maxDrawdown, peak - equity);
      }

      return {
        run: runIndex + 1,
        endingPnL: equity,
        maxDrawdown,
        winRate: (wins / sampleSize) * 100,
      };
    });
  }, [trades, sampleSize, runs, riskPerTrade]);

  const summary = useMemo(() => {
    const endings = simulations.map((s) => s.endingPnL);
    const drawdowns = simulations.map((s) => s.maxDrawdown);
    const winRates = simulations.map((s) => s.winRate);

    return {
      medianEnding: percentile(endings, 50),
      bestEnding: percentile(endings, 95),
      worstEnding: percentile(endings, 5),
      medianDrawdown: percentile(drawdowns, 50),
      ruinRisk: simulations.length ? (simulations.filter((s) => s.endingPnL < 0).length / simulations.length) * 100 : 0,
      medianWinRate: percentile(winRates, 50),
    };
  }, [simulations]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2 mb-2"><FlaskConical className="text-amber-400" />Backtest Lab</h2>
        <p className="text-zinc-400 text-sm">Monte Carlo simulation using your journal history to stress-test outcomes and risk profile.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <label className="text-sm text-zinc-300">Trades per simulation
            <input type="number" min={10} max={500} value={sampleSize} onChange={(e) => setSampleSize(Math.max(10, Number(e.target.value) || 30))} className="mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2" />
          </label>
          <label className="text-sm text-zinc-300">Simulation runs
            <input type="number" min={50} max={2000} value={runs} onChange={(e) => setRuns(Math.max(50, Number(e.target.value) || 250))} className="mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2" />
          </label>
          <label className="text-sm text-zinc-300">Risk unit ($)
            <input type="number" min={10} max={5000} value={riskPerTrade} onChange={(e) => setRiskPerTrade(Math.max(10, Number(e.target.value) || 100))} className="mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-5"><p className="text-xs text-zinc-500 uppercase">Median Ending P&L</p><p className="text-2xl font-bold text-amber-400 mt-1">${summary.medianEnding.toFixed(0)}</p></div>
        <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-5"><p className="text-xs text-zinc-500 uppercase">5th - 95th Percentile</p><p className="text-2xl font-bold text-zinc-100 mt-1">${summary.worstEnding.toFixed(0)} → ${summary.bestEnding.toFixed(0)}</p></div>
        <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-5"><p className="text-xs text-zinc-500 uppercase">Risk of Negative Outcome</p><p className="text-2xl font-bold text-rose-400 mt-1">{summary.ruinRisk.toFixed(1)}%</p></div>
        <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-5"><p className="text-xs text-zinc-500 uppercase">Median Drawdown</p><p className="text-2xl font-bold text-yellow-400 mt-1">${summary.medianDrawdown.toFixed(0)}</p></div>
        <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-5"><p className="text-xs text-zinc-500 uppercase">Median Win Rate</p><p className="text-2xl font-bold text-emerald-400 mt-1">{summary.medianWinRate.toFixed(1)}%</p></div>
        <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-5 flex items-center gap-3"><PlayCircle className="text-zinc-400" /><p className="text-zinc-300 text-sm">{runs.toLocaleString()} paths generated from your historic edge.</p></div>
      </div>

      <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-5">
        <h3 className="font-semibold text-zinc-100 mb-3 flex items-center gap-2"><ShieldCheck size={17} className="text-amber-400" />Quick guidance</h3>
        <ul className="text-sm text-zinc-300 space-y-2 list-disc ml-5">
          <li>If risk of negative outcome is above 40%, reduce risk unit per trade.</li>
          <li>Compare drawdown to your psychological pain threshold before scaling size.</li>
          <li className="flex items-center gap-1 list-none ml-[-20px]"><TrendingUp size={14} className="text-amber-500" /> Use this to validate consistency, not to predict exact profits.</li>
        </ul>
      </div>
    </div>
  );
};
