import { useState, useEffect } from 'react';
import {
    Activity,
    Star,
    PieChart,
    FileText,
    Settings,
    TrendingUp,
    LogOut,
    Search,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCcw,
    Lightbulb,
    Download,
    BarChart2,
    Loader2,
    Lock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function HistoricalAnalysis() {
    const navigate = useNavigate();
    
    // --- Auth Check ---
    const storedUser = localStorage.getItem('fiiUser');
    const isAuthenticated = Boolean(storedUser);
    const user = isAuthenticated ? JSON.parse(storedUser) : { username: 'Guest' };

    // --- Dynamic States ---
    const [searchInput, setSearchInput] = useState('HDFCBANK');
    const [activeSymbol, setActiveSymbol] = useState('HDFCBANK');

    const [chartData, setChartData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [kpiData, setKpiData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('fiiUser');
        navigate('/login');
    };

    // --- Data Fetching Logic ---
    useEffect(() => {
        const fetchHistoricalData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get(`/fii/history/${activeSymbol}`);
                const data = response.data.data;

                if (!data || data.length === 0) {
                    setError(`No historical records found for ${activeSymbol}`);
                    setChartData([]);
                    setTableData([]);
                    setKpiData(null);
                    return;
                }

                // 1. Format Chart Data (Ascending order for Recharts)
                const formattedChart = [...data].reverse().map(item => ({
                    month: item.period_name || item.date,
                    current: parseFloat(item.fii_holding_pct) || 0,
                    prior: parseFloat(item.prior_holding_pct) || (parseFloat(item.fii_holding_pct) - 2),
                }));
                setChartData(formattedChart);

                // 2. Format Table Data (Descending order)
                setTableData(data);

                // 3. Extract KPIs from the most recent record
                const latest = data[0];
                const trailing12M = data.length > 4 ? data[4] : data[data.length - 1];

                setKpiData({
                    currentHolding: parseFloat(latest.fii_holding_pct),
                    latestChange: parseFloat(latest.chg_in_fii_pct) || 0,
                    annualChange: parseFloat(latest.fii_holding_pct) - parseFloat(trailing12M.fii_holding_pct),
                    latestFlow: parseFloat(latest.estimated_flow) || 0,
                    annualFlow: data.slice(0, 4).reduce((sum, row) => sum + (parseFloat(row.estimated_flow) || 0), 0)
                });

            } catch (err) {
                console.error("Error fetching historical data:", err);
                setError("Failed to connect to the database or route not found.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistoricalData();
    }, [activeSymbol]);

    const handleRunAnalysis = () => {
        if (searchInput.trim()) {
            setActiveSymbol(searchInput.trim().toUpperCase());
        }
    };

    return (
        <div className="flex h-screen bg-[#0A0F1C] text-slate-300 font-sans selection:bg-[#00F0FF] selection:text-black overflow-hidden">

            {/* SIDEBAR - Hidden if not logged in */}
            {isAuthenticated && (
                <aside className="w-64 bg-[#050810] border-r border-slate-800 flex flex-col justify-between shrink-0">
                    <div className="flex-1 flex flex-col">
                        <div className="h-20 flex items-center px-6 space-x-3 border-b border-slate-800/50 shrink-0">
                            <div className="w-8 h-8 bg-[#00F0FF] rounded flex items-center justify-center">
                                <TrendingUp className="text-black w-5 h-5 stroke-[3]" />
                            </div>
                            <span className="text-white font-bold text-lg tracking-wide">FIIFlow Terminal</span>
                        </div>

                        <nav className="p-4 space-y-1 flex-1">
                            <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-lg transition-colors">
                                <Activity className="w-4 h-4" />
                                <span className="text-sm font-semibold">Live FII Flows</span>
                            </Link>
                            <Link to="/watchlist" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-lg transition-colors">
                                <Star className="w-4 h-4" />
                                <span className="text-sm font-semibold">Watchlist Sync</span>
                            </Link>
                            <Link to="/sector-mapping" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-lg transition-colors">
                                <PieChart className="w-4 h-4" />
                                <span className="text-sm font-semibold">Sector Mapping</span>
                            </Link>
                            <Link to="/historicalanalysis" className="flex items-center space-x-3 px-4 py-3 bg-[#131B2C] text-white rounded-lg border border-slate-800/50">
                                <BarChart2 className="w-4 h-4 text-[#00F0FF]" />
                                <span className="text-sm font-semibold">Historical Analysis</span>
                            </Link>
                        </nav>

                        <div className="p-4 border-t border-slate-800/50 space-y-1">
                            <Link to="/settings" className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-lg transition-colors">
                                <Settings className="w-4 h-4" />
                                <span className="text-sm font-semibold">Settings</span>
                            </Link>
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
            )}

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto relative">

                {/* Top Secondary Nav */}
                <div className="sticky top-0 z-20 bg-[#0A0F1C]/95 backdrop-blur border-b border-slate-800 px-8 py-4 flex justify-between items-center text-sm font-medium">
                    <div className="flex items-center space-x-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 bg-[#00E676] rounded-full"></span>
                        <span>LIVE FEED <span className="text-slate-300">Database Synced</span></span>
                    </div>
                </div>

                <div className="p-8 max-w-7xl mx-auto relative">
                    
                    {/* 1. LOCK OVERLAY FOR GUESTS - POSITIONED AT TOP OF VIEWPORT */}
                    {!isAuthenticated && (
                        <>
                            {/* Invisible layer to block clicks on the blurred background */}
                            <div className="absolute inset-0 z-30 cursor-not-allowed"></div>
                            
                            {/* The lock box itself, anchored near the top instead of centered vertically */}
                            <div className="absolute top-[15vh] left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-6">
                                <div className="w-full bg-[#0B1120] border border-slate-700/80 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                                    <div className="w-14 h-14 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                        <Lock className="text-[#00F0FF] w-7 h-7" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white tracking-wide uppercase mb-2">
                                        Please Login to use advanced features
                                    </h2>
                                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                        Historical flow analysis, algorithmic trend detection, and detailed export capabilities are restricted to verified institutional credentials.
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
                        </>
                    )}

                    {/* 2. MAIN CONTENT (Blurred if logged out) */}
                    <div className={!isAuthenticated ? 'filter blur-sm opacity-30 pointer-events-none select-none space-y-8' : 'space-y-8'}>
                        <header className="flex justify-between items-end">
                            <div>
                                <div className="flex items-center space-x-2 text-[#00F0FF] text-xs font-bold tracking-widest uppercase mb-3">
                                    <span className="w-8 h-px bg-[#00F0FF]"></span>
                                    <span>Institutional Intelligence Report</span>
                                </div>
                                <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Historical FII Holding Analysis</h1>
                                <p className="text-slate-400">Compare disclosed foreign ownership, net flows and price context across periods.</p>
                            </div>
                        </header>

                        {/* INTERACTIVE FILTER BAR */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-[#131B2C] border border-slate-800 rounded-lg p-2.5 flex flex-col col-span-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">Search Stock Symbol</span>
                                <div className="flex items-center text-white px-2">
                                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRunAnalysis()}
                                        className="flex-1 font-semibold text-sm bg-transparent outline-none uppercase placeholder:text-slate-600"
                                        placeholder="e.g. RELIANCE, TCS..."
                                    />
                                </div>
                            </div>
                            <div className="bg-[#131B2C] border border-slate-800 rounded-lg p-2.5 flex flex-col">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">From</span>
                                <div className="flex items-center text-white px-2 cursor-not-allowed opacity-50">
                                    <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                                    <span className="flex-1 font-semibold text-sm">All Time</span>
                                </div>
                            </div>
                            <div className="bg-[#131B2C] border border-slate-800 rounded-lg p-2.5 flex flex-col">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">To</span>
                                <div className="flex items-center text-white px-2 cursor-not-allowed opacity-50">
                                    <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                                    <span className="flex-1 font-semibold text-sm">Latest</span>
                                </div>
                            </div>
                            <button
                                onClick={handleRunAnalysis}
                                className="md:col-span-1 bg-[#00F0FF] text-black py-4 rounded-lg font-bold text-sm tracking-widest uppercase hover:bg-[#00d9e6] transition-colors flex justify-center items-center"
                            >
                                <BarChart2 className="w-5 h-5 mr-2" /> Analyze
                            </button>
                        </div>

                        {/* ERROR OR LOADING STATES */}
                        {isLoading ? (
                            <div className="w-full h-96 flex flex-col items-center justify-center text-[#00F0FF]">
                                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                                <p className="font-bold tracking-widest uppercase text-sm">Querying Database...</p>
                            </div>
                        ) : error ? (
                            <div className="w-full bg-[#3A1015] border border-[#FF5252] text-[#FF5252] rounded-xl p-8 text-center">
                                <h3 className="font-bold text-xl mb-2">Analysis Failed</h3>
                                <p>{error}</p>
                            </div>
                        ) : (
                            <>
                                {/* KPI Row (Dynamic) */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-[#131B2C] border border-[#00F0FF]/30 rounded-xl p-5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F0FF]/5 rounded-bl-full pointer-events-none"></div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Current FII Holding</div>
                                        <div className="flex items-end justify-between mb-2">
                                            <div className="text-3xl font-bold text-white">{kpiData?.currentHolding?.toFixed(2)}%</div>
                                            <div className={`text-xs font-bold px-2 py-1 rounded ${kpiData?.latestChange >= 0 ? 'text-[#00E676] bg-[#0A2E1F]' : 'text-[#FF5252] bg-[#3A1015]'}`}>
                                                {kpiData?.latestChange >= 0 ? '+' : ''}{kpiData?.latestChange?.toFixed(2)} pp
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500">Latest disclosed data</div>
                                    </div>
                                    <div className="bg-[#131B2C] border border-slate-800 rounded-xl p-5">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">12M Holding Change</div>
                                        <div className="flex items-end justify-between mb-2">
                                            <div className="text-3xl font-bold text-white">{kpiData?.annualChange > 0 ? '+' : ''}{kpiData?.annualChange?.toFixed(2)} pp</div>
                                        </div>
                                        <div className="text-xs text-slate-500">Trailing 4 periods</div>
                                    </div>
                                    <div className="bg-[#131B2C] border border-slate-800 rounded-xl p-5">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Estimated Net Inflow (YTD)</div>
                                        <div className="flex items-end justify-between mb-2">
                                            <div className={`text-3xl font-bold ${kpiData?.annualFlow >= 0 ? 'text-white' : 'text-[#FF5252]'}`}>
                                                {kpiData?.annualFlow < 0 ? '-' : ''}₹{Math.abs(kpiData?.annualFlow || 0).toLocaleString()} Cr
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500">Trailing 4 periods total</div>
                                    </div>
                                    <div className="bg-[#131B2C] border border-slate-800 rounded-xl p-5">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Latest Period Flow</div>
                                        <div className="flex items-end justify-between mb-2">
                                            <div className={`text-3xl font-bold ${kpiData?.latestFlow >= 0 ? 'text-white' : 'text-[#FF5252]'}`}>
                                                {kpiData?.latestFlow < 0 ? '-' : ''}₹{Math.abs(kpiData?.latestFlow || 0).toLocaleString()} Cr
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500">Most recent ledger snapshot</div>
                                    </div>
                                </div>

                                {/* Chart and Comparison Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-[#131B2C] border border-slate-800 rounded-xl p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-1">FII Holding Trend</h3>
                                                <p className="text-xs text-slate-500">{activeSymbol} · Disclosed holding (%)</p>
                                            </div>
                                            <div className="flex space-x-4 text-xs font-medium">
                                                <div className="flex items-center text-slate-300"><span className="w-2 h-2 rounded-full bg-[#00F0FF] mr-2"></span>Reported Holding</div>
                                            </div>
                                        </div>

                                        <div className="h-64 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} domain={['dataMin - 1', 'dataMax + 1']} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                                                        itemStyle={{ color: '#00F0FF' }}
                                                    />
                                                    <Line type="monotone" dataKey="current" name="Holding %" stroke="#00F0FF" strokeWidth={3} dot={{ fill: '#00F0FF', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Period Comparison */}
                                    <div className="bg-[#131B2C] border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-1">Activity Context</h3>
                                            <p className="text-xs text-slate-500 mb-6">{activeSymbol} algorithmic assessment</p>

                                            <div className="space-y-4 text-sm">
                                                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                                    <span className="text-slate-400">Trend Status</span>
                                                    <span className={`font-bold ${kpiData?.latestChange >= 0 ? 'text-[#00E676]' : 'text-[#FF5252]'}`}>
                                                        {kpiData?.latestChange > 0.5 ? 'Strong Accumulation' : kpiData?.latestChange > 0 ? 'Mild Accumulation' : kpiData?.latestChange < -0.5 ? 'Heavy Distribution' : 'Mild Distribution'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                                    <span className="text-slate-400">Recent Peak</span>
                                                    <span className="font-bold text-white">
                                                        {Math.max(...chartData.map(d => d.current)).toFixed(2)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded-lg p-3 flex items-center text-[#00F0FF] text-xs font-bold">
                                            <Lightbulb className="w-4 h-4 mr-2" />
                                            Database fully mapped. Values update dynamically.
                                        </div>
                                    </div>
                                </div>

                                {/* Table (Dynamic) */}
                                <div className="bg-[#131B2C] border border-slate-800 rounded-xl overflow-hidden pb-4">
                                    <div className="flex justify-between items-center p-6 border-b border-slate-800">
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1">Detailed holding history ({activeSymbol})</h3>
                                            <p className="text-xs text-slate-500">Chronological FII ownership and estimated transaction spread</p>
                                        </div>
                                        <button className="flex items-center text-[#00F0FF] text-xs font-bold tracking-widest uppercase border border-[#00F0FF]/30 hover:bg-[#00F0FF]/10 px-4 py-2 rounded transition-colors">
                                            <Download className="w-4 h-4 mr-2" /> Export CSV
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[800px]">
                                            <thead>
                                                <tr className="border-b border-slate-800 bg-[#0B1120]">
                                                    <th className="py-4 px-6 text-[10px] font-bold text-slate-500 tracking-widest uppercase">Period End</th>
                                                    <th className="py-4 px-6 text-[10px] font-bold text-slate-500 tracking-widest uppercase">FII Holding</th>
                                                    <th className="py-4 px-6 text-[10px] font-bold text-slate-500 tracking-widest uppercase">Period Change</th>
                                                    <th className="py-4 px-6 text-[10px] font-bold text-slate-500 tracking-widest uppercase">Estimated Net Flow</th>
                                                    <th className="py-4 px-6 text-[10px] font-bold text-slate-500 tracking-widest uppercase">Close Price</th>
                                                    <th className="py-4 px-6 text-[10px] font-bold text-slate-500 tracking-widest uppercase text-right">Signal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/50">
                                                {tableData.map((row, idx) => {
                                                    const hold = parseFloat(row.fii_holding_pct) || 0;
                                                    const chg = parseFloat(row.chg_in_fii_pct) || 0;
                                                    const flow = parseFloat(row.estimated_flow) || 0;
                                                    const price = parseFloat(row.cmp) || 0;
                                                    const periodStr = row.period_name || row.date || `Period ${idx + 1}`;

                                                    let signal = "Stable";
                                                    if (chg > 1) signal = "Strong inflow";
                                                    else if (chg > 0) signal = "Accumulating";
                                                    else if (chg < -1) signal = "Heavy outflow";
                                                    else if (chg < 0) signal = "Mild outflow";

                                                    return (
                                                        <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                                                            <td className="py-4 px-6 text-sm font-bold text-white">{periodStr}</td>
                                                            <td className="py-4 px-6 text-sm font-bold text-white">{hold.toFixed(2)}%</td>
                                                            <td className={`py-4 px-6 text-sm font-bold ${chg > 0 ? 'text-[#00E676]' : chg < 0 ? 'text-[#FF5252]' : 'text-slate-400'}`}>
                                                                {chg > 0 ? '+' : ''}{chg.toFixed(2)} pp
                                                            </td>
                                                            <td className={`py-4 px-6 text-sm font-bold ${flow > 0 ? 'text-[#00E676]' : flow < 0 ? 'text-[#FF5252]' : 'text-slate-400'}`}>
                                                                {flow > 0 ? '+' : flow < 0 ? '-' : ''}₹{Math.abs(flow).toLocaleString()} Cr
                                                            </td>
                                                            <td className="py-4 px-6 text-sm text-slate-300">₹{price.toFixed(2)}</td>
                                                            <td className="py-4 px-6 text-right">
                                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${signal.includes('inflow') || signal.includes('Accumulating')
                                                                    ? 'border-[#00E676]/30 text-[#00E676] bg-[#00E676]/10'
                                                                    : signal.includes('outflow')
                                                                        ? 'border-[#FF5252]/30 text-[#FF5252] bg-[#FF5252]/10'
                                                                        : 'border-[#00F0FF]/30 text-[#00F0FF] bg-[#00F0FF]/10'
                                                                    }`}>
                                                                    {signal}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="px-6 pt-4 flex justify-between text-[11px] text-slate-500">
                                        <span>Source: Database API</span>
                                        <span>Showing {tableData.length} records</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default HistoricalAnalysis;