
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UserRole, AppState, RideStatus, DriverBid, DriverRank, PaymentMethod, SafeCircleContact } from '../../types';
import EntertainmentHub from '../Entertainment/Hub';
import PaymentModal from './PaymentModal';
import BuddyHub from './BuddyHub';
import Map from '../Shared/Map';
import SafeCircleOverlay from './SafeCircleOverlay';
import ShareRideOverlay from './ShareRideOverlay';
import { BidListSkeleton } from '../Shared/LoadingSkeletons';
import Button from '../Shared/Button';
import EmptyState from '../Shared/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { searchPlaces } from '../../services/gemini';
import {
  Search, MapPin, Star, Car, Shield, Leaf,
  Smile, Music, Users, Plus, Minus, X, Check,
  Zap, Radio, Gamepad2, Briefcase, Flame, Snowflake,
  ChevronRight, Settings, Coins, Wallet, Trophy, AlertCircle, TrendingUp,
  MessageSquare, Send, Navigation2, Wind, VolumeX, Globe, Crosshair, ShieldAlert, ShieldCheck, Loader2, Award, Share2, Phone, PlayCircle
} from 'lucide-react';

interface PassengerDashboardProps {
  appState: AppState;
  updateState: (updates: Partial<AppState>) => void;
  addNotification: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

type RideCategory = 'BASIC' | 'ELITE' | 'INTER_CITY';

const PassengerDashboard: React.FC<PassengerDashboardProps> = ({ appState, updateState, addNotification }) => {
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [offeredPrice, setOfferedPrice] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<RideCategory>('BASIC');
  const [useCredits, setUseCredits] = useState(false);
  const [isEntertainmentOpen, setIsEntertainmentOpen] = useState(false);
  const [isBuddyHubOpen, setIsBuddyHubOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [prefs, setPrefs] = useState({
    silent: false,
    eco: false,
    climate: true
  });

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  // Debounce search value for performance
  const debouncedSearchValue = useDebounce(searchValue, 800);

  // Memoize expensive calculations
  const pointsToUSD = useMemo(() => appState.loyaltyPoints / 100, [appState.loyaltyPoints]);
  const finalPrice = useMemo(() => useCredits ? Math.max(0, offeredPrice - pointsToUSD) : offeredPrice, [useCredits, offeredPrice, pointsToUSD]);
  const creditsUsedValue = useMemo(() => useCredits ? Math.min(offeredPrice, pointsToUSD) : 0, [useCredits, offeredPrice, pointsToUSD]);
  const creditsUsedPoints = useMemo(() => creditsUsedValue * 100, [creditsUsedValue]);

  // Memoize mock bids to prevent recreation on every render
  const MOCK_BIDS = useMemo<DriverBid[]>(() => [
    { id: '1', driverName: 'James T.', rating: 5.0, carModel: 'Mercedes EQE', price: offeredPrice, eta: 3, rank: DriverRank.ELITE, acceptsCredits: true },
    { id: '2', driverName: 'Sarah M.', rating: 4.8, carModel: 'Toyota Camry', price: offeredPrice + 1.5, eta: 6, rank: DriverRank.GOLD, acceptsCredits: false },
    { id: '3', driverName: 'Michael K.', rating: 4.7, carModel: 'Honda Accord', price: offeredPrice - 0.5, eta: 8, rank: DriverRank.SILVER, acceptsCredits: false },
    { id: '4', driverName: 'Chenai P.', rating: 4.4, carModel: 'Nissan Leaf', price: offeredPrice - 1.0, eta: 11, rank: DriverRank.BRONZE, acceptsCredits: false },
  ], [offeredPrice]);

  // OPTIMIZED DESTINATION SEARCH with debounce
  useEffect(() => {
    let isCancelled = false;

    const performSearch = async () => {
      if (debouncedSearchValue.length > 2) {
        setIsSearching(true);
        try {
          const results = await searchPlaces(
            debouncedSearchValue,
            appState.currentLocation?.lat,
            appState.currentLocation?.lng
          );
          if (!isCancelled) {
            setSuggestions(results);
            setIsSearching(false);
          }
        } catch (error) {
          if (!isCancelled) {
            console.error('Search failed:', error);
            setSuggestions([]);
            setIsSearching(false);
          }
        }
      } else {
        setSuggestions([]);
        setIsSearching(false);
      }
    };

    performSearch();

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearchValue, appState.currentLocation]);

  // Memoize event handlers to prevent recreation
  const selectSuggestion = useCallback((s: any) => {
    setSearchValue(s.name);
    updateState({
      destination: {
        lat: s.lat || 0,
        lng: s.lng || 0,
        address: s.name
      }
    });
    setSuggestions([]);
  }, [updateState]);

  const handleRequestRide = useCallback(() => {
    if (!searchValue) {
      addNotification("Destination node required", 'error');
      return;
    }
    addNotification("Searching for nearby drivers...", 'info');
    updateState({ rideStatus: RideStatus.SEARCHING });
    setTimeout(() => {
      updateState({ rideStatus: RideStatus.BIDDING });
      addNotification("Drivers found! Select your ride", 'success');
    }, 2000);
  }, [searchValue, addNotification, updateState]);

  const acceptBid = useCallback((bid: DriverBid) => {
    if (useCredits && bid.rank !== DriverRank.ELITE) {
      addNotification("Elite Drivers only for Credit Settlement", 'warning');
      return;
    }
    addNotification(`${bid.driverName} accepted! En route...`, 'success');
    updateState({ rideStatus: RideStatus.EN_ROUTE_PICKUP, activeBid: bid });
    setTimeout(() => updateState({ rideStatus: RideStatus.IN_PROGRESS }), 4000);
  }, [useCredits, addNotification, updateState]);

  const handlePaymentComplete = useCallback(() => {
    const pointsEarned = offeredPrice >= 7 ? 5 : 0;
    updateState({
      rideStatus: RideStatus.COMPLETED,
      loyaltyPoints: appState.loyaltyPoints - creditsUsedPoints + pointsEarned
    });
    if (pointsEarned > 0) addNotification(`+${pointsEarned} Points earned!`, 'success');
    setUseCredits(false);
    setShowRatingModal(true);
  }, [offeredPrice, creditsUsedPoints, appState.loyaltyPoints, updateState, addNotification]);

  const submitRating = useCallback(() => {
    addNotification(`${rating} Star rating submitted!`, 'success');
    setShowRatingModal(false);
    setRating(0);
    setFeedback("");
    updateState({ rideStatus: RideStatus.IDLE, activeBid: null, destination: null });
  }, [rating, addNotification, updateState]);

  const categories = [
    { id: 'BASIC' as RideCategory, name: 'Neural Basic', price: 10, icon: Car, desc: 'Efficient city travel' },
    { id: 'ELITE' as RideCategory, name: 'Pro Elite', price: 25, icon: Trophy, desc: 'Luxury & high-fidelity' },
    { id: 'INTER_CITY' as RideCategory, name: 'Uplink Inter-City', price: 65, icon: Globe, desc: 'Long-range cross-city' },
  ];

  const getRankStyles = (rank: DriverRank) => {
    switch (rank) {
      case DriverRank.ELITE:
        return { 
          badge: 'bg-yellow-400 text-black border-yellow-500 shadow-[0_0_10px_rgba(250,204,21,0.5)]', 
          border: 'border-yellow-400/50', 
          icon: <Trophy className="w-3 h-3" /> 
        };
      case DriverRank.GOLD:
        return { 
          badge: 'bg-amber-600 text-white border-amber-500', 
          border: 'border-amber-500/50', 
          icon: <Award className="w-3 h-3" /> 
        };
      case DriverRank.SILVER:
        return { 
          badge: 'bg-slate-400 text-white border-slate-300', 
          border: 'border-slate-400/50', 
          icon: <Award className="w-3 h-3" /> 
        };
      case DriverRank.BRONZE:
        return { 
          badge: 'bg-orange-800 text-white border-orange-700', 
          border: 'border-orange-800/30', 
          icon: <Award className="w-3 h-3" /> 
        };
      default:
        return { badge: 'bg-gray-800 text-gray-400 border-gray-700', border: 'border-transparent', icon: null };
    }
  };

  const isActiveRide = appState.rideStatus === RideStatus.EN_ROUTE_PICKUP || 
                     appState.rideStatus === RideStatus.ARRIVED || 
                     appState.rideStatus === RideStatus.IN_PROGRESS;

  return (
    <div className="flex-1 flex flex-col bg-[#050505] overflow-y-auto scroll-hide pb-32">
      {/* HUD Header */}
      <div className="p-6 flex items-center justify-between sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.3)]">
            <Car className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">Mufambi</h1>
            <p className="text-[8px] font-black tracking-[0.2em] text-purple-400 uppercase">AI Neural Link</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setIsEntertainmentOpen(true)}
             className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all text-indigo-400 hover:text-white"
           >
             <PlayCircle className="w-5 h-5" />
           </button>
           <button 
             onClick={() => setIsBuddyHubOpen(true)}
             className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white"
           >
             <Users className="w-5 h-5" />
           </button>
           <button onClick={() => updateState({ userRole: UserRole.DRIVER })} className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_20px_rgba(147,51,234,0.4)]">
             Driver
           </button>
        </div>
      </div>

      {/* Safety Status Bar */}
      <div className="px-4 pt-4">
        <button 
          onClick={() => setIsSafetyOpen(true)}
          className={`w-full p-4 rounded-3xl border transition-all flex items-center justify-between shadow-2xl relative overflow-hidden group ${
            appState.isSafetyMonitoringActive 
            ? 'bg-green-600/10 border-green-500/40 text-green-500' 
            : 'bg-[#0f0f12] border-white/5 text-gray-500'
          }`}
        >
          <div className="flex items-center gap-4 relative z-10">
             <div className={`p-2.5 rounded-xl transition-colors ${appState.isSafetyMonitoringActive ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-gray-800 text-gray-600'}`}>
                {appState.isSafetyMonitoringActive ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
             </div>
             <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">Neural Safety Node</p>
                <p className={`text-[9px] font-black uppercase tracking-widest ${appState.isSafetyMonitoringActive ? 'text-green-400 animate-pulse' : 'text-gray-600'}`}>
                   {appState.isSafetyMonitoringActive ? 'Monitoring Uplink Active' : 'Safety Guardian Offline'}
                </p>
             </div>
          </div>
          <ChevronRight className={`w-5 h-5 opacity-30 group-hover:opacity-100 transition-all ${appState.isSafetyMonitoringActive ? 'text-green-500' : ''}`} />
        </button>
      </div>

      {/* Main Map Integration */}
      <div className="p-4 h-[350px] relative">
         <div className="w-full h-full rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl relative">
            <Map 
              currentLoc={appState.currentLocation} 
              destLoc={appState.destination} 
              status={appState.rideStatus} 
              isSafetyActive={appState.isSafetyMonitoringActive}
            />
         </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Interaction Node */}
        {appState.rideStatus === RideStatus.IDLE && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Location Dashboard with Search Suggestions */}
            <div className="bg-[#0f0f12] rounded-[2.5rem] p-6 border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Navigation2 className="w-24 h-24 text-indigo-500 rotate-45" />
              </div>
              
              <div className="relative space-y-4">
                <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-20"></div>
                
                {/* Current Location HUD */}
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center relative z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_15px_#6366f1] animate-pulse"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">My Precision Location</p>
                    <p className="text-sm font-black text-white italic tracking-tighter truncate">
                      {appState.currentLocation?.address || "Calibrating Satellite Link..."}
                    </p>
                  </div>
                </div>

                {/* Destination Search Node */}
                <div className="flex items-center gap-4 group relative">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center relative z-10">
                    {isSearching ? <Loader2 className="w-4 h-4 text-purple-500 animate-spin" /> : <MapPin className="w-4 h-4 text-purple-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Destination Search Node</p>
                    <input 
                      type="text" 
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Identify target coordinates..."
                      className="w-full bg-transparent text-white text-sm font-bold outline-none placeholder:text-gray-800 border-b border-white/5 pb-1 focus:border-purple-500/50 transition-colors italic tracking-tight"
                    />
                  </div>

                  {/* Real-world Suggestions Dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-10 right-0 mt-2 bg-[#15151a] border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
                       {suggestions.map((s, i) => (
                         <button 
                           key={i}
                           onClick={() => selectSuggestion(s)}
                           className="w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left"
                         >
                            <Globe className="w-3.5 h-3.5 text-indigo-400 mt-0.5" />
                            <div>
                               <p className="text-[11px] font-black text-white uppercase italic tracking-tighter">{s.name}</p>
                               <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest truncate">{s.address}</p>
                            </div>
                         </button>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ride Class Selector */}
            <div className="space-y-4">
               <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Vehicle Class Protocol</h3>
               <div className="flex gap-4 overflow-x-auto scroll-hide px-2 pb-4">
                  {categories.map((cat) => (
                    <button 
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setOfferedPrice(cat.price);
                      }}
                      className={`flex-shrink-0 w-44 p-5 rounded-[2.5rem] border transition-all relative overflow-hidden group ${
                        selectedCategory === cat.id 
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-500/20' 
                        : 'bg-[#0f0f12] border-white/5 text-gray-500 hover:border-white/10'
                      }`}
                    >
                      <cat.icon className={`w-8 h-8 mb-4 transition-transform group-hover:scale-110 ${selectedCategory === cat.id ? 'text-white' : 'text-indigo-400'}`} />
                      <div className="text-left">
                        <h4 className="text-sm font-black italic tracking-tighter uppercase">{cat.name}</h4>
                        <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${selectedCategory === cat.id ? 'text-white/60' : 'text-gray-600'}`}>{cat.desc}</p>
                        <p className={`text-lg font-black mt-3 italic tracking-tighter ${selectedCategory === cat.id ? 'text-white' : 'text-white/80'}`}>${cat.price}</p>
                      </div>
                    </button>
                  ))}
               </div>
            </div>

            <button 
              onClick={handleRequestRide}
              className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl shadow-indigo-500/30 active:scale-95 transition-all hover:bg-indigo-500 italic flex items-center justify-center gap-3"
            >
              Initiate Ride Sequence <Navigation2 className="w-4 h-4 fill-current" />
            </button>
          </div>
        )}

        {/* Searching for Drivers */}
        {appState.rideStatus === RideStatus.SEARCHING && (
          <div className="space-y-4 animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Scanning Network</h2>
              <span className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-500/20 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Searching...
              </span>
            </div>
            <BidListSkeleton count={4} />
          </div>
        )}

        {/* Bidding Node */}
        {appState.rideStatus === RideStatus.BIDDING && (
          <div className="space-y-4 animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Nearby Transmissions</h2>
              <span className="text-[9px] font-black uppercase text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full border border-purple-500/20 animate-pulse">Scanning...</span>
            </div>
            {MOCK_BIDS.map((bid) => {
              const isDisabled = useCredits && bid.rank !== DriverRank.ELITE;
              const rankStyles = getRankStyles(bid.rank);
              
              return (
                <div key={bid.id} className={`bg-[#0f0f12] border p-5 rounded-[2.5rem] flex items-center justify-between group transition-all relative overflow-hidden ${
                  isDisabled ? 'opacity-30 grayscale blur-[1px] border-white/5' : 'border-white/5 hover:border-purple-500/30 hover:bg-[#15151a]'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`w-14 h-14 bg-gray-800 rounded-3xl flex items-center justify-center font-black text-purple-400 border shadow-inner text-xl italic transition-all ${rankStyles.border}`}>
                        {bid.driverName[0]}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg border-2 border-[#0f0f12] ${rankStyles.badge}`}>
                        {rankStyles.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-black text-sm flex items-center gap-2 tracking-tight">
                        {bid.driverName}
                        <div className={`flex items-center gap-1 text-[7px] px-2 py-0.5 rounded-md uppercase font-black tracking-widest border ${rankStyles.badge}`}>
                          {bid.rank}
                        </div>
                      </h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter opacity-60">{bid.carModel} • {bid.eta} Min ETA</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                     <p className="text-2xl font-black text-white italic tracking-tighter shadow-sm">${bid.price}</p>
                     <button 
                      onClick={() => acceptBid(bid)}
                      disabled={isDisabled}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        isDisabled 
                        ? 'bg-gray-800 text-gray-600' 
                        : 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 active:scale-95 hover:bg-purple-500'
                      }`}
                     >
                       Select Node
                     </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ACTIVE RIDE UI */}
        {isActiveRide && appState.activeBid && (
          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-[#0f0f12] rounded-[3rem] p-7 border border-white/5 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Wind className="w-24 h-24 text-indigo-500 animate-pulse" />
               </div>
               
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="relative">
                        <div className={`w-16 h-16 bg-gray-800 rounded-3xl flex items-center justify-center font-black text-purple-400 border shadow-inner text-2xl italic ${getRankStyles(appState.activeBid.rank).border}`}>
                          {appState.activeBid.driverName[0]}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-[#0f0f12] rounded-full"></div>
                     </div>
                     <div>
                        <h3 className="text-white font-black text-lg uppercase italic tracking-tighter">{appState.activeBid.driverName}</h3>
                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{appState.activeBid.carModel} • Node Active</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Telemetry ETA</p>
                     <p className="text-2xl font-black text-white italic tracking-tighter animate-pulse">{appState.activeBid.eta} MIN</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setIsEntertainmentOpen(true)}
                    className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-all shadow-xl"
                  >
                     <PlayCircle className="w-4 h-4" /> Entertainment
                  </button>
                  <button 
                    onClick={() => setIsShareOpen(true)}
                    className="flex items-center justify-center gap-3 py-4 bg-indigo-600 border border-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                  >
                     <Share2 className="w-4 h-4" /> Share Ride
                  </button>
               </div>
            </div>

            {/* Ride Status Banner */}
            <div className="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-3xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white animate-pulse">
                     <Radio className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest italic">
                    {appState.rideStatus === RideStatus.EN_ROUTE_PICKUP ? 'Intercepting Driver Node' : 
                     appState.rideStatus === RideStatus.ARRIVED ? 'Driver Node in Vicinity' : 'Synchronized Transit'}
                  </p>
               </div>
               <button 
                 onClick={() => updateState({ rideStatus: RideStatus.PAYMENT_PENDING })}
                 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-white"
               >
                 View Ledger
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Overlays */}
      {isSafetyOpen && (
        <SafeCircleOverlay 
          contacts={appState.safeCircleContacts}
          isActive={appState.isSafetyMonitoringActive}
          onUpdateContacts={(contacts) => updateState({ safeCircleContacts: contacts })}
          onToggleActive={(active) => updateState({ isSafetyMonitoringActive: active })}
          onClose={() => setIsSafetyOpen(false)}
          addNotification={addNotification}
        />
      )}

      {isShareOpen && appState.activeBid && (
        <ShareRideOverlay 
          activeBid={appState.activeBid}
          destination={appState.destination}
          contacts={appState.safeCircleContacts}
          onClose={() => setIsShareOpen(false)}
          addNotification={addNotification}
        />
      )}

      {isEntertainmentOpen && (
        <EntertainmentHub 
          onClose={() => setIsEntertainmentOpen(false)} 
          currentMood={appState.mood} 
          loyaltyPoints={appState.loyaltyPoints}
          onUpdatePoints={(newPoints) => updateState({ loyaltyPoints: newPoints })}
          addNotification={addNotification}
        />
      )}
      {isBuddyHubOpen && <BuddyHub onClose={() => setIsBuddyHubOpen(false)} userMood={appState.mood} rideStatus={appState.rideStatus} />}
      {appState.rideStatus === RideStatus.PAYMENT_PENDING && (
        <PaymentModal
          amount={finalPrice}
          creditsUsed={creditsUsedPoints}
          onComplete={handlePaymentComplete}
          onCancel={() => updateState({ rideStatus: RideStatus.IN_PROGRESS })}
        />
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0f0f12] border border-white/5 rounded-[3rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)]">
                <Star className="w-8 h-8 text-white fill-current" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Rate Your Journey</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Help us optimize the neural network</p>
              </div>

              {/* Star Rating */}
              <div className="flex items-center justify-center gap-3 py-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-all hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-700 hover:text-gray-500'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Feedback Text */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest text-left block ml-2">
                  Additional Feedback (Optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-white placeholder:text-gray-700 outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    updateState({ rideStatus: RideStatus.IDLE, activeBid: null, destination: null });
                  }}
                  className="py-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:border-white/10 transition-all"
                >
                  Skip
                </button>
                <button
                  onClick={submitRating}
                  disabled={rating === 0}
                  className="py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-500"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerDashboard;
