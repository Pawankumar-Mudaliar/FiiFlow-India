import { useState, useEffect } from 'react';
import { 
    Activity, 
    Star, 
    PieChart, 
    FileText, 
    Settings,
    Plus,
    TrendingUp,
    LogOut
} from 'lucide-react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

function Watchlist() {
  const [allData, setAllData] = useState([]);
  const [watchlistData, setWatchlistData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('fiiUser');
  const user = storedUser ? JSON.parse(storedUser) : { username: 'Guest' };

  // Load watchlist from storage so it doesn't delete when routing
  const [watchedSymbols, setWatchedSymbols] = useState(() => {
    const saved = localStorage.getItem('fiiWatchlist');
    return saved ? JSON.parse(saved) : ['HDFCBANK', 'INFY', 'TCS'];
  });

  // Save to storage every time a stock is added or removed
  useEffect(() => {
    localStorage.setItem('fiiWatchlist', JSON.stringify(watchedSymbols));
  }, [watchedSymbols]);

  const handleLogout = () => {
    localStorage.removeItem('fiiUser');
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/fii/latest');
        setAllData(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter the live data against the watched symbols (robust matching logic)
  useEffect(() => {
    if (allData.length > 0) {
      const filtered = allData.filter(stock => 
        watchedSymbols.some(symbol => {
          const safeCompany = stock.company_name ? stock.company_name.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
          const safeSymbol = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
          return safeCompany.includes(safeSymbol);
        })
      );
      setWatchlistData(filtered);
    }
  }, [allData, watchedSymbols]);

  const totalSpread = watchlistData.reduce((acc, stock) => {
      const cmp = parseFloat(stock.cmp) || 0;
      const chgPct = parseFloat(stock.chg_in_fii_pct) || 0;
      return acc + ((cmp * chgPct) * 1.5);
  }, 0);

  const handleAddStock = (e) => {
      e.preventDefault();
      const newSymbol = searchInput.trim().toUpperCase();
      if (newSymbol && !watchedSymbols.includes(newSymbol)) {
          setWatchedSymbols([...watchedSymbols, newSymbol]);
          setSearchInput('');
      }
  };

  const handleRemoveStock = (symbolToRemove) => {
      setWatchedSymbols(watchedSymbols.filter(symbol => symbol !== symbolToRemove));
  };

  const quickSync = (symbol) => {
      if (!watchedSymbols.includes(symbol)) {
          setWatchedSymbols([...watchedSymbols, symbol]);
      }
  };

  return (
    <div className="flex h-screen bg-[#0A0F1C] text-slate-300 font-sans selection:bg-[#00F0FF] selection:text-black overflow-hidden">
      
      {/* SIDEBAR - Unified to match Dashboard exactly */}
      <aside className="w-64 bg-[#050810] border-r border-slate-800 flex flex-col justify-between shrink-0">
          <div className="flex-1 flex flex-col">
              <div className="h-20 flex items-center px-6 space-x-3 border-b border-slate-800/50 shrink-0">
                  <div className="w-8 h-8 bg-[#00F0FF] rounded flex items-center justify-center">
                      <TrendingUp className="text-black w-5 h-5 stroke-[3]" />
                  </div>
                  <span className="text-white font-bold text-lg tracking-wide">FIIFlow</span>
              </div>

              <nav className="p-4 space-y-1 flex-1">
                  <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-lg transition-colors">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm font-semibold">Live FII Flows</span>
                  </Link>
                  <Link to="/watchlist" className="flex items-center space-x-3 px-4 py-3 bg-[#131B2C] text-white rounded-lg border border-slate-800/50">
                      <Star className="w-4 h-4 text-[#00F0FF]" />
                      <span className="text-sm font-semibold">Watchlist Sync</span>
                  </Link>
                  <Link to="/sector-mapping" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-lg transition-colors">
                      <PieChart className="w-4 h-4" />
                      <span className="text-sm font-semibold">Sector Mapping</span>
                  </Link>
                  <a href="#" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-lg transition-colors">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-semibold">Regulatory Ledger</span>
                  </a>
              </nav>

              <div className="p-4 border-t border-slate-800/50 space-y-1">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" />
                      <span className="text-sm font-semibold">Settings</span>
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-[#FF5252] hover:bg-[#FF5252]/10 rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-semibold">Logout</span>
                  </button>
              </div>
          </div>

          <div className="p-6 border-t border-slate-800 bg-[#0B1120]">
              <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 text-white font-bold text-lg">
                      {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                      <div className="text-sm font-bold text-white">{user.username}</div>
                      <div className="text-xs text-slate-500">Terminal Access</div>
                  </div>
              </div>
              <div className="text-[10px] text-slate-600 uppercase tracking-widest">
                  Session Active
              </div>
          </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Your Institutional Watchlist</h1>
            <p className="text-sm text-slate-400">Track bespoke accumulation spikes only for your designated positions.</p>
          </div>
          <button className="bg-[#00F0FF] text-black px-6 py-2.5 rounded font-bold text-xs tracking-wide hover:bg-[#00d9e6] transition-colors">
            ADD CUSTOM STOCK FILTER
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#131B2C] border border-slate-800 rounded-xl p-6">
            <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">Watchlist Positions</div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-white">{watchlistData.length} Stocks</div>
              <div className="text-xs font-bold text-[#00E676] bg-[#0A2E1F] px-3 py-1 rounded">Synced</div>
            </div>
            <div className="text-xs text-slate-500 mt-2">All targets matching live depository ledger feeds</div>
          </div>

          <div className="bg-[#131B2C] border border-slate-800 rounded-xl p-6">
            <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">Net Flow Spread on Watchlist</div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-white">₹{Math.abs(Math.floor(totalSpread)).toLocaleString()} Cr</div>
              <div className="text-xs font-bold text-[#00E676] bg-[#0A2E1F] px-2 py-1 rounded">+8.2%</div>
            </div>
            <div className="text-xs text-slate-500 mt-2">Net offshore buying on your watchlist selection</div>
          </div>
        </div>

        <div className="bg-[#131B2C] border border-slate-800 rounded-xl overflow-hidden mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-4 px-6 text-[10px] font-bold text-slate-500 tracking-widest uppercase">Symbol</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-500 tracking-widest uppercase">Sector</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-500 tracking-widest uppercase">Current Holding %</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-500 tracking-widest uppercase">FII Net Change (30D)</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-500 tracking-widest uppercase">Accumulation Spread</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-500 tracking-widest uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {isLoading ? (
                 <tr>
                   <td colSpan="6" className="py-8 text-center text-slate-500 text-sm">Synchronizing ledger...</td>
                 </tr>
              ) : watchlistData.length === 0 ? (
                 <tr>
                   <td colSpan="6" className="py-8 text-center text-slate-500 text-sm">No designated targets found in live feed. Add symbols below.</td>
                 </tr>
              ) : (
                watchlistData.map((stock, index) => {
                  const cmp = parseFloat(stock.cmp);
                  const holdPct = parseFloat(stock.fii_hold_pct);
                  const chgPct = parseFloat(stock.chg_in_fii_pct);
                  const isPositive = chgPct > 0;
                  const isNegative = chgPct < 0;

                  const inferredSymbol = watchedSymbols.find(sym => stock.company_name.toUpperCase().replace(/[^A-Z0-9]/g, '').includes(sym.replace(/[^A-Z0-9]/g, ''))) || stock.company_name;

                  return (
                    <tr key={stock.id || index} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-6 text-sm font-bold text-white">{inferredSymbol}</td>
                      <td className="py-4 px-6 text-sm text-slate-400">Equities</td>
                      <td className="py-4 px-6 text-sm font-bold text-white">{!isNaN(holdPct) ? holdPct.toFixed(2) : "0.00"}%</td>
                      <td className={`py-4 px-6 text-sm font-bold ${
                        isPositive ? 'text-[#00E676]' : isNegative ? 'text-[#FF5252]' : 'text-slate-400'
                      }`}>
                        {isPositive ? "+" : ""}{!isNaN(chgPct) ? chgPct.toFixed(2) : "0.00"}%
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-300">
                        {isNegative ? '-' : ''}₹{Math.abs(Math.floor((cmp * chgPct) * 1.5)).toLocaleString()} Cr
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleRemoveStock(inferredSymbol)}
                          className="border border-[#FF5252]/50 text-[#FF5252] bg-[#3A1015]/30 hover:bg-[#3A1015] px-4 py-1.5 rounded text-[10px] font-bold tracking-widest transition-colors"
                        >
                          REMOVE TARGET
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-[#131B2C] border border-slate-800 rounded-xl p-10 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Plus className="text-[#00F0FF] w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Add Stock to Institutional Tracking</h3>
            <p className="text-sm text-slate-400 mb-8 max-w-sm">
                Enter NSE/BSE ticker symbol. FIIFlow immediately maps live regulatory ledger historical spreads.
            </p>
            
            <form onSubmit={handleAddStock} className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-xl mb-8">
                <input 
                    type="text" 
                    placeholder="Search stock symbol (e.g. RELIANCE)..." 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="flex-1 bg-[#050810] border border-slate-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00F0FF] transition-colors"
                />
                <button type="submit" className="bg-[#00F0FF] text-black px-6 py-3 rounded-lg font-bold text-xs tracking-wide hover:bg-[#00d9e6] transition-colors whitespace-nowrap w-full sm:w-auto">
                    SYNC SECURITY
                </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider mr-2">Quick Sync Targets:</span>
                {['KOTAKBANK', 'LT', 'SBIN', 'AXISBANK'].map(sym => (
                    <button 
                        key={sym} 
                        onClick={() => quickSync(sym)}
                        className="bg-[#0A0F1C] border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 px-3 py-1.5 rounded transition-colors"
                    >
                        + {sym}
                    </button>
                ))}
            </div>
        </div>

      </main>
    </div>
  );
}

export default Watchlist;