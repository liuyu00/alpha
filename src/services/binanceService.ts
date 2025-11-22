import { DexTokenData, StabilityAnalysis } from '@/types';
import { HttpsProxyAgent } from 'https-proxy-agent';
import axios from 'axios';
import * as tunnel from 'tunnel';

const agent = tunnel.httpsOverHttp({
  proxy: { host: '127.0.0.1', port: 7890 },
});
const BASE_URL = 'https://api.dexscreener.com/latest/dex/tokens';
// const agent = new HttpsProxyAgent('http://127.0.0.1:7890');
// const agent = new HttpsProxyAgent('http://127.0.0.1:7890');

export const fetchTickerPrice = async (address: string): Promise<DexTokenData> => {
  try {
    const response = await axios.get(`${BASE_URL}/${address}`, {
       httpsAgent: agent,
    });
    const data = response.data;
    if (!data.pairs || data.pairs.length === 0) throw new Error('No pairs found for this contract address.');

    const pairs = data.pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
    const bestPair = pairs[0];

    return {
      ...bestPair,
      pairCreatedAt: bestPair.pairCreatedAt,
    } as DexTokenData;
  } catch (error) {
    console.error('DexScreener API Error:', error);
    throw error;
  }
};

export const fetchMultipleTickers = async (addresses: string[]): Promise<DexTokenData[]> => {
  try {
    const uniqueAddrs = [...new Set(addresses)];
    const url = `${BASE_URL}/${uniqueAddrs.join(',')}`;
    console.log(uniqueAddrs)
    const response = await axios.get(url, {
       httpsAgent: agent,
    });

    const data = response.data;
    if (!data.pairs) return [];

    const bestPairsMap = new Map<string, DexTokenData>();

    data.pairs.forEach((pair: any) => {
      const addr = pair.baseToken.address.toLowerCase();
      const currentBest = bestPairsMap.get(addr);
      if (!currentBest || (pair.liquidity?.usd || 0) > (currentBest.liquidity?.usd || 0)) {
        bestPairsMap.set(addr, {
          ...pair,
          pairCreatedAt: pair.pairCreatedAt,
        });
      }
    });

    return Array.from(bestPairsMap.values());
  } catch (error) {
    console.error('Multi-fetch Error:', error);
    return [];
  }
};

export const calculateAlphaStrategy = (currentPrice: number) => {
  return {
    buyPrice: currentPrice * (1 + 0.01),
    sellPrice: currentPrice * (1 - 0.003),
    spread: currentPrice * 1.01 - currentPrice * 0.997,
  };
};

export const analyzeStability = (data: DexTokenData): StabilityAnalysis => {
  const currentPrice = parseFloat(data.priceUsd);
  const h1Change = data.priceChange.h1 || 0;
  const h6Change = data.priceChange.h6 || 0;
  const volume = data.volume.h24 || 0;
  const liquidity = data.liquidity?.usd || 1;

  const priceBasisH1 = currentPrice / (1 + h1Change / 100);
  const deviationPct = Math.abs((currentPrice - priceBasisH1) / priceBasisH1) * 100;

  let rawScore = 100;

  if (liquidity < 20000) rawScore -= 50;
  else if (liquidity < 100000) rawScore -= 25;
  else if (liquidity < 500000) rawScore -= 10;

  if (deviationPct > 10) rawScore -= 40;
  else if (deviationPct > 5) rawScore -= 25;
  else if (deviationPct > 2) rawScore -= 10;

  if (h1Change < -3) rawScore -= 20;
  if (h1Change > 15) rawScore -= 20;

  const turnoverRate = volume / liquidity;
  const isAbnormal = deviationPct > 15 || turnoverRate > 20;

  if (turnoverRate < 0.05) rawScore -= 20;
  if (isAbnormal) rawScore -= 20;

  rawScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  let status: StabilityAnalysis['status'] = 'STABLE';
  if (rawScore < 40) status = 'EXTREME';
  else if (rawScore < 60) status = 'VOLATILE';
  else if (rawScore < 80) status = 'MODERATE';

  const priceVol = deviationPct > 3 ? 'HIGH' : deviationPct > 1 ? 'MEDIUM' : 'LOW';
  const volTrend = turnoverRate > 5 ? 'SPIKE' : liquidity < 50000 ? 'LOW_LIQ' : 'NORMAL';
  const trend = h1Change > 0.5 ? 'UP' : h1Change < -0.5 ? 'DOWN' : 'SIDEWAYS';

  let desc = '基准稳健，适合策略进场。';
  if (isAbnormal) desc = '⚠️ 价格严重偏离基点，建议观望。';
  else if (status === 'EXTREME') desc = '流动性不足或波动过大，止损风险极高。';
  else if (status === 'VOLATILE') desc = '波动率超过策略阈值，易触发止损。';
  else if (status === 'MODERATE') desc = '存在一定波动，请注意滑点保护。';

  return {
    score: rawScore,
    status,
    factors: {
      priceVolatility: priceVol,
      volumeTrend: volTrend,
      trend,
      abnormalMovement: isAbnormal,
    },
    description: desc,
  };
};