"use client";

import React, { useState, useEffect, useCallback } from 'react';
import PriceCard from '@/components/PriceCard';
import StabilityWidget from '@/components/StabilityWidget';
import { calculateAlphaStrategy, analyzeStability } from '@/services/binanceService';
import { CalculatedStrategy, DexTokenData, StabilityAnalysis, LoadingState } from '@/types';

export default function Page() {
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [tokensData, setTokensData] = useState<DexTokenData[]>([]);
  const [listLoading, setListLoading] = useState(LoadingState.IDLE);

  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<DexTokenData | null>(null);
  const [strategy, setStrategy] = useState<CalculatedStrategy>({ buyPrice: 0, sellPrice: 0, spread: 0 });
  const [stability, setStability] = useState<StabilityAnalysis | null>(null);
  const [customAddress, setCustomAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const get4xVolumeStatus = (createdAt?: number) => {
    if (!createdAt) return null;
    const now = Date.now();
    const diff = now - createdAt;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    if (diff < thirtyDaysMs) {
      const remainingMs = thirtyDaysMs - diff;
      const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
      return { is4x: true, remainingDays };
    }
    return null;
  };

  const fetchList = useCallback(async () => {
    if (viewMode !== 'LIST') return;
    setListLoading(LoadingState.LOADING);
    try {
      const res = await fetch('/api/market/tickers', { cache: 'no-store' });
      if (!res.ok) throw new Error('行情列表获取失败');
      const json = await res.json();
      const data: DexTokenData[] = json.data || [];
      setTokensData(data);
      setListLoading(LoadingState.SUCCESS);
    } catch (e) {
      console.error(e);
      setListLoading(LoadingState.ERROR);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchList();
    const interval = setInterval(fetchList, 15000);
    return () => clearInterval(interval);
  }, [fetchList]);

  const loadDetail = useCallback(async (address: string) => {
    setViewMode('DETAIL');
    setSelectedAddress(address);
    setError(null);
    setDetailData(null);
    try {
      const res = await fetch('/api/market/ticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      if (!res.ok) throw new Error('获取详情失败');
      const json = await res.json();
      const data: DexTokenData = json.data;
      setDetailData(data);
      const currentPrice = parseFloat(data.priceUsd);
      setStrategy(calculateAlphaStrategy(currentPrice));
      setStability(analyzeStability(data));
    } catch (err) {
      setError('无法获取链上详情。');
    }
  }, []);

  useEffect(() => {
    if (viewMode !== 'DETAIL' || !selectedAddress) return;
    const refreshDetail = async () => {
      try {
        const res = await fetch('/api/market/ticker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: selectedAddress }),
        });
        if (!res.ok) throw new Error('获取详情失败');
        const json = await res.json();
        const data: DexTokenData = json.data;
        setDetailData(data);
        const currentPrice = parseFloat(data.priceUsd);
        setStrategy(calculateAlphaStrategy(currentPrice));
        setStability(analyzeStability(data));
      } catch (e) {
        console.error(e);
      }
    };
    refreshDetail();
    const interval = setInterval(refreshDetail, 5000);
    return () => clearInterval(interval);
  }, [viewMode, selectedAddress]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAddress.trim()) {
      const addr = customAddress.trim();
      (async () => {
        try {
          await fetch('/api/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: addr }),
          });
          fetchList();
        } catch (e) {
          console.warn('保存到数据库失败', e);
        } finally {
          loadDetail(addr);
        }
      })();
    }
  };

  const handleBackToList = () => {
    setViewMode('LIST');
    setSelectedAddress(null);
    fetchList();
  };

  return (
    <>
      {viewMode === 'DETAIL' && (
        <div className="mb-6">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            返回列表
          </button>
        </div>
      )}

      {viewMode === 'LIST' && (
        <div className="animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Alpha 资产监控列表</h2>
              <p className="text-gray-400 text-sm mt-1">实时扫描合约地址，计算价格稳定度与异常波动。</p>
            </div>
            <form onSubmit={handleCustomSubmit} className="flex w-full sm:w-auto">
              <input
                type="text"
                placeholder="输入新合约地址..."
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                className="rounded-l-lg bg-gray-900 border border-gray-700 text-white focus:ring-crypto-green focus:border-crypto-green block flex-1 min-w-0 w-full text-sm p-2.5 font-mono"
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 text-sm text-black bg-gray-700 hover:bg-crypto-green hover:text黑色 rounded-r-lg font-bold transition-colors"
              >
                Go
              </button>
            </form>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-500 uppercase bg-gray-950/50 border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4">资产 / 合约</th>
                    <th className="px-6 py-4 text-right">现价 (USD)</th>
                    <th className="px-6 py-4 text-right">24H 涨跌</th>
                    <th className="px-6 py-4 text-center">稳定度</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {tokensData.length === 0 && listLoading === LoadingState.LOADING && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center">正在扫描链上数据...</td></tr>
                  )}
                  {tokensData.length === 0 && listLoading === LoadingState.SUCCESS && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-yellow-500">未找到有效数据，请检查合约列表。</td></tr>
                  )}
                  {tokensData.map((token) => {
                    const stab = analyzeStability(token);
                    const status4x = get4xVolumeStatus(token.pairCreatedAt);
                    return (
                      <tr
                        key={token.baseToken.address}
                        onClick={() => loadDetail(token.baseToken.address)}
                        className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4 font-medium text白色">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold border border-gray-700 text-gray-300 overflow-hidden relative">
                              {token.info?.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={token.info.imageUrl} alt={token.baseToken.symbol} className="w-full h-full object-cover" />
                              ) : (
                                <span>{token.baseToken.symbol.substring(0, 2)}</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-base">{token.baseToken.symbol}</div>
                                {status4x && (
                                  <div className="relative group/tooltip">
                                    <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold shadow-[0_0_8px_rgba(147,51,234,0.5)]">4X</span>
                                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                                      新币交易加成 剩余 {status4x.remainingDays} 天
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 font-mono">{token.baseToken.address.slice(0, 6)}...</div>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 border border-gray-700 ml-2">{token.chainId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-white text-lg">
                          ${parseFloat(token.priceUsd) < 1 ? parseFloat(token.priceUsd).toFixed(6) : parseFloat(token.priceUsd).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          <span className={(token.priceChange.h24 || 0) >= 0 ? 'text-crypto-green' : 'text-crypto-red'}>
                            {(token.priceChange.h24 || 0) > 0 ? '+' : ''}{(token.priceChange.h24 || 0).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 flex justify-center">
                          <StabilityWidget analysis={stab} compact />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-crypto-green group-hover:underline">详情 →</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">列表每 15 秒自动刷新。点击行查看详细交易策略。</div>
        </div>
      )}

      {viewMode === 'DETAIL' && (
        <div className="animate-in slide-in-from-right duration-300">
          <div className="mb-8 flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            {detailData && get4xVolumeStatus(detailData.pairCreatedAt) && (
              <div className="bg-gradient-to-r from-purple-900/80 to-gray-900 px-5 py-2.5 flex justify-between items-center border-b border-purple-700/30">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500 text-white p-1 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"></path></svg>
                  </div>
                  <div>
                    <span className="text-purple-100 text-sm font-bold tracking-wide">4X 交易量激活</span>
                    <span className="text-xs text-purple-300 ml-2">新币专属流动性加成</span>
                  </div>
                </div>
                <div className="text-xs font-mono text-white bg-purple-600/40 border border-purple-500/30 px-3 py-1 rounded-full">
                  剩余 {get4xVolumeStatus(detailData.pairCreatedAt)?.remainingDays} 天
                </div>
              </div>
            )}

            <div className="p-5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex items-center gap-4">
                {detailData ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl font-bold text-white border border-gray-600 shadow-lg overflow-hidden relative">
                      {detailData.info?.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={detailData.info.imageUrl} alt={detailData.baseToken.symbol} className="w全 h全 object-cover" />
                      ) : (
                        <span>{detailData.baseToken.symbol[0]}</span>
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        {detailData.baseToken.symbol} / {detailData.quoteToken.symbol}
                        <a href={detailData.url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-crypto-green transition-colors" title="Open in DexScreener">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      </h1>
                      <div className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-2">
                        <span className="bg-gray-800 px-2 py-0.5 rounded">{detailData.chainId}</span>
                        <span>{selectedAddress}</span>
                      </div>
                      {detailData.info?.websites && detailData.info.websites.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {detailData.info.websites.map((web, idx) => (
                            <a key={idx} href={web.url} target="_blank" rel="noreferrer" className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded hover:text-white hover:bg-gray-700 transition">
                              Website
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-12 flex items-center text-gray-400">加载详情中...</div>
                )}
              </div>

              {detailData && (
                <div className="text-right">
                  <div className="text-sm text-gray-400">24H 成交量</div>
                  <div className="text-white font-mono font-bold text-xl">${(detailData.volume.h24 || 0).toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>

          {error ? (
            <div className="p-8 text-center bg-red-900/20 border border-red-900 rounded-xl text-red-400">{error}</div>
          ) : !detailData ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crypto-green"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PriceCard label="买入 (Buy)" price={strategy.buyPrice} type="buy" percentageLabel="+1.0%" />
                  <PriceCard label="现价 (Current)" price={parseFloat(detailData.priceUsd)} type="current" />
                  <PriceCard label="卖出 (Sell)" price={strategy.sellPrice} type="sell" percentageLabel="-0.3%" />
                </div>
              </div>
              <div className="lg:col-span-1">
                {stability && <StabilityWidget analysis={stability} />}
                <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h4 className="text-gray-400 text-xs uppercase font-bold mb-4">流动性指标</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">池子流动性</span>
                      <span className="text-white font-mono">${(detailData.liquidity?.usd || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify之间 text-sm">
                      <span className="text-gray-500">FDV (完全稀释市值)</span>
                      <span className="text白色 font-mono">${(detailData.fdv || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">1H 涨跌幅</span>
                      <span className={`font-mono ${(detailData.priceChange.h1 || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{(detailData.priceChange.h1 || 0).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">上线时长</span>
                      <span className="text-white font-mono">{detailData.pairCreatedAt ? `${Math.floor((Date.now() - detailData.pairCreatedAt) / (24 * 60 * 60 * 1000))} 天` : '未知'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
