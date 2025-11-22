import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-crypto-yellow selection:text-black">
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-crypto-green rounded-md flex items-center justify-center shadow-lg shadow-green-900/20">
              <span className="text-black font-bold text-lg">⛓</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Alpha <span className="text-crypto-green">链上狙击</span> 助手
            </h1>
          </div>
          <nav className="hidden sm:block">
            <ul className="flex space-x-6 text-sm text-gray-400">
              <li className="hover:text-white transition-colors cursor-pointer">仪表盘</li>
              <li className="hover:text-white transition-colors cursor-pointer">合约列表</li>
              <li className="hover:text-white transition-colors cursor-pointer">设置</li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="py-6 text-center text-gray-600 text-xs border-t border-gray-800 mt-auto">
        <p>
          链上实时数据由 <a href="https://dexscreener.com/" target="_blank" rel="noreferrer" className="underline hover:text-white">DexScreener API</a> 提供。
        </p>
        <p className="mt-1">注意：链上新币（Alpha）风险极高，可能存在貔貅盘或流动性枯竭风险。请自行核实合约。</p>
      </footer>
    </div>
  );
};

export default Layout;