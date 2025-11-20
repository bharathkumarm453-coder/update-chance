import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  List, 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Wallet,
  Menu,
  Upload,
  Download,
  Calculator,
  Sparkles
} from 'lucide-react';
import { Trade, TradeFormData, TradeStatus, TradeDirection, DashboardStats, EquityPoint } from './types';
import { TradeForm } from './components/TradeForm';
import { StatsCard } from './components/StatsCard';
import { EquityChart } from './components/EquityChart';
import { TradeList } from './components/TradeList';
import { PositionSizer } from './components/PositionSizer';
import { AIAnalyst } from './components/AIAnalyst';

// Initial Mock Data
const MOCK_TRADES: Trade[] = [
  { id: '1', symbol: 'AAPL', entryDate: '2023-10-01', exitDate: '2023-10-02', direction: TradeDirection.LONG, entryPrice: 150, exitPrice: 155, quantity: 100, fees: 2, setup: 'Breakout', notes: 'Strong volume on entry', pnl: 498, returnPercent: 3.3, status: TradeStatus.WIN },
  { id: '2', symbol: 'TSLA', entryDate: '2023-10-03', exitDate: '2023-10-03', direction: TradeDirection.SHORT, entryPrice: 250, exitPrice: 255, quantity: 50, fees: 2, setup: 'Reversal', notes: 'Faded too early', pnl: -252, returnPercent: -2.0, status: TradeStatus.LOSS },
  { id: '3', symbol: 'NVDA', entryDate: '2023-10-05', exitDate: '2023-10-06', direction: TradeDirection.LONG, entryPrice: 450, exitPrice: 465, quantity: 20, fees: 1, setup: 'Trend Following', notes: 'Good patience', pnl: 299, returnPercent: 3.3, status: TradeStatus.WIN },
  { id: '4', symbol: 'AMD', entryDate: '2023-10-08', exitDate: '2023-10-08', direction: TradeDirection.LONG, entryPrice: 110, exitPrice: 108, quantity: 100, fees: 2, setup: 'Breakout', notes: 'False breakout', pnl: -202, returnPercent: -1.8, status: TradeStatus.LOSS },
  { id: '5', symbol: 'SPY', entryDate: '2023-10-10', exitDate: '2023-10-11', direction: TradeDirection.LONG, entryPrice: 430, exitPrice: 435, quantity: 50, fees: 1, setup: 'Bounce', notes: 'Market support hold', pnl: 249, returnPercent: 1.1, status: TradeStatus.WIN },
];

