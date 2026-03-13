// ─── Polygon.io ───────────────────────────────────────────────────────────────

export interface PolygonBar {
  t: number; // timestamp ms
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  vw?: number;
  n?: number;
}

export interface PolygonAggregateResponse {
  ticker?: string;
  results?: PolygonBar[];
  status?: string;
  resultsCount?: number;
}

// ─── FMP ──────────────────────────────────────────────────────────────────────

export interface FMPProfile {
  symbol: string;
  companyName: string;
  price?: number;
  mktCap?: number;
  sector?: string;
  industry?: string;
  description?: string;
  exchange?: string;
  beta?: number;
  volAvg?: number;
  changes?: number;
  image?: string;
}

export interface FMPKeyMetrics {
  symbol?: string;
  date?: string;
  bookValuePerShare?: number;
  priceToBookRatio?: number;
  peRatio?: number;
  pbRatio?: number;
  revenuePerShare?: number;
  netIncomePerShare?: number;
  operatingCashFlowPerShare?: number;
  roe?: number;
  roa?: number;
  debtToEquity?: number;
  currentRatio?: number;
  earningsYield?: number;
  dividendYield?: number;
  marketCap?: number;
}

export interface FMPRatios {
  symbol?: string;
  date?: string;
  priceToBookRatio?: number;
  priceEarningsRatio?: number;
  returnOnEquity?: number;
  returnOnAssets?: number;
  netProfitMargin?: number;
  operatingProfitMargin?: number;
  dividendYield?: number;
  debtRatio?: number;
}

export interface FMPIncomeStatement {
  date?: string;
  netIncome?: number;
  revenue?: number;
  operatingIncome?: number;
  grossProfit?: number;
}

export interface FMPBalanceSheet {
  date?: string;
  totalAssets?: number;
  totalStockholdersEquity?: number;
  totalDebt?: number;
  cashAndCashEquivalents?: number;
}

// ─── App Models ───────────────────────────────────────────────────────────────

export interface StockSearchResult {
  ticker: string;
  name: string;
  exchange: string;
}

export interface PricePoint {
  date: string; // ISO string
  price: number;
  volume: number;
  open?: number;
  high?: number;
  low?: number;
}

export interface DailyReturn {
  date: string;
  returnValue: number;
}

export interface WatchlistItem {
  id: string;
  ticker: string;
  addedDate: string;
  lastQuantScore?: number;
  lastPrice?: number;
}

// ─── Quant Models ─────────────────────────────────────────────────────────────

export interface FactorBetas {
  marketBeta: number;
  smbBeta: number;
  hmlBeta: number;
  alpha: number;
  rSquared: number;
}

export interface FamaFrenchResult {
  ticker: string;
  betas: FactorBetas;
  rmwBeta: number;
  cmaBeta: number;
  expectedExcessReturn: number;
  riskFreeRate: number;
}

export type MomentumSignal = "Strong" | "Moderate" | "Neutral" | "Weak" | "Very Weak";
export type RiskLevel = "Low" | "Medium" | "High" | "Very High";

export interface MomentumResult {
  momentum12M: number;
  momentum6M: number;
  momentum3M: number;
  momentum1M: number;
  signal: MomentumSignal;
}

export interface VolatilityResult {
  annualizedVolatility: number;
  volatility30D: number;
  volatility90D: number;
  sharpeRatio: number;
  riskLevel: RiskLevel;
}

export interface ValueMetrics {
  bookToMarket?: number;
  peRatio?: number;
  pbRatio?: number;
  roe?: number;
  debtToEquity?: number;
  earningsYield?: number;
  dividendYield?: number;
  valueSignal: string;
}

// ─── Claude / AI ──────────────────────────────────────────────────────────────

export interface ClaudeAnalysis {
  factorImportance: {
    market: number;
    smb: number;
    hml: number;
    rmw: number;
    cma: number;
  };
  scoreWeights: {
    momentum: number;
    value: number;
    quality: number;
    size: number;
    volatility: number;
  };
  prediction: {
    expectedAnnualReturnPct: number;
    confidence: "low" | "medium" | "high";
    investmentHorizon: "short" | "medium" | "long";
    rating: "strong_buy" | "buy" | "neutral" | "sell" | "strong_sell";
  };
  insights: string[];
  keyRisks: string[];
  formulaNote: string;
  adjustedQuantScore: number;
}

// ─── Master Analysis ──────────────────────────────────────────────────────────

export interface QuantAnalysis {
  id: string;
  ticker: string;
  profile?: FMPProfile;
  analyzedAt: string;
  famaFrench?: FamaFrenchResult;
  momentum?: MomentumResult;
  volatility?: VolatilityResult;
  valueMetrics?: ValueMetrics;
  priceHistory: PricePoint[];
  claudeAnalysis?: ClaudeAnalysis;
  quantScore: number;
  quantScoreLabel: string;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface AnalyzeRequest {
  ticker: string;
  polygonKey: string;
  fmpKey: string;
  claudeKey?: string;
}
