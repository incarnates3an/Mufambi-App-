
import React from 'react';
import { MapPin, Navigation, Compass, Globe, Radio, ShieldAlert, Radar } from 'lucide-react';
import { Location, RideStatus } from '../../types';

interface MapProps {
  currentLoc: Location | null;
  destLoc: Location | null;
  status: RideStatus;
  isSafetyActive?: boolean;
}

const Map: React.FC<MapProps> = ({ currentLoc, destLoc, status, isSafetyActive }) => {
  const isMoving = status === RideStatus.EN_ROUTE_PICKUP || status === RideStatus.IN_PROGRESS;
  const routePath = "M 100 250 C 150 250, 250 450, 300 450";

  return (
    <div className="absolute inset-0 bg-[#0a0a0f] overflow-hidden">
      {/* Neural Grid Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#4F46E5 1px, transparent 1px), linear-gradient(90deg, #4F46E5 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>
      
      {/* Background Depth Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full"></div>

      {/* SVG Map Context */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Road Network */}
        <path d="M -50 150 L 450 150" stroke="#1e1b4b" strokeWidth="40" fill="none" />
        <path d="M 100 -50 L 100 650" stroke="#1e1b4b" strokeWidth="50" fill="none" />
        <path d="M 320 -50 L 320 650" stroke="#1e1b4b" strokeWidth="35" fill="none" />
        <path d="M -50 450 L 450 450" stroke="#1e1b4b" strokeWidth="30" fill="none" />
        
        {/* Active Route Visualization */}
        {(destLoc || status !== RideStatus.IDLE) && (
          <>
            <path 
              id="mainRoute"
              d={routePath} 
              stroke="url(#routeGradient)" 
              strokeWidth="4" 
              strokeLinecap="round"
              fill="none" 
              className="opacity-20"
            />
            <path 
              d={routePath} 
              stroke="url(#routeGradient)" 
              strokeWidth="4" 
              strokeDasharray="8 12" 
              strokeLinecap="round"
              fill="none" 
              filter="url(#glow)"
              className="animate-[dash_4s_linear_infinite]"
            />
          </>
        )}
      </svg>

      {/* Safety Overlay HUD */}
      {isSafetyActive && (
        <div className="absolute top-6 right-6 z-50 animate-in fade-in slide-in-from-right-4 duration-500">
           <div className="bg-green-600/10 backdrop-blur-xl border border-green-500/30 px-4 py-2.5 rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.2)] flex items-center gap-3">
              <div className="relative">
                <Radar className="w-5 h-5 text-green-500 animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-0 bg-green-500 blur-md opacity-20 animate-pulse"></div>
              </div>
              <div>
                <p className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Safety Uplink Active</p>
                <p className="text-[7px] text-green-400/80 font-black uppercase tracking-tighter mt-1">2 Guardians Monitoring</p>
              </div>
           </div>
        </div>
      )}

      {/* Origin/Pickup Marker */}
      <div className="absolute top-[250px] left-[100px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
         <div className="relative group">
            <div className="absolute inset-0 -m-8 border-2 border-indigo-500/20 rounded-full animate-[ping_3s_infinite] opacity-30"></div>
            <div className="absolute inset-0 -m-4 border border-indigo-500/40 rounded-full animate-[pulse_2s_infinite]"></div>
            
            <div className="relative p-3 bg-indigo-600 rounded-3xl shadow-[0_0_30px_rgba(79,70,229,0.5)] text-white border border-indigo-400/30 transform transition-transform group-hover:scale-110">
               <Navigation className="w-6 h-6 fill-current rotate-[45deg]" />
            </div>
            
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-indigo-400 bg-indigo-950/90 px-3 py-1 rounded-full border border-indigo-500/20 whitespace-nowrap backdrop-blur-md">
                Precision Sync: 99.8%
              </span>
            </div>
         </div>
      </div>

      {/* Destination Marker */}
      {destLoc && (
        <div className="absolute top-[450px] left-[300px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-in fade-in zoom-in duration-700">
           <div className="relative group">
              <div className="absolute inset-0 bg-purple-500 rounded-full animate-pulse opacity-20"></div>
              <div className="relative p-3 bg-purple-600 rounded-3xl shadow-[0_0_30px_rgba(168,85,247,0.5)] text-white border border-purple-400/30 transform transition-transform group-hover:scale-110">
                 <MapPin className="w-6 h-6 fill-current" />
              </div>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#0f0f12]/90 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl shadow-2xl whitespace-nowrap">
                <div className="flex items-center gap-2">
                   <Globe className="w-3 h-3 text-purple-400" />
                   <span className="text-[9px] font-black uppercase italic tracking-tighter text-white">{destLoc.address || 'Target Node'}</span>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Moving Car Node */}
      {isMoving && (
        <div className="car-follower absolute w-12 h-12 z-20 pointer-events-none">
           <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-40 animate-pulse"></div>
              <div className="relative bg-white p-2.5 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] border border-indigo-100 flex items-center justify-center transform -rotate-90">
                <Navigation className="w-6 h-6 text-indigo-600 fill-indigo-600" />
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
        @keyframes car-movement {
          from { offset-distance: 0%; }
          to { offset-distance: 100%; }
        }
        .car-follower {
          offset-path: path('${routePath}');
          offset-rotate: auto 180deg;
          animation: car-movement 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Map;
