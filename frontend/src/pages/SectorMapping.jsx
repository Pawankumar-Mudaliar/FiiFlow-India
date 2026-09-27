import { useEffect, useRef, useState } from 'react';
import { hierarchy, treemap } from 'd3-hierarchy';
import { 
  Activity, 
  Star, 
  PieChart, 
  FileText, 
  Settings, 
  LogOut, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers,
  Lock
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function getFiiColor(change) {
  if (change >= 2.5) return '#00E676';
  if (change >= 1.0) return '#059669'; 
  if (change >= 0.2) return '#047857'; 
  if (change > -0.2) return '#1E293B'; 
  if (change > -1.0) return '#991B1B'; 
  if (change > -2.5) return '#DC2626'; 
  return '#FF5252';
}

export default function SectorMapping() {
  const containerRef = useRef(null);
  const [treeData, setTreeData] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 1100, height: 680 });
  const [tooltip, setTooltip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Authentication check
  const storedUser = localStorage.getItem('fiiUser');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAuthenticated = Boolean(user);

  const handleLogout = () => {
    localStorage.removeItem('fiiUser');
    navigate('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/fii/sector-treemap');
        if (res.data?.data) {
          setTreeData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load sector treemap:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      setDimensions({
        width: containerRef.current.clientWidth,
        height: Math.max(containerRef.current.clientHeight - 40, 600)
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  let sectors = [];
  let stocks = [];

  if (treeData && treeData.children?.length > 0) {
    const root = hierarchy(treeData)
      .sum(d => d.value || 0)
      .sort((a, b) => b.value - a.value);

    treemap()
      .size([dimensions.width, dimensions.height])
      .paddingOuter(4)
      .paddingInner(2)
      .paddingTop(d => (d.depth === 1 ? 26 : 2))
      .round(true)(root);

    sectors = root.descendants().filter(d => d.depth === 1);
    stocks = root.leaves();
  }

  return (
    <div className="flex h-full min-h-screen bg-[#0A0F1C] text-slate-300 font-sans selection:bg-[#00F0FF] selection:text-black">
      
      {/* SIDEBAR - Only visible if logged in */}
      {isAuthenticated && (
        <aside className="w-64 bg-[#050810] border-r border-slate-800 flex flex-col justify-between shrink-0">
          <div className="flex-1 flex flex-col">
            <nav className="p-4 space-y-1 flex-1">
              <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-lg transition-colors">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-semibold">Live FII Flows</span>
              </Link>
              <Link to="/watchlist" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-lg transition-colors">
                <Star className="w-4 h-4" />
                <span className="text-sm font-semibold">Watchlist Sync</span>
              </Link>
              <Link to="/sector-mapping" className="flex items-center space-x-3 px-4 py-3 bg-[#131B2C] text-[#00F0FF] rounded-lg border border-slate-800/50">
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

          <div className="p-6 border-t border-slate-800 bg-[#0B1120] flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{user.username}</div>
              <div className="text-xs text-slate-500">Terminal Access</div>
            </div>
          </div>
        </aside>
      )}

      {/* MAIN VIEW */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div>
            <div className="flex items-center space-x-3">
              <Layers className="text-[#00F0FF] w-6 h-6" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Institutional Sector Allocation Heatmap</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Rectangle Area = Market Cap (₹ Cr) &nbsp;|&nbsp; Color Intensity = 30-Day FII Shift (%)
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#131B2C] border border-slate-800 px-4 py-2 rounded-lg text-xs">
            <span className="text-slate-400 font-medium">Distribution</span>
            <div className="flex space-x-1">
              <span className="w-4 h-4 rounded-sm bg-[#FF5252]"></span>
              <span className="w-4 h-4 rounded-sm bg-[#DC2626]"></span>
              <span className="w-4 h-4 rounded-sm bg-[#1E293B]"></span>
              <span className="w-4 h-4 rounded-sm bg-[#059669]"></span>
              <span className="w-4 h-4 rounded-sm bg-[#00E676]"></span>
            </div>
            <span className="text-[#00E676] font-medium">Accumulation</span>
          </div>
        </header>

        {/* Treemap Container with Auth Gating */}
        <div ref={containerRef} className="flex-1 min-h-[640px] w-full bg-[#050810] border border-slate-800 rounded-xl relative overflow-hidden p-2">
          
          {/* 1. Blur and Lock Overlay for Unauthenticated Users */}
          {!isAuthenticated && (
            <div className="absolute inset-0 z-40 bg-[#050810]/75 backdrop-blur-md flex items-center justify-center p-6">
              <div className="max-w-md w-full bg-[#0B1120] border border-slate-700/80 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                <div className="w-14 h-14 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Lock className="text-[#00F0FF] w-7 h-7" />
                </div>
                
                <h2 className="text-xl font-bold text-white tracking-wide uppercase mb-2">
                  Please Login to See Clear Details
                </h2>
                
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Depository sector allocations, market cap weightings, and real-time institutional shifts are restricted to verified institutional credentials.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-[#00F0FF] text-black font-bold py-3.5 rounded-lg text-sm tracking-wider hover:bg-[#00d9e6] transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                  >
                    AUTHENTICATE TO UNLOCK
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full bg-slate-800/60 text-slate-300 font-semibold py-3 rounded-lg text-xs hover:bg-slate-800 hover:text-white transition-all border border-slate-700"
                  >
                    Request Institutional Access
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Treemap Content (blurred and non-interactive when locked) */}
          <div className={!isAuthenticated ? 'filter blur-sm opacity-30 pointer-events-none select-none' : ''}>
            {isLoading ? (
              <div className="w-full h-full min-h-[600px] flex items-center justify-center text-slate-500 text-sm">
                Synthesizing sector-level depository allocations...
              </div>
            ) : stocks.length === 0 ? (
              <div className="w-full h-full min-h-[600px] flex items-center justify-center text-slate-500 text-sm">
                No sector allocation data available. Run your institutional scraper first.
              </div>
            ) : (
              <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
                {/* Sector Headers */}
                {sectors.map(sector => (
                  <div
                    key={sector.data.name}
                    className="absolute border border-slate-700/60 pointer-events-none rounded-sm"
                    style={{
                      left: sector.x0,
                      top: sector.y0,
                      width: Math.max(sector.x1 - sector.x0, 0),
                      height: Math.max(sector.y1 - sector.y0, 0)
                    }}
                  >
                    <div className="absolute top-1 left-2 text-[11px] font-bold tracking-wider text-slate-300 uppercase truncate max-w-[90%]">
                      {sector.data.name}
                    </div>
                  </div>
                ))}

                {/* Stock Rectangles */}
                {stocks.map(stock => {
                  const w = stock.x1 - stock.x0;
                  const h = stock.y1 - stock.y0;
                  const chg = stock.data.change;
                  const isPos = chg > 0;

                  return (
                    <div
                      key={stock.data.company}
                      onMouseEnter={(e) => {
                        if (!isAuthenticated) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          data: stock.data,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className="absolute flex items-center justify-center text-white cursor-pointer transition-all hover:brightness-125 hover:z-20 border border-black/40 overflow-hidden"
                      style={{
                        left: stock.x0,
                        top: stock.y0,
                        width: Math.max(w, 0),
                        height: Math.max(h, 0),
                        backgroundColor: getFiiColor(chg)
                      }}
                    >
                      {w > 36 && h > 22 && (
                        <div className="text-center p-1 leading-tight select-none">
                          <div className="font-extrabold text-[11px] sm:text-xs tracking-tight truncate max-w-full drop-shadow">
                            {stock.data.name}
                          </div>
                          {w > 55 && h > 38 && (
                            <div className={`text-[10px] font-bold ${isPos ? 'text-white' : 'text-slate-200'}`}>
                              {isPos ? '+' : ''}{chg.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Floating Tooltip */}
          {tooltip && isAuthenticated && (
            <div
              className="fixed -translate-x-1/2 -translate-y-full bg-[#0B1120] border border-slate-700 p-3 rounded-lg shadow-2xl pointer-events-none z-50 text-xs w-52"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <div className="font-bold text-white text-sm mb-1">{tooltip.data.company}</div>
              <div className="text-slate-400 font-mono text-[11px] mb-2">{tooltip.data.name}.NS</div>
              
              <div className="space-y-1 border-t border-slate-800 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Market Cap:</span>
                  <span className="font-semibold text-white">₹{tooltip.data.value.toLocaleString()} Cr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">FII Holding:</span>
                  <span className="font-semibold text-white">{tooltip.data.holding.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">30D FII Shift:</span>
                  <span className={`font-bold flex items-center ${tooltip.data.change >= 0 ? 'text-[#00E676]' : 'text-[#FF5252]'}`}>
                    {tooltip.data.change >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {tooltip.data.change > 0 ? '+' : ''}{tooltip.data.change.toFixed(2)}%
                  </span>
                </div>
                {tooltip.data.cmp > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Price:</span>
                    <span className="font-semibold text-white">₹{tooltip.data.cmp.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}