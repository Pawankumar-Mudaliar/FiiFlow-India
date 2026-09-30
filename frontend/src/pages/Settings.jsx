import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    User,
    Upload,
    ShieldCheck,
    Key,
    Smartphone,
    Bell,
    Sliders,
    LogOut,
    AlertTriangle,
    Activity,
    BarChart2,
    Star,
    PieChart,
    FileText,
    Settings as SettingsIcon
} from 'lucide-react';

const Settings = () => {
    const navigate = useNavigate();

    // Auth logic for sidebar
    const storedUser = localStorage.getItem('fiiUser');
    const user = storedUser ? JSON.parse(storedUser) : { username: 'Guest' };
    const isAuthenticated = !!storedUser;

    const handleLogout = () => {
        localStorage.removeItem('fiiUser');
        navigate('/login');
    };

    // State for toggles
    const [alerts, setAlerts] = useState({
        accumulation: true,
        distribution: true,
        sector: true,
        regulatory: false,
        inApp: true,
        email: true,
    });

    const toggleAlert = (key) => {
        setAlerts(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Helper component for Toggle Switch
    const Toggle = ({ checked, onChange }) => (
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#00E5FF]' : 'bg-slate-700'
                }`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    );

    return (

        <div className="flex h-screen bg-[#0A0F1C] text-slate-300 font-sans selection:bg-[#00F0FF] selection:text-black overflow-hidden">

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
                            <Link to="/sector-mapping" className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/30 rounded-lg transition-colors">
                                <PieChart className="w-4 h-4" />
                                <span className="text-sm font-semibold">Sector Mapping</span>
                            </Link>
                            <Link to="/historical" className="flex items-center space-x-3 px-4 py-3 bg-[#131B2C] text-white rounded-lg border border-slate-800/50">
                                <BarChart2 className="w-4 h-4 text-[#00F0FF]" />
                                <span className="text-sm font-semibold">Historical Analysis</span>
                            </Link>
                        </nav>

                        <div className="p-4 border-t border-slate-800/50 space-y-1">
                            {/* Active State applied here for Settings */}
                            <Link to="/settings" className="w-full flex items-center space-x-3 px-4 py-3 bg-[#131B2C] text-[#00F0FF] rounded-lg border border-slate-800/50">
                                <SettingsIcon className="w-4 h-4" />
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
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                            <p className="text-slate-400">Manage your terminal profile, security and institutional signal preferences.</p>
                        </div>
                        <div className="flex items-center text-emerald-400 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            All changes saved
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Profile Details Card */}
                        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 flex flex-col">
                            <div className="flex items-center mb-6">
                                <div className="bg-[#1e293b] p-2 rounded-lg mr-4">
                                    <User className="w-5 h-5 text-[#00E5FF]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Profile details</h2>
                                    <p className="text-sm text-slate-400">Information shown across your FIIFlow workspace.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 mb-6">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user.username}&background=1e293b&color=fff&size=80`}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full border border-slate-700"
                                />
                                <div>
                                    <button className="flex items-center gap-2 border border-slate-700 hover:border-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mb-2">
                                        <Upload className="w-4 h-4 text-[#00E5FF]" />
                                        CHANGE PHOTO
                                    </button>
                                    <p className="text-xs text-slate-500">JPG or PNG · Max 2 MB</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Full Name</label>
                                    <input
                                        type="text"
                                        defaultValue={user.username}
                                        className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00E5FF]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Organisation</label>
                                    <input
                                        type="text"
                                        defaultValue="Mumbai Quant Partners"
                                        className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00E5FF]"
                                    />
                                </div>
                            </div>

                            <div className="mb-6 flex-1">
                                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">SEBI Registration</label>
                                <input
                                    type="text"
                                    defaultValue="SEBI-INA-0092"
                                    className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00E5FF]"
                                />
                                <p className="text-xs text-slate-500 mt-2">Verified investment adviser profile</p>
                            </div>

                            <div className="flex justify-end mt-auto">
                                <button className="flex items-center gap-2 bg-[#00E5FF] hover:bg-cyan-400 text-slate-900 px-6 py-2 rounded-lg text-sm font-bold transition-colors">
                                    <CheckCircle2 className="w-4 h-4" />
                                    SAVE PROFILE
                                </button>
                            </div>
                        </div>

                        {/* Email & Security Card */}
                        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 flex flex-col">
                            <div className="flex items-center mb-6">
                                <div className="bg-[#1e293b] p-2 rounded-lg mr-4">
                                    <ShieldCheck className="w-5 h-5 text-[#00E5FF]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Email & security</h2>
                                    <p className="text-sm text-slate-400">Protect access to portfolio and alert data.</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Account Email</label>
                                <input
                                    type="email"
                                    defaultValue={`${user.username.toLowerCase().replace(' ', '')}@mumbaiquant.in`}
                                    readOnly
                                    className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-4 py-2 text-slate-400 focus:outline-none cursor-not-allowed"
                                />
                                <p className="text-xs text-slate-500 mt-2">Used for sign-in, exports and security notices</p>
                            </div>

                            <div className="flex items-center justify-between py-4 border-t border-slate-800/50">
                                <div>
                                    <p className="text-sm font-semibold text-white">Password</p>
                                    <p className="text-xs text-slate-500">Last changed 42 days ago</p>
                                </div>
                                <button className="flex items-center gap-2 border border-slate-700 hover:border-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                    <Key className="w-4 h-4 text-[#00E5FF]" />
                                    UPDATE PASSWORD
                                </button>
                            </div>

                            <div className="mt-4 bg-[#064e3b]/20 border border-[#065f46] rounded-lg p-4 flex items-center">
                                <Smartphone className="w-5 h-5 text-emerald-500 mr-4" />
                                <div>
                                    <p className="text-sm font-semibold text-white">Two-step verification is active</p>
                                    <p className="text-xs text-slate-400">Authenticator app ending in ** 47</p>
                                </div>
                            </div>
                        </div>

                        {/* Significant FII change alerts Card */}
                        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
                            <div className="flex items-center mb-6">
                                <div className="bg-[#1e293b] p-2 rounded-lg mr-4">
                                    <Bell className="w-5 h-5 text-[#00E5FF]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Significant FII change alerts</h2>
                                    <p className="text-sm text-slate-400">Choose which institutional shifts should interrupt your workflow.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-white">Watchlist accumulation spikes</p>
                                        <p className="text-xs text-slate-500">Notify when foreign holdings rise sharply in a tracked stock.</p>
                                    </div>
                                    <Toggle checked={alerts.accumulation} onChange={() => toggleAlert('accumulation')} />
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-800/50 pt-4">
                                    <div>
                                        <p className="text-sm font-semibold text-white">Material distribution signals</p>
                                        <p className="text-xs text-slate-500">Alert when net offshore selling crosses your default threshold.</p>
                                    </div>
                                    <Toggle checked={alerts.distribution} onChange={() => toggleAlert('distribution')} />
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-800/50 pt-4">
                                    <div>
                                        <p className="text-sm font-semibold text-white">Sector rotation digest</p>
                                        <p className="text-xs text-slate-500">Include sector-level flow reversals in the scheduled market update.</p>
                                    </div>
                                    <Toggle checked={alerts.sector} onChange={() => toggleAlert('sector')} />
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-800/50 pt-4">
                                    <div>
                                        <p className="text-sm font-semibold text-white">Regulatory ledger corrections</p>
                                        <p className="text-xs text-slate-500">Notify when NSDL/CDSL historical records are restated.</p>
                                    </div>
                                    <Toggle checked={alerts.regulatory} onChange={() => toggleAlert('regulatory')} />
                                </div>
                            </div>
                        </div>

                        {/* Alert Defaults Card */}
                        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 flex flex-col">
                            <div className="flex items-center mb-6">
                                <div className="bg-[#1e293b] p-2 rounded-lg mr-4">
                                    <Sliders className="w-5 h-5 text-[#00E5FF]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Alert defaults</h2>
                                    <p className="text-sm text-slate-400">Set the sensitivity and cadence used for new stock alerts.</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Default Alert Threshold</label>
                                <select className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] appearance-none">
                                    <option>1.00% change in FII holding</option>
                                    <option>2.00% change in FII holding</option>
                                    <option>5.00% change in FII holding</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-2">Measured against the previous disclosed period</p>
                            </div>

                            <div className="mb-8">
                                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Market Update Frequency</label>
                                <select className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00E5FF] appearance-none">
                                    <option>Twice daily · 09:15 & 15:45 IST</option>
                                    <option>Once daily · EOD</option>
                                    <option>Real-time (Intraday)</option>
                                </select>
                            </div>

                            <div className="space-y-4 mb-6 flex-1">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Delivery Channels</label>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-white">In-app terminal alerts</p>
                                        <p className="text-xs text-slate-500">Show signals in FIIFlow while signed in.</p>
                                    </div>
                                    <Toggle checked={alerts.inApp} onChange={() => toggleAlert('inApp')} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-white">Email summary</p>
                                        <p className="text-xs text-slate-500">Send consolidated updates to your account email.</p>
                                    </div>
                                    <Toggle checked={alerts.email} onChange={() => toggleAlert('email')} />
                                </div>
                            </div>

                            <div className="flex justify-end mt-auto">
                                <button className="flex items-center gap-2 bg-[#00E5FF] hover:bg-cyan-400 text-slate-900 px-6 py-2 rounded-lg text-sm font-bold transition-colors">
                                    <CheckCircle2 className="w-4 h-4" />
                                    SAVE ALERT DEFAULTS
                                </button>
                            </div>
                        </div>

                        {/* Account Actions - Full Width */}
                        <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center">
                                <div className="bg-[#1e293b] p-2 rounded-lg mr-4">
                                    <User className="w-5 h-5 text-[#00E5FF]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Account actions</h2>
                                    <p className="text-sm text-slate-400">Control this terminal session or request account closure.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button onClick={handleLogout} className="flex items-center gap-2 border border-slate-700 hover:border-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                    <LogOut className="w-4 h-4 text-[#00E5FF]" />
                                    SIGN OUT ALL DEVICES
                                </button>
                                <button className="flex items-center gap-2 border border-red-900/50 hover:bg-red-950/30 text-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                    <AlertTriangle className="w-4 h-4" />
                                    DEACTIVATE ACCOUNT
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;