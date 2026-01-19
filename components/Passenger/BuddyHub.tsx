
import React, { useState, useEffect } from 'react';
import { X, Users, MessageCircle, Sparkles, Send, Circle, Search, Heart, MapPin, Radio } from 'lucide-react';
import { Buddy, Message, RideStatus } from '../../types.ts';
import { getBuddySuggestions } from '../../services/gemini.ts';

interface BuddyHubProps {
  onClose: () => void;
  userMood: string;
  rideStatus: RideStatus;
}

const BuddyHub: React.FC<BuddyHubProps> = ({ onClose, userMood, rideStatus }) => {
  const [activeTab, setActiveTab] = useState<'BUDDIES' | 'DISCOVER' | 'CHAT'>('BUDDIES');
  const [selectedBuddy, setSelectedBuddy] = useState<Buddy | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'DISCOVER') {
      loadSuggestions();
    }
  }, [activeTab]);

  const loadSuggestions = async () => {
    setIsLoading(true);
    const results = await getBuddySuggestions(userMood, rideStatus);
    setSuggestions(results);
    setIsLoading(false);
  };

  const handleStartChat = (buddy: Buddy) => {
    setSelectedBuddy(buddy);
    setActiveTab('CHAT');
    setChatMessages([
      { id: '1', senderId: buddy.id, text: `Hey! I see we both have a ${buddy.vibe.toLowerCase()} vibe today. Heading far?`, timestamp: Date.now() - 100000 }
    ]);
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      text: inputText,
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, newMsg]);
    setInputText("");
    
    // Simple mock reply
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        senderId: selectedBuddy?.id || 'bot',
        text: "That sounds cool! Mufambi is great for these shared vibes.",
        timestamp: Date.now()
      }]);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-end justify-center px-4 pb-24 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md h-[600px] bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/10 animate-in slide-in-from-bottom-10 duration-500">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Ride Buddies</h3>
              <p className="text-[10px] opacity-70 uppercase tracking-widest font-black">Find your commute tribe</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 py-3 bg-gray-50 dark:bg-gray-800 gap-2">
          {[
            { id: 'BUDDIES', label: 'My Buddies', icon: Heart },
            { id: 'DISCOVER', label: 'Discover', icon: Sparkles },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-900 text-gray-400 border dark:border-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-hide bg-white dark:bg-gray-900">
          {activeTab === 'BUDDIES' && (
            <div className="space-y-3">
              {[
                { id: 'b1', name: 'Farai G.', vibe: 'Chill', isOnline: true, avatar: 'FG' },
                { id: 'b2', name: 'Sarah L.', vibe: 'Tired', isOnline: false, avatar: 'SL' },
              ].map(buddy => (
                <div 
                  key={buddy.id}
                  onClick={() => handleStartChat({ ...buddy, commonInterests: [] } as any)}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border dark:border-gray-700 hover:border-blue-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center font-bold text-blue-600">
                        {buddy.avatar}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${buddy.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm group-hover:text-blue-600 transition-colors">{buddy.name}</h4>
                      <p className="text-[10px] text-gray-400 uppercase font-black">{buddy.vibe} Vibe • {buddy.isOnline ? 'Online' : 'Offline'}</p>
                    </div>
                  </div>
                  <MessageCircle className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'DISCOVER' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">AI Neural Matcher</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-black/40 rounded-full border dark:border-white/5">
                    <Radio className="w-3 h-3 text-green-500 animate-pulse" />
                    <span className="text-[8px] font-black uppercase text-gray-400 tracking-tighter">{rideStatus}</span>
                  </div>
                </div>
                <p className="text-[11px] text-indigo-800 dark:text-indigo-300 font-medium leading-relaxed">
                  Synchronizing travelers in the <strong className="uppercase italic tracking-tighter">{rideStatus}</strong> phase with your <strong className="underline decoration-indigo-400 italic">{userMood}</strong> node.
                </p>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center py-12 space-y-4">
                   <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-[10px] font-black uppercase text-gray-400 animate-pulse">Scanning Satellite Data...</p>
                </div>
              ) : (
                suggestions.map((s, i) => (
                  <div key={i} className="p-5 bg-white dark:bg-gray-800 rounded-3xl border dark:border-gray-700 shadow-sm relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-3">
                      <div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 px-2.5 py-1 rounded-full text-[8px] font-black uppercase border border-indigo-500/10">98% Match</div>
                    </div>
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-blue-200 dark:from-indigo-900 dark:to-blue-900 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-xl italic shadow-inner">
                        {s.name[0]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-lg leading-tight italic tracking-tighter uppercase">{s.name}</h4>
                        <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{s.vibe} Protocol</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {s.commonInterests.map((interest: string, j: number) => (
                          <span key={j} className="text-[9px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg font-black text-gray-600 dark:text-gray-300 uppercase tracking-tighter">#{interest}</span>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 italic font-medium">
                        "{s.matchReason}"
                      </p>
                    </div>
                    <button 
                      onClick={() => handleStartChat({ id: `s${i}`, name: s.name, avatar: s.name[0], vibe: s.vibe, isOnline: true, commonInterests: s.commonInterests })}
                      className="w-full mt-4 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none"
                    >
                      Establish Uplink
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'CHAT' && selectedBuddy && (
            <div className="h-full flex flex-col -mt-4 -mx-4 bg-gray-50 dark:bg-gray-900">
              {/* Mini Chat Header */}
              <div className="p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveTab('BUDDIES')} className="p-2 hover:bg-gray-100 rounded-full">
                    <Circle className="w-4 h-4 text-gray-400 fill-current" />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-xs shadow-inner">
                      {selectedBuddy.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-tight">{selectedBuddy.name}</h4>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Active Now</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto scroll-hide flex flex-col">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.senderId === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-medium shadow-sm ${
                      m.senderId === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border dark:border-gray-700'
                    }`}>
                      {m.text}
                      <div className={`text-[8px] mt-1 opacity-60 text-right uppercase tracking-tighter`}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-2xl border dark:border-gray-700 focus-within:ring-2 ring-indigo-500/20 transition-all">
                  <input 
                    type="text" 
                    placeholder="Encrypted transmission..." 
                    className="bg-transparent text-sm w-full outline-none font-medium"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button onClick={sendMessage} className="text-blue-600 p-1 hover:bg-blue-50 rounded-lg transition-colors">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuddyHub;
