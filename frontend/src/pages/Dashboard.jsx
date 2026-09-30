import { useState, useEffect } from 'react';
import {
    Activity,
    Star,
    PieChart,
    FileText,
    BarChart2,
    Settings,
    ChevronDown,
    LogOut,
} from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
    const [tableData, setTableData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const storedUser = localStorage.getItem('fiiUser');
    const user = storedUser ? JSON.parse(storedUser) : { username: 'Guest' };

    const handleLogout = () => {
        localStorage.removeItem('fiiUser');
        navigate('/login');
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [latestRes, trendRes] = await Promise.all([
                    api.get('/fii/latest'),
                    api.get('/fii/trend')
                ]);

                setTableData(latestRes.data.data.slice(0, 10));

                const formattedChartData = trendRes.data.data.map(item => ({
                    month: item.month,
                    value: parseFloat(item.value) || 0
                }));

                setChartData(formattedChartData);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="flex h-screen bg-[#0A0F1C] text-slate-300 font-sans selection:bg-[#00F0FF] selection:text-black overflow-hidden">
            {/* CHANGED: Replaced "h-full min-h-screen" with "h-screen" to lock the layout height */}

            {/* SIDEBAR */}
            <aside className="w-64 bg-[#050810] border-r border-slate-800 flex flex-col justify-between shrink-0">
                <div className="flex-1 flex flex-col">
                    <nav className="p-4 space-y-1 flex-1">
                        <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 bg-[#131B2C] text-white rounded-lg border border-slate-800/50">
                            <Activity className="w-4 h-4 text-[#00F0FF]" />
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
                        <Link to="/historicalanalysis" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-lg transition-colors">
                            <BarChart2 className="w-4 h-4" />
                            <span className="text-sm font-semibold">Historical Analysis</span>
                        </Link>
                    </nav>

                    <div className="p-4 border-t border-slate-800/50 space-y-1">
                        <Link to="/settings" className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-lg transition-colors">
                            <Settings className="w-4 h-4" />
                            <span className="text-sm font-semibold">Settings</span>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-[#FF5252] hover:bg-[#FF5252]/10 rounded-lg transition-colors"
                        >
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
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">NSE Foreign Institutional Flows</h1>
                        <p className="text-sm text-slate-400">Live depository mapping feed for equity allocation shifts.</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 bg-[#131B2C] border border-slate-700 px-4 py-2 rounded text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                            <span>Sector: All Sectors</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        <button className="flex items-center space-x-2 bg-[#131B2C] border border-slate-700 px-4 py-2 rounded text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                            <span>Cap: Large Cap</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        <button className="flex items-center space-x-2 bg-[#131B2C] border border-slate-700 px-4 py-2 rounded text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                            <span>Span: 30 Days</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[#131B2C] border border-slate-800 rounded-xl p-6">
                        <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">Net FII Inflow (MTD)</div>
                        <div className="flex items-end justify-between mb-2">
                            <div className="text-3xl font-bold text-white">₹8,410 Cr</div>
                            <div className="text-xs font-bold text-[#00E676] bg-[#0A2E1F] px-2 py-1 rounded">+12.4%</div>
                        </div>
                        <div className="text-xs text-slate-500">Accumulating primarily in private banking</div>
                    </div>

                    <div className="bg-[#131B2C] border border-slate-800 rounded-xl p-6">
                        <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">FII Outflow Trend</div>
                        <div className="flex items-end justify-between mb-2">
                            <div className="text-3xl font-bold text-white">-₹2,140 Cr</div>
                            <div className="text-xs font-bold text-[#FF5252] bg-[#3A1015] px-2 py-1 rounded">-3.1%</div>
                        </div>
                        <div className="text-xs text-slate-500">Distributing IT services & FMCG groups</div>
                    </div>

                    <div className="bg-[#131B2C] border border-slate-800 rounded-xl p-6">
                        <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">Total SEBI Registered FIIs</div>
                        <div className="flex items-end justify-between mb-2">
                            <div className="text-3xl font-bold text-white">1,248</div>
                            <div className="text-xs font-bold text-[#00E676] bg-[#0A2E1F] px-2 py-1 rounded">+1.1%</div>
                        </div>
                        <div className="text-xs text-slate-500">New institutional licenses registered</div>
                    </div>
                </div>

                <div className="bg-[#131B2C] border border-slate-800 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="text-[11px] font-bold text-white tracking-widest uppercase">Cumulative FII Net Accumulation Spread (YTD)</div>
                        <div className="flex items-center space-x-4 text-xs font-medium text-slate-400">
                            <div className="flex items-center space-x-2"><div className="w-2 h-2 rounded-full bg-[#00F0FF]"></div><span>This Year</span></div>
                            <div className="flex items-center space-x-2"><div className="w-2 h-2 rounded-full bg-slate-600"></div><span>Prior Year</span></div>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        {isLoading ? (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">Loading historical data...</div>
                        ) : chartData.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">Not enough historical data to generate trend chart.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <Tooltip
                                        cursor={{ fill: '#ffffff10' }}
                                        contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                                        formatter={(value) => [`₹${value.toLocaleString()} Cr`, "Net Accumulation"]}
                                    />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.value >= 0 ? "#00F0FF" : "#FF5252"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="bg-[#131B2C] border border-slate-800 rounded-xl overflow-hidden">
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
                                    <td colSpan="6" className="py-8 text-center text-slate-500 text-sm">Loading live depository data...</td>
                                </tr>
                            ) : tableData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-slate-500 text-sm">No recent institutional activity found.</td>
                                </tr>
                            ) : (
                                tableData.map((stock, index) => {
                                    const cmp = parseFloat(stock.cmp);
                                    const holdPct = parseFloat(stock.fii_hold_pct);
                                    const chgPct = parseFloat(stock.chg_in_fii_pct);
                                    const isPositive = chgPct > 0;
                                    const isNegative = chgPct < 0;

                                    return (
                                        <tr key={stock.id || index} className="hover:bg-slate-800/20 transition-colors">
                                            <td className="py-4 px-6 text-sm font-bold text-white">{stock.company_name}</td>
                                            <td className="py-4 px-6 text-sm text-slate-400">Equities</td>
                                            <td className="py-4 px-6 text-sm font-bold text-white">{!isNaN(holdPct) ? holdPct.toFixed(2) : "0.00"}%</td>
                                            <td className={`py-4 px-6 text-sm font-bold ${isPositive ? 'text-[#00E676]' : isNegative ? 'text-[#FF5252]' : 'text-slate-400'
                                                }`}>
                                                {isPositive ? "+" : ""}{!isNaN(chgPct) ? chgPct.toFixed(2) : "0.00"}%
                                            </td>
                                            <td className="py-4 px-6 text-sm text-slate-300">
                                                {isNegative ? '-' : ''}₹{Math.abs(Math.floor((cmp * chgPct) * 1.5)).toLocaleString()} Cr
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                <button className="border border-slate-700 text-[#00F0FF] hover:bg-[#00F0FF]/10 px-3 py-1.5 rounded text-[10px] font-bold tracking-widest transition-colors">
                                                    TERM CHART
                                                </button>
                                                <button className="border border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF]/10 px-3 py-1.5 rounded text-[10px] font-bold tracking-widest transition-colors">
                                                    SYNC ALERT
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;