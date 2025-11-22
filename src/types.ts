export interface DexTokenData {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    symbol: string;
  };
  priceUsd: string;
  priceChange: {
    h1: number;
    h6: number;
    h24: number;
  };
  volume: {
    h24: number;
  };
  liquidity?: {
    usd: number;
  };
  fdv?: number;
  pairCreatedAt?: number;
  info?: {
    imageUrl?: string;
    header?: string;
    websites?: { label: string; url: string }[];
    socials?: { type: string; url: string }[];
  };
}

export interface CalculatedStrategy {
  buyPrice: number;
  sellPrice: number;
  spread: number;
}

export interface StabilityAnalysis {
  score: number;
  status: 'STABLE' | 'MODERATE' | 'VOLATILE' | 'EXTREME';
  factors: {
    priceVolatility: 'LOW' | 'MEDIUM' | 'HIGH';
    volumeTrend: 'NORMAL' | 'SPIKE' | 'LOW_LIQ';
    trend: 'UP' | 'DOWN' | 'SIDEWAYS';
    abnormalMovement: boolean;
  };
  description: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export const ALPHA_CONTRACTS = [
  { name: 'Alpha 1', symbol: 'TBD', address: '0x52b5fb4b0f6572b8c44d0251cc224513ac5eb7e7', chain: 'unknown' },
  { name: 'Alpha 2', symbol: 'TBD', address: '0xcf3232b85b43bca90e51d38cc06cc8bb8c8a3e36', chain: 'unknown' },
  { name: 'Alpha 3', symbol: 'TBD', address: '0x0e63b9c287e32a05e6b9ab8ee8df88a2760225a9', chain: 'unknown' },
  { name: 'Alpha 4', symbol: 'TBD', address: '0x0e4f6209ed984b21edea43ace6e09559ed051d48', chain: 'unknown' },
  { name: 'Alpha 5', symbol: 'TBD', address: '0x81a7da4074b8e0ed51bea40f9dcbdf4d9d4832b4', chain: 'unknown' },
  { name: 'Alpha 6', symbol: 'TBD', address: '0xe6df05ce8c8301223373cf5b969afcb1498c5528', chain: 'unknown' },
];

export const DEFAULT_CONTRACT = ALPHA_CONTRACTS[0].address;