function App() {
  const [trades, setTrades] = useState<Trade[]>(MOCK_TRADES);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<'dashboard' | 'journal' | 'sizer' | 'analysis'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Splash Screen State
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fading out after 2.2s (animation takes ~1.8s)
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2200);

    // Remove from DOM after fade completes
    const removeTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2700);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    }
  }, []);

  // Sort trades by date ascending for chart, descending for list
  const sortedTrades = useMemo(() => [...trades].sort((a, b) => new Date(b.exitDate).getTime() - new Date(a.exitDate).getTime()), [trades]);
  const chronologicalTrades = useMemo(() => [...trades].sort((a, b) => new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime()), [trades]);

  // Calculate Stats
  const stats: DashboardStats = useMemo(() => {
    let totalTrades = trades.length;
    if (totalTrades === 0) return { totalTrades: 0, winRate: 0, netPnL: 0, profitFactor: 0, avgWin: 0, avgLoss: 0, bestTrade: 0, worstTrade: 0, expectancy: 0 };

    const wins = trades.filter(t => t.pnl > 0);
    const losses = trades.filter(t => t.pnl <= 0);
    
    const totalWinPnl = wins.reduce((sum, t) => sum + t.pnl, 0);
    const totalLossPnl = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
    const netPnL = trades.reduce((sum, t) => sum + t.pnl, 0);

    const avgWin = wins.length ? totalWinPnl / wins.length : 0;
    const avgLoss = losses.length ? totalLossPnl / losses.length : 0; // Keep positive for ratio

    return {
      totalTrades,
      winRate: (wins.length / totalTrades) * 100,
      netPnL,
      profitFactor: totalLossPnl === 0 ? totalWinPnl : totalWinPnl / totalLossPnl,
      avgWin,
      avgLoss,
      bestTrade: Math.max(...trades.map(t => t.pnl)),
      worstTrade: Math.min(...trades.map(t => t.pnl)),
      expectancy: (avgWin * (wins.length/totalTrades)) - (avgLoss * (losses.length/totalTrades))
    };
  }, [trades]);

  // Calculate Equity Curve
  const equityCurve: EquityPoint[] = useMemo(() => {
    let currentEquity = 0;
    return chronologicalTrades.map(trade => {
      currentEquity += trade.pnl;
      return {
        date: trade.exitDate,
        equity: currentEquity,
        tradePnl: trade.pnl,
        symbol: trade.symbol,
      };
    });
  }, [chronologicalTrades]);

  const handleAddTrade = (data: TradeFormData) => {
    let grossPnl = 0;
    if (data.direction === TradeDirection.LONG) {
      grossPnl = (data.exitPrice - data.entryPrice) * data.quantity;
    } else {
      grossPnl = (data.entryPrice - data.exitPrice) * data.quantity;
    }
    const netPnl = grossPnl - data.fees;
    
    const newTrade: Trade = {
      ...data,
      id: Date.now().toString(),
      pnl: netPnl,
      returnPercent: (netPnl / (data.entryPrice * data.quantity)) * 100,
      status: netPnl > 0 ? TradeStatus.WIN : netPnl < 0 ? TradeStatus.LOSS : TradeStatus.BREAKEVEN
    };

    setTrades(prev => [newTrade, ...prev]);
    setShowForm(false);
  };

  const handleDeleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleExportCSV = () => {
    if (trades.length === 0) {
      alert("No trades to export.");
      return;
    }

    const headers = ["ID", "Symbol", "Entry Date", "Exit Date", "Direction", "Entry Price", "Exit Price", "Quantity", "Fees", "Setup", "Notes", "PnL", "Status"];
    
    const csvRows = [
      headers.join(','),
      ...trades.map(trade => {
        // Escape quotes and wrap in quotes if needed
        const escape = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;
        
        return [
          escape(trade.id),
          escape(trade.symbol),
          escape(trade.entryDate),
          escape(trade.exitDate),
          escape(trade.direction),
          escape(trade.entryPrice),
          escape(trade.exitPrice),
          escape(trade.quantity),
          escape(trade.fees),
          escape(trade.setup),
          escape(trade.notes),
          escape(trade.pnl),
          escape(trade.status)
        ].join(',');
      })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      processCSV(text);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const processCSV = (csvText: string) => {
    const lines = csvText.split(/\r\n|\n/);
    if (lines.length < 2) {
      alert("CSV file appears empty or invalid.");
      return;
    }

    // Simple parsing logic
    // Try to map common headers: Symbol, Date, Type/Side, Price, Qty, Fees, Setup
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
    const newTrades: Trade[] = [];

    const getValue = (row: string[], possibleHeaders: string[]) => {
      const index = headers.findIndex(h => possibleHeaders.some(ph => h.includes(ph)));
      return index !== -1 ? row[index] : '';
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by comma, respecting quotes
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.trim().replace(/^"|"$/g, ''));
      
      // Map fields
      const symbol = getValue(values, ['symbol', 'ticker']).toUpperCase() || 'UNKNOWN';
      const directionStr = getValue(values, ['direction', 'side', 'type']).toLowerCase();
      const direction = directionStr.includes('short') ? TradeDirection.SHORT : TradeDirection.LONG;
      
      let entryDate = getValue(values, ['entry date', 'open date', 'date']);
      let exitDate = getValue(values, ['exit date', 'close date']);
      
      // Basic date sanitization to YYYY-MM-DD
      try {
        if (entryDate) entryDate = new Date(entryDate).toISOString().split('T')[0];
        else entryDate = new Date().toISOString().split('T')[0];
        
        if (exitDate) exitDate = new Date(exitDate).toISOString().split('T')[0];
        else exitDate = entryDate;
      } catch (e) {
        entryDate = new Date().toISOString().split('T')[0];
        exitDate = entryDate;
      }
      
      const entryPrice = parseFloat(getValue(values, ['entry price', 'price in', 'entry'])) || 0;
      const exitPrice = parseFloat(getValue(values, ['exit price', 'price out', 'exit'])) || 0;
      const quantity = parseFloat(getValue(values, ['quantity', 'qty', 'size', 'shares'])) || 1;
      const fees = parseFloat(getValue(values, ['fees', 'comm', 'commission'])) || 0;
      
      const setup = getValue(values, ['setup', 'strategy']) || '';
      const notes = getValue(values, ['notes', 'comments']) || '';

      // Calculations
      let grossPnl = 0;
      if (direction === TradeDirection.LONG) {
        grossPnl = (exitPrice - entryPrice) * quantity;
      } else {
        grossPnl = (entryPrice - exitPrice) * quantity;
      }
      const netPnl = grossPnl - fees;
      const returnPercent = entryPrice && quantity ? (netPnl / (entryPrice * quantity)) * 100 : 0;

      if (symbol !== 'UNKNOWN' && entryPrice > 0) {
        const trade: Trade = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          symbol,
          entryDate,
          exitDate,
          direction,
          entryPrice,
          exitPrice,
          quantity,
          fees,
          setup,
          notes,
          pnl: netPnl,
          returnPercent,
          status: netPnl > 0 ? TradeStatus.WIN : netPnl < 0 ? TradeStatus.LOSS : TradeStatus.BREAKEVEN
        };
        newTrades.push(trade);
      }
    }

    if (newTrades.length > 0) {
      setTrades(prev => [...newTrades, ...prev]);
      alert(`Successfully imported ${newTrades.length} trades.`);
    } else {
      alert("No valid trades found in CSV. Please check your file format.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-300 flex font-sans selection:bg-amber-500/30 relative">
      
      {/* Splash Screen Overlay */}
      {isLoading && (
         <div className={`fixed inset-0 z-[100] bg-zinc-950 flex items-center justify-center transition-opacity duration-700 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
             <div className="relative flex items-center justify-center">
                <svg className="absolute w-96 h-48 overflow-visible pointer-events-none">
                   <ellipse 
                      cx="192" 
                      cy="96" 
                      rx="160" 
                      ry="70" 
                      fill="none" 
                      stroke="#facc15" 
                      strokeWidth="2"
                      className="animate-draw"
                   />
                </svg>
                <span className="text-6xl font-bold text-zinc-100 tracking-tight z-10 font-serif italic animate-fade-in">Chance</span>
             </div>
         </div>
      )}

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 right-4 z-50 p-2 bg-zinc-800 rounded-lg md:hidden"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-800/50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
        {/* Animated Logo Section */}
        <div className="h-24 flex items-center justify-center border-b border-zinc-800/50 relative overflow-hidden">
           <div className="relative flex items-center justify-center w-full h-full">
              <svg className="absolute w-32 h-16 overflow-visible pointer-events-none">
                 <ellipse 
                    cx="64" 
                    cy="32" 
                    rx="50" 
                    ry="22" 
                    fill="none" 
                    stroke="#facc15" 
                    strokeWidth="1.5"
                    className="animate-draw"
                 />
              </svg>
              <span className="text-2xl font-bold text-zinc-100 tracking-tight z-10 font-serif italic">Chance</span>
           </div>
        </div>

        <nav className="p-4 space-y-2 mt-2">
          <button 
            onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'dashboard' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button 
            onClick={() => { setView('journal'); setMobileMenuOpen(false); }} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'journal' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
          >
            <List size={20} />
            <span className="font-medium">Journal</span>
          </button>

          <button 
            onClick={() => { setView('sizer'); setMobileMenuOpen(false); }} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'sizer' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
          >
            <Calculator size={20} />
            <span className="font-medium">Position Sizer</span>
          </button>
           <button 
            onClick={() => { setView('analysis'); setMobileMenuOpen(false); }} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${view === 'analysis' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
          >
            <Sparkles size={20} />
            <span className="font-medium">AI Analysis</span>
          </button>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-zinc-800/50">
          <button 
            onClick={() => setShowForm(true)}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <PlusCircle size={20} />
            Add Trade
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden">
        
        <div className="mb-8">
           <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-100 mb-1">
             {view === 'dashboard' && 'Dashboard'}
             {view === 'journal' && 'Trade Journal'}
             {view === 'sizer' && 'Position Sizer'}
             {view === 'analysis' && 'AI Analysis'}
           </h1>
           <p className="text-zinc-500 text-sm">Welcome back, check your performance.</p>
        </div>

        {/* View: Dashboard */}
        {view === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard 
                title="Net P&L" 
                value={`$${stats.netPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
                trend={stats.netPnL >= 0 ? 'up' : 'down'}
                colorClass={stats.netPnL >= 0 ? 'text-amber-400' : 'text-rose-400'}
                icon={<DollarSign size={20} />}
              />
              <StatsCard 
                title="Win Rate" 
                value={`${stats.winRate.toFixed(1)}%`}
                icon={<TrendingUp size={20} />}
                colorClass={stats.winRate > 50 ? 'text-amber-400' : stats.winRate > 30 ? 'text-yellow-400' : 'text-rose-400'}
              />
               <StatsCard 
                title="Profit Factor" 
                value={stats.profitFactor.toFixed(2)}
                icon={<Activity size={20} />}
              />
               <StatsCard 
                title="Expectancy" 
                value={`$${stats.expectancy.toFixed(2)}`}
                subValue="Per Trade"
                icon={<Wallet size={20} />}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Equity Curve */}
              <div className="lg:col-span-2 bg-zinc-800 border border-zinc-700/50 rounded-xl p-5 h-96">
                <h3 className="text-zinc-100 font-bold mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-amber-500" />
                  Cumulative P&L
                </h3>
                <EquityChart data={equityCurve} />
              </div>

              {/* Secondary Stats */}
              <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl p-5 h-96 flex flex-col justify-between">
                 <div>
                    <h3 className="text-zinc-100 font-bold mb-4">Average Stats</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
                        <p className="text-xs text-zinc-500 uppercase mb-1">Avg Win</p>
                        <p className="text-xl font-bold text-amber-400">+${stats.avgWin.toFixed(2)}</p>
                      </div>
                      <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
                        <p className="text-xs text-zinc-500 uppercase mb-1">Avg Loss</p>
                        <p className="text-xl font-bold text-rose-400">-${stats.avgLoss.toFixed(2)}</p>
                      </div>
                       <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
                        <p className="text-xs text-zinc-500 uppercase mb-1">Risk / Reward Ratio</p>
                        <p className="text-xl font-bold text-zinc-300">1 : {(stats.avgWin / (stats.avgLoss || 1)).toFixed(2)}</p>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
            
            {/* Recent Trades Teaser */}
            <div>
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-zinc-100">Recent Trades</h3>
                 <button onClick={() => setView('journal')} className="text-sm text-amber-500 hover:text-amber-400">View All</button>
              </div>
              <TradeList trades={sortedTrades.slice(0, 5)} onDelete={handleDeleteTrade} />
            </div>

          </div>
        )}

        {/* View: Journal */}
        {view === 'journal' && (
          <div className="animate-fade-in">
             <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="bg-zinc-800 p-1 rounded-lg inline-flex border border-zinc-700">
                   <span className="px-3 py-1 text-sm text-zinc-400">All Trades ({sortedTrades.length})</span>
                </div>
                <div className="flex gap-3">
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept=".csv" 
                      className="hidden" 
                   />
                   <button 
                      onClick={handleImportClick}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 flex items-center gap-2 text-sm font-medium transition-colors"
                   >
                      <Upload size={16} />
                      Import CSV
                   </button>
                   <button 
                      onClick={handleExportCSV}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 flex items-center gap-2 text-sm font-medium transition-colors"
                   >
                      <Download size={16} />
                      Export CSV
                   </button>
                   <button 
                      onClick={() => setShowForm(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
                   >
                      <PlusCircle size={16} />
                      Add Trade
                   </button>
                </div>
             </div>
             <TradeList trades={sortedTrades} onDelete={handleDeleteTrade} />
          </div>
        )}

        {/* View: Position Sizer */}
        {view === 'sizer' && (
           <div className="animate-fade-in">
              <PositionSizer />
           </div>
        )}

        {/* View: AI Analysis */}
        {view === 'analysis' && (
           <div className="h-[calc(100vh-200px)] animate-fade-in">
              <AIAnalyst trades={trades} />
           </div>
        )}


      </main>

      {/* Modal */}
      {showForm && (
        <TradeForm onSave={handleAddTrade} onCancel={() => setShowForm(false)} />
      )}

    </div>
  );
}

export default App;