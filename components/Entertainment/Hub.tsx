
import React, { useState, useEffect } from 'react';
import { X, Youtube, Music, Play, Search as SearchIcon, ShieldCheck, Gamepad2, Coins, AlertTriangle, Radio, PlayCircle, Apple, ListMusic } from 'lucide-react';
import Arcade from './Arcade';

interface EntertainmentHubProps {
  onClose: () => void;
  currentMood: string;
  loyaltyPoints: number;
  onUpdatePoints: (newPoints: number) => void;
  addNotification: (msg: string) => void;
}

type TabType = 'Music' | 'Games';
type StreamingService = 'Spotify' | 'YouTube' | 'Apple';

const EntertainmentHub: React.FC<EntertainmentHubProps> = ({ onClose, currentMood, loyaltyPoints, onUpdatePoints, addNotification }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Music');
  const [activeService, setActiveService] = useState<StreamingService>('Spotify');
  const [searchQuery, setSearchQuery] = useState("");
  const [currentEmbed, setCurrentEmbed] = useState("");

  const MOOD_PLAYLISTS: Record<string, Record<StreamingService, string>> = {
    Happy: { Spotify: '37i9dQZF1DX3rxuuvvY635', YouTube: 'PLw-VjHDlK2LctOXIdp_Y9-vKjH3eL7Vf7', Apple: 'pl.f4d1ef2dd29644cfa1aed139db08c3e2' },
    Excited: { Spotify: '37i9dQZF1DX4pUKG1kS0Ky', YouTube: 'PLFgquLnL59alCl_2TQv6747dfVPZ_06kz', Apple: 'pl.2b0e6e33222c4b6f84004c5dabb92305' },
    Tired: { Spotify: '37i9dQZF1DWZeKzbUnY3Yy', YouTube: 'PL6NdkXsS6Hj3o2_9N9FqLidB8rX0vXW2j', Apple: 'pl.073f84ef964a44119f03673059f1f10c' },
    Stressed: { Spotify: '37i9dQZF1DWZqd5YICIuS9s', YouTube: 'PLh-A7S9hpt6XG8v5r5P7I9C7hK3S2C6V_', Apple: 'pl.10a9f5d342084478a05c1d683501a45a' },
    Quiet: { Spotify: '37i9dQZF1DX0S0BSuonC3M', YouTube: 'PLh-A7S9hpt6U0_Xv5r5P7I9C7hK3S2C6V_', Apple: 'pl.b8e6e33222c4b6f84004c5dabb92305' },
    Neutral: { Spotify: '37i9dQZF1DXcBWIGoYBM3M', YouTube: 'PLw-VjHDlK2LctOXIdp_Y9-vKjH3eL7Vf7', Apple: 'pl.f4d1ef2dd29644cfa1aed139db08c3e2' }
  };

  useEffect(() => {
    if (activeTab === 'Music') updateEmbed();
  }, [activeService, currentMood, activeTab]);

  const updateEmbed = (query?: string) => {
    const moodData = MOOD_PLAYLISTS[currentMood] || MOOD_PLAYLISTS.Neutral;
    
    if (activeService === 'YouTube') {
      const url = query 
        ? `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}&origin=${window.location.origin}`
        : `https://www.youtube.com/embed/videoseries?list=${moodData.YouTube}&origin=${window.location.origin}`;
      setCurrentEmbed(url);
    } else if (activeService === 'Spotify') {
      setCurrentEmbed(`https://open.spotify.com/embed/playlist/${moodData.Spotify}?utm_source=generator&theme=0`);
    } else {
      setCurrentEmbed(`https://embed.music.apple.com/us/playlist/${moodData.Apple}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      updateEmbed(searchQuery);
      addNotification(`SEARCH: Querying Neural Media Node for "${searchQuery}"`);
    }
  };

  const services = [
    { id: 'Spotify' as StreamingService, name: 'Spotify', icon: Music, color: 'bg-[#1DB954]', activeShadow: 'shadow-[#1DB954]/40' },
    { id: 'YouTube' as StreamingService, name: 'YouTube', icon: Youtube, color: 'bg-[#FF0000]', activeShadow: 'shadow-[#FF0000]/40' },
    { id: 'Apple' as StreamingService, name: 'Apple Music', icon: ListMusic, color: 'bg-[#FC3C44]', activeShadow: 'shadow-[#FC3C44]/40' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-24 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="w-full max-w-md h-[80vh] bg-[#0a0a0c] rounded-[3.5rem] shadow-[0_0_120px_rgba(0,0,0,1)] overflow-hidden animate-in slide-in-from-bottom-12 duration-500 border border-white/5 flex flex-col">
        
        {/* Integrated Console Header */}
        <div className="p-8 bg-gradient-to-b from-[#111116] to-[#0a0a0c] border-b border-white/5 relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
                <PlayCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-black text-xl italic tracking-tighter uppercase text-white">Media Deck</h3>
                <p className="text-[8px] opacity-40 font-black uppercase tracking-[0.3em] text-indigo-400">Integrated Streaming Node</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-gray-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Service Selector Grid */}
          <div className="grid grid-cols-3 gap-3">
            {services.map(service => (
              <button
                key={service.id}
                onClick={() => {
                  setActiveService(service.id);
                  setSearchQuery("");
                }}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-3xl transition-all duration-300 relative group ${
                  activeService === service.id
                    ? `${service.color} text-white ${service.activeShadow} shadow-lg scale-105 z-10`
                    : 'bg-[#15151a] text-gray-600 border border-white/5 hover:border-white/10'
                }`}
              >
                <service.icon className={`w-5 h-5 ${activeService === service.id ? 'animate-pulse' : ''}`} />
                <span className="text-[8px] font-black uppercase tracking-widest">{service.name}</span>
                {activeService === service.id && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Global Stats bar */}
        <div className="bg-[#050505] px-8 py-3 flex items-center justify-between border-b border-white/5">
           <div className="flex items-center gap-2">
              <Coins className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-[10px] font-black text-white italic">{loyaltyPoints} CREDITS</span>
           </div>
           <div className="flex items-center gap-3">
              <Radio className="w-3 h-3 text-indigo-500 animate-pulse" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Active Link: {activeService}</span>
           </div>
        </div>

        {activeTab === 'Music' ? (
          <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
            {/* Contextual Search */}
            <div className="px-6 py-4 bg-[#0a0a0c] border-b border-white/5">
              <form onSubmit={handleSearch} className="relative group">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder={`Search ${activeService} Node...`}
                  className="w-full pl-12 pr-4 py-4 bg-[#050505] border border-white/5 rounded-2xl text-[10px] font-black tracking-widest uppercase focus:border-indigo-500/40 outline-none transition-all placeholder:text-gray-800 italic text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {/* Embedded Web Player Container */}
            <div className="flex-1 relative bg-black flex flex-col overflow-hidden m-4 rounded-[2.5rem] border border-white/5 shadow-inner">
              <div className="absolute inset-0 pointer-events-none border-[8px] border-black/50 z-20 rounded-[2.5rem]"></div>
              <iframe 
                src={currentEmbed} 
                className="w-full h-full border-0 rounded-[2.5rem]" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
                title={`${activeService} Player`}
              />
              
              {/* Overlay for inactive states / loading */}
              {!currentEmbed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Synchronizing Uplink...</p>
                </div>
              )}
            </div>
            
            {/* Mood Footer */}
            <div className="p-6 bg-[#0a0a0c] border-t border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Neural Frequency</p>
                    <p className="text-[11px] font-black text-white italic tracking-tighter uppercase">{currentMood} Protocol Active</p>
                  </div>
               </div>
               <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Secure internal Stream</span>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-[#050505] overflow-hidden flex flex-col">
            <Arcade 
              points={loyaltyPoints} 
              onUpdatePoints={onUpdatePoints} 
              addNotification={addNotification} 
            />
          </div>
        )}

        {/* Global Arcade Navigation Tabs */}
        <div className="p-4 bg-[#0a0a0c] border-t border-white/10 flex items-center justify-center gap-4 pb-8">
           <button 
             onClick={() => setActiveTab('Music')}
             className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${
               activeTab === 'Music' 
               ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
               : 'bg-white/5 text-gray-600 border border-white/5'
             }`}
           >
             <Music className="w-4 h-4" /> Music Sync
           </button>
           <button 
             onClick={() => setActiveTab('Games')}
             className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${
               activeTab === 'Games' 
               ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/20' 
               : 'bg-white/5 text-gray-600 border border-white/5'
             }`}
           >
             <Gamepad2 className="w-4 h-4" /> Neural Games
           </button>
        </div>
      </div>
    </div>
  );
};

export default EntertainmentHub;
