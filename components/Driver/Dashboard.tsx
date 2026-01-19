
import React, { useState } from 'react';
import { UserRole, AppState, DriverRank } from '../../types';
import { 
  Power, TrendingUp, Star, Navigation, Clock, ShieldCheck, 
  Coins, Trophy, Zap, AlertTriangle, ChevronRight, BarChart3, 
  ArrowUpCircle, Timer, CheckCircle2, Calendar, LayoutGrid
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell, YAxis } from 'recharts';

interface DriverDashboardProps {
  appState: AppState;
  updateState: (updates: Partial<AppState>) => void;
  addNotification: (msg: string) => void;
}

const DAILY_DATA = [
  { label: 'Mon', amount: 150 },
  { label: 'Tue', amount: 230 },
  { label: 'Wed', amount: 180 },
  { label: 'Thu', amount: 210 },
  { label: 'Fri', amount: 350 },
  { label: 'Sat', amount: 420 },
  { label: 'Sun', amount: 280 },
];

const WEEKLY_DATA = [
  { label: 'Wk 1', amount: 1200 },
  { label: 'Wk 2', amount: 1450 },
  { label: 'Wk 3', amount: 1100 },
  { label: 'Wk 4', amount: 1800 },
];

// PROMOTIONAL LOGIC
const RANK_REQUIREMENTS = {
  [DriverRank.BRONZE]: { next: DriverRank.SILVER, rides: 10, rating: 4.5, response: 10 },
  [DriverRank.SILVER]: { next: DriverRank.GOLD, rides: 50, rating: 4.7, response: 7 },
  [DriverRank.GOLD]: { next: DriverRank.ELITE, rides: 200, rating: 4.9, response: 5 },
  [DriverRank.ELITE]: { next: null, rides: Infinity, rating: 5.0, response: 0 }
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#15151a] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{payload[0].payload.label}</p>
        <p className="text-sm font-black text-white italic tracking-tighter">
          EARNINGS: <span className="text-green-400">${payload[0].value.toFixed(2)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const DriverDashboard: React.FC<DriverDashboardProps> = ({ appState, updateState, addNotification }) => {
  const [timeframe, setTimeframe] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  
  const toggleOnline = () => {
    const nextState = !appState.isOnline;
    updateState({ isOnline: nextState });
    addNotification(nextState ? "Node Live: Broadcasting location." : "Node Dark: Location broadcasting suspended.");
  };

  const isElite = appState.driverRank === DriverRank.ELITE;
  const currentReq = RANK_REQUIREMENTS[appState.driverRank];
  
  const rideProgress = Math.min(100, (appState.completedRides / currentReq.rides) * 100);
  const ratingProgress = Math.min(100, (appState.driverRating / currentReq.rating) * 100);
  const responseProgress = Math.min(100, (currentReq.response / appState.avgResponseTime) * 100);
  const totalProgress = (rideProgress + ratingProgress + responseProgress) / 3;

  const canUpgrade = totalProgress >= 100 && currentReq.next !== null;

  const handleUpgrade = () => {
    if (!canUpgrade) return;
    const nextRank = currentReq.next as DriverRank;
    updateState({ driverRank: nextRank });
    addNotification(`RANK UP: Driver Node evolved to ${nextRank.toUpperCase()} Class!`);
  };

  const chartData = timeframe === 'DAILY' ? DAILY_DATA : WEEKLY_DATA;

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-y-auto pb-32 scroll-hide">
      {/* HUD Header */}
      <div className="p-6 flex items-center justify-between sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.3)] border border-white/10">
            <Zap className="text-white w-6 h-6 fill-current shadow-lg" />
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">Driver Node</h1>
            <div className="flex items-center gap-2">
              <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${
                isElite ? 'bg-yellow-400 text-black border-yellow-500' : 'bg-purple-900/40 text-purple-400 border-purple-500/20'
              }`}>
                {appState.driverRank} Class
              </span>
            </div>
          </div>
        </div>
        <button onClick={() => updateState({ userRole: UserRole.PASSENGER })} className="bg-white/5 text-gray-400 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 border border-white/10 hover:text-white transition-all">
          Passenger Mode
        </button>
      </div>

      <div className="p-4 space-y-6">
        
        {/* RANK EVOLUTION NODE */}
        {!isElite && (
          <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-7 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-purple-600/5 rounded-full blur-3xl group-hover:bg-purple-600/10 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <h3 className="text-white font-black text-sm uppercase tracking-widest italic tracking-tighter flex items-center gap-2">
                    {appState.driverRank} Evolution
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                    <span className="text-purple-400">{currentReq.next}</span>
                  </h3>
                </div>
                <div className="text-right">
                  <span className={`text-xl font-black italic tracking-tighter px-3 py-1 rounded-xl border transition-all ${canUpgrade ? 'bg-green-500 text-white border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-purple-950/40 text-purple-400 border-purple-500/20'}`}>
                    {totalProgress.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <ProgressItem label="Linkage Volume" current={appState.completedRides} target={currentReq.rides} percent={rideProgress} />
                <ProgressItem label="Neural Stability" current={appState.driverRating} target={currentReq.rating} percent={ratingProgress} />
                <ProgressItem label="Response Latency" current={appState.avgResponseTime} target={currentReq.response} percent={responseProgress} isInverse />
              </div>

              {canUpgrade && (
                <button 
                  onClick={handleUpgrade}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_10px_30px_rgba(79,70,229,0.4)] animate-bounce"
                >
                  Initialize Class Promotion
                </button>
              )}
            </div>
          </div>
        )}

        {/* PERFORMANCE ANALYTICS NODE - UPDATED WITH BAR CHART */}
        <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-7 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
             <div className="space-y-1">
               <h3 className="text-white font-black text-xs uppercase tracking-widest italic">Revenue Node</h3>
               <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest italic">Net Liquidity Inflow</p>
             </div>
             
             {/* Timeframe Toggles */}
             <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                <button 
                  onClick={() => setTimeframe('DAILY')}
                  className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${timeframe === 'DAILY' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}
                >
                  Daily
                </button>
                <button 
                  onClick={() => setTimeframe('WEEKLY')}
                  className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${timeframe === 'WEEKLY' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}
                >
                  Weekly
                </button>
             </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <MetricBox label="Rides" value={appState.completedRides} icon={<TrendingUp className="w-3 h-3" />} color="text-indigo-400" />
            <MetricBox label="Rating" value={appState.driverRating} icon={<Star className="w-3 h-3" />} color="text-yellow-400" />
            <MetricBox label="Net" value={`$${appState.earnings.toFixed(2)}`} icon={<Coins className="w-3 h-3" />} color="text-green-400" />
          </div>

          <div className="h-48 w-full animate-in zoom-in-95 duration-700">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 8, fill: '#4b5563', fontWeight: 900}} 
                    interval={0}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 8, fill: '#4b5563', fontWeight: 900}}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.03)'}}
                    content={<CustomTooltip />}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === chartData.length - 1 ? '#818cf8' : '#312e81'} 
                        fillOpacity={0.8}
                        className="transition-all hover:fill-indigo-500"
                      />
                    ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 flex items-center justify-between px-2 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-gray-600" />
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">Forecast: +12% Efficiency Gain</p>
            </div>
            <button className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
              Details <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ONLINE STATUS TOGGLE */}
        <div className="bg-[#0f0f12] rounded-[2.5rem] p-7 border border-white/5 space-y-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className={`w-4 h-4 rounded-full ${appState.isOnline ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-gray-800 shadow-inner'}`}></div>
               <span className="text-[10px] font-black text-white uppercase tracking-[0.25em] italic">{appState.isOnline ? 'Network Linked' : 'Offline State'}</span>
            </div>
            <button 
              onClick={toggleOnline}
              className={`px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${
                appState.isOnline 
                ? 'bg-red-600/10 text-red-500 border border-red-500/20' 
                : 'bg-indigo-600 text-white shadow-[0_0_30px_rgba(99,102,241,0.4)]'
              }`}
            >
              {appState.isOnline ? 'Terminate Link' : 'Initiate Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProgressItem = ({ label, current, target, percent }: any) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
      <span className="text-gray-500">{label}</span>
      <span className={percent >= 100 ? 'text-green-400' : 'text-white'}>{current} / {target}</span>
    </div>
    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
      <div 
        className={`h-full transition-all duration-1000 ${percent >= 100 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-indigo-600'}`} 
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  </div>
);

const MetricBox = ({ label, value, icon, color }: any) => (
  <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center flex flex-col items-center gap-1 group hover:border-white/10 transition-colors">
     <div className={`${color} opacity-40 group-hover:opacity-100 transition-opacity`}>{icon}</div>
     <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{label}</p>
     <p className="text-lg font-black text-white italic tracking-tighter">{value}</p>
  </div>
);

export default DriverDashboard;
