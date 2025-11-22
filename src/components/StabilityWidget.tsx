import React from 'react';
import { StabilityAnalysis } from '@/types';

interface StabilityWidgetProps {
  analysis: StabilityAnalysis;
  compact?: boolean;
}

const StabilityWidget: React.FC<StabilityWidgetProps> = ({ analysis, compact = false }) => {
  const { score, status, factors, description } = analysis;

  let colorClass = 'text-green-500';
  let bgClass = 'bg-green-900/20 border-green-800';
  let barColor = 'bg-green-500';

  if (status === 'MODERATE') {
    colorClass = 'text-yellow-500';
    bgClass = 'bg-yellow-900/20 border-yellow-800';
    barColor = 'bg-yellow-500';
  } else if (status === 'VOLATILE') {
    colorClass = 'text-orange-500';
    bgClass = 'bg-orange-900/20 border-orange-800';
    barColor = 'bg-orange-500';
  } else if (status === 'EXTREME') {
    colorClass = 'text-red-500';
    bgClass = 'bg-red-900/20 border-red-800';
    barColor = 'bg-red-500';
  }

  if (compact) {
    return (
      <div className="flex flex-col gap-1 items-center">
        <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-bold border ${bgClass} ${colorClass}`}>
          <div className={`w-2 h-2 rounded-full ${barColor} animate-pulse`}></div>
          {status} ({score})
        </div>
        {factors.abnormalMovement && (
          <span className="text-[10px] bg-red-600 text-white px-1 rounded animate-pulse">异常异动</span>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-5 ${bgClass} shadow-lg relative overflow-hidden`}>
      {factors.abnormalMovement && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold animate-pulse shadow-lg z-10">
          ⚠️ 异常波动检测
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 012 2h-2a2 2 0 01-2-2z" /></svg>
          稳定性评分
        </h3>
        <span className={`text-2xl font-mono font-bold ${colorClass}`}>{score}<span className="text-sm text-gray-400">/100</span></span>
      </div>

      <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4">
        <div className={`h-2.5 rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${score}%` }}></div>
      </div>

      <p className="text-sm text-gray-300 mb-4 font-medium border-l-2 pl-3 border-gray-600 italic">
        "{description}"
      </p>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-900/50 p-2 rounded">
          <div className="text-[10px] text-gray-500 uppercase">价格波动</div>
          <div className={`text-xs font-bold mt-1 ${factors.priceVolatility === 'HIGH' ? 'text-red-400' : 'text-white'}`}>
            {factors.priceVolatility === 'HIGH' ? '剧烈' : factors.priceVolatility === 'MEDIUM' ? '适中' : '低'}
          </div>
        </div>
        <div className="bg-gray-900/50 p-2 rounded">
          <div className="text-[10px] text-gray-500 uppercase">成交异动</div>
          <div className={`text-xs font-bold mt-1 ${factors.volumeTrend === 'SPIKE' ? 'text-yellow-400' : factors.volumeTrend === 'LOW_LIQ' ? 'text-red-400' : 'text-white'}`}>
            {factors.volumeTrend === 'SPIKE' ? '放量' : factors.volumeTrend === 'LOW_LIQ' ? '枯竭' : '正常'}
          </div>
        </div>
        <div className="bg-gray-900/50 p-2 rounded">
          <div className="text-[10px] text-gray-500 uppercase">短期趋势</div>
          <div className={`text-xs font-bold mt-1 ${factors.trend === 'UP' ? 'text-green-400' : factors.trend === 'DOWN' ? 'text-red-400' : 'text-gray-400'}`}>
            {factors.trend === 'UP' ? '上涨 ↗' : factors.trend === 'DOWN' ? '下跌 ↘' : '震荡 →'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StabilityWidget;