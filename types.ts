export enum TradeDirection {
  LONG = 'Long',
  SHORT = 'Short',
}

export enum TradeStatus {
  WIN = 'Win',
  LOSS = 'Loss',
  BREAKEVEN = 'Breakeven',
  OPEN = 'Open',
}

export interface Trade {
  id: string;
  symbol: string;
  entryDate: string;
  exitDate: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  fees: number;
  setup: string;
  notes: string;
  // Computed fields
  pnl: number;
  returnPercent: number;
  status: TradeStatus;
}

export interface TradeFormData {
  symbol: string;
  entryDate: string;
  exitDate: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  fees: number;
  setup: string;
  notes: string;
}

export interface DashboardStats {
  totalTrades: number;
  winRate: number;
  netPnL: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
  expectancy: number;
}

export interface EquityPoint {
  date: string;
  equity: number;
  tradePnl: number;
  symbol: string;
}
