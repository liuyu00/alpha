import React, { useState } from 'react';

interface PriceCardProps {
  label: string;
  price: number;
  type: 'current' | 'buy' | 'sell';
  percentageLabel?: string;
}

const PriceCard: React.FC<PriceCardProps> = ({ label, price, type, percentageLabel }) => {
  const [isCopied, setIsCopied] = useState(false);

  const formatPrice = (p: number) => {
    return p.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: p < 1 ? 6 : 2,
    });
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (price <= 0) return;
    const textToCopy = price < 0.01 ? price.toFixed(10).replace(/\.0+$/, '') : price.toFixed(2);
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  let colorClass = 'text-white';
  let bgClass = 'bg-gray-850';
  let borderClass = 'border-gray-800';
  let badgeClass = '';

  if (type === 'buy') {
    colorClass = 'text-crypto-green';
    bgClass = 'bg-gray-850';
    borderClass = 'border-crypto-green/30';
    badgeClass = 'bg-crypto-green text-black';
  } else if (type === 'sell') {
    colorClass = 'text-crypto-red';
    bgClass = 'bg-gray-850';
    borderClass = 'border-crypto-red/30';
    badgeClass = 'bg-crypto-red text-white';
  } else {
    colorClass = 'text-crypto-yellow';
  }

  return (
    <div className={`p-6 rounded-xl border ${borderClass} ${bgClass} shadow-lg flex flex-col items-center justify-center relative overflow-hidden group h-32`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${type === 'buy' ? 'bg-crypto-green' : type === 'sell' ? 'bg-crypto-red' : 'bg-crypto-yellow'}`}></div>
      <div className="flex items-center gap-2 mb-2 z-10">
        <span className="text-gray-400 text-sm uppercase tracking-wider font-semibold">{label}</span>
        {percentageLabel && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${badgeClass}`}>{percentageLabel}</span>
        )}
      </div>
      <div className={`text-3xl sm:text-4xl font-mono font-bold z-10 ${colorClass} flex items-center justify-center gap-3`}>
        <span>{price > 0 ? `$${formatPrice(price)}` : '---'}</span>
        {price > 0 && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 p-1.5 rounded-md hover:bg-gray-700/50 text-gray-500 hover:text-white outline-none"
            title="复制价格"
            aria-label="Copy price"
          >
            {isCopied ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default PriceCard;