
import React from 'react';
import { 
  X, User, Shield, Bell, CreditCard, BrainCircuit, 
  LogOut, ChevronRight, Fingerprint, Activity, 
  Leaf, Trophy, Settings as SettingsIcon, Check,
  Sparkles, Wallet, Smartphone, DollarSign, Car, 
  FileText, Hash, MapPin, Heart, Users, Zap, Star
} from 'lucide-react';
import { AppState, AIPersonality, PaymentMethod, UserRole, DriverRank } from '../../types';

interface SettingsOverlayProps {
  appState: AppState;
  updateState: (updates: Partial<AppState>) => void;
  onClose: () => void;
}

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ appState, updateState, onClose }) => {
  const personalities = Object.values(AIPersonality);
  const isDriver = appState.userRole === UserRole.DRIVER;

  const paymentMethods = [
    { id: PaymentMethod.CARD, icon: CreditCard, label: 'Cloud Card' },
    { id: PaymentMethod.ECOCASH, icon: Smartphone, label: 'EcoCash' },
    { id: PaymentMethod.PAYPAL, icon: Wallet, label: 'PayPal' },
    { id: PaymentMethod.CASH, icon: DollarSign, label: 'Cash Node' },
  ];

  const handleLogout = () => {
    updateState({ isLoggedIn: false });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#050505]/50">
        <div className="flex items-center gap-3">
          <SettingsIcon className={`w-5 h-5 ${isDriver ? 'text-purple-500' : 'text-indigo-500'}`} />
          <h2 className="text-white font-black uppercase italic tracking-tighter text-lg">
            {isDriver ? 'Driver Command Center' : 'Passenger Identity Node'}
          </h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide p-6 space-y-8">
        {/* Profile Card - Role Differentiated */}
        <div className={`bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group`}>
          <div className={`absolute top-[-10%] right-[-10%] w-[40%] h-[40%] blur-[80px] rounded-full ${isDriver ? 'bg-purple-600/10' : 'bg-indigo-600/10'}`}></div>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className={`w-24 h-24 bg-gradient-to-tr rounded-[2.5rem] flex items-center justify-center border-4 border-[#050505] shadow-2xl transition-all ${
                isDriver ? 'from-purple-600 to-amber-500' : 'from-indigo-600 to-cyan-500'
              }`}>
                <span className="text-4xl font-black text-white italic">{appState.userName[0]}</span>
              </div>
              <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl border-4 border-[#0f0f12] shadow-xl ${isDriver ? 'bg-amber-400' : 'bg-indigo-400'}`}>
                {isDriver ? <Zap className="w-4 h-4 text-black" /> : <Trophy className="w-4 h-4 text-white" />}
              </div>
            </div>
            
            <div>
              <input 
                value={appState.userName}
                onChange={(e) => updateState({ userName: e.target.value })}
                className="bg-transparent text-2xl font-black text-white text-center italic tracking-tighter outline-none focus:text-indigo-400 transition-colors w-full"
              />
              <div className={`inline-flex items-center gap-2 mt-1 px-3 py-1 bg-white/5 border border-white/5 rounded-full`}>
                <span className={`text-[8px] font-black uppercase tracking-widest ${isDriver ? 'text-amber-400' : 'text-indigo-400'}`}>
                  {isDriver ? `${appState.driverRank} Level Operator` : 'Premium Commuter Node'}
                </span>
              </div>
            </div>

            {/* Role Specific Metadata */}
            <div className="w-full grid grid-cols-2 gap-3 mt-2">
              {isDriver ? (
                <>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1 text-left">Vehicle Node</p>
                    <div className="flex items-center gap-2">
                      <Car className="w-3 h-3 text-purple-400" />
                      <span className="text-[10px] font-black text-white italic">ABX-9021</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1 text-left">Licence Uplink</p>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 text-purple-400" />
                      <span className="text-[10px] font-black text-white italic">#DRV-2025-01</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1 text-left">National ID</p>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-indigo-400" />
                      <span className="text-[10px] font-black text-white italic">63-231XXX-W</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1 text-left">Contact Node</p>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-3 h-3 text-indigo-400" />
                      <span className="text-[10px] font-black text-white italic">+263 7...</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5">
             <div className="text-center">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">{isDriver ? 'Revenue' : 'Impact'}</p>
                <div className="flex items-center justify-center gap-1.5">
                   {isDriver ? <DollarSign className="w-3 h-3 text-green-500" /> : <Leaf className="w-3 h-3 text-green-500" />}
                   <span className="text-sm font-black text-white italic">{isDriver ? `$${appState.earnings.toFixed(0)}` : `${appState.carbonOffset}kg`}</span>
                </div>
             </div>
             <div className="text-center border-x border-white/5">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">{isDriver ? 'Rating' : 'Status'}</p>
                <div className="flex items-center justify-center gap-1.5">
                   {isDriver ? <Star className="w-3 h-3 text-amber-500" /> : <Activity className="w-3 h-3 text-indigo-500" />}
                   <span className="text-sm font-black text-white italic">{isDriver ? appState.driverRating : appState.completedRides}</span>
                </div>
             </div>
             <div className="text-center">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Points</p>
                <div className="flex items-center justify-center gap-1.5">
                   <Sparkles className="w-3 h-3 text-indigo-500" />
                   <span className="text-sm font-black text-white italic">{appState.loyaltyPoints}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Neural Tuning - AI Personality Settings */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Companion Tuning</h3>
              <Sparkles className="w-3 h-3 text-indigo-500" />
           </div>
           <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-6 space-y-6">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <BrainCircuit className="w-4 h-4 text-indigo-500" />
                    <p className="text-xs font-black text-white uppercase italic tracking-widest">Neural Persona</p>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    {personalities.map(p => (
                      <button 
                        key={p}
                        onClick={() => updateState({ aiPersonality: p })}
                        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all ${
                          appState.aiPersonality === p 
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' 
                          : 'bg-black/40 border-white/5 text-gray-500'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Economic Configuration */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{isDriver ? 'Payout Protocol' : 'Settlement Method'}</h3>
              <Wallet className="w-3 h-3 text-green-500" />
           </div>
           <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-6 space-y-4">
              {paymentMethods.map((pm) => (
                <button 
                  key={pm.id}
                  onClick={() => updateState({ selectedPaymentMethod: pm.id })}
                  className="w-full flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                      <pm.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{pm.label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${appState.selectedPaymentMethod === pm.id ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-white/10'}`}>
                    {appState.selectedPaymentMethod === pm.id && <Check className="w-3 h-3 stroke-[3px]" />}
                  </div>
                </button>
              ))}
           </div>
        </div>

        {/* Security & Role Specific Settings */}
        <div className="space-y-4">
           <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-4">Advanced Logic</h3>
           <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-6 space-y-4">
              <ToggleRow 
                label="Biometric Handshake" 
                desc="Encryption verification via FaceID" 
                icon={Fingerprint} 
                active={appState.biometricsEnabled}
                onClick={() => updateState({ biometricsEnabled: !appState.biometricsEnabled })}
              />
              <ToggleRow 
                label="Neural Haptics" 
                desc="Physical feedback on link events" 
                icon={Activity} 
                active={appState.hapticsEnabled}
                onClick={() => updateState({ hapticsEnabled: !appState.hapticsEnabled })}
              />
              {isDriver ? (
                <ToggleRow 
                  label="Auto-Accept High Bids" 
                  desc="Neural matching priority" 
                  icon={Zap} 
                  active={true}
                  onClick={() => {}}
                />
              ) : (
                <ToggleRow 
                  label="Share Mood Node" 
                  desc="Sync vibe with matched buddies" 
                  icon={Users} 
                  active={true}
                  onClick={() => {}}
                />
              )}
           </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 pb-12">
          <button 
            onClick={handleLogout}
            className="w-full py-6 bg-red-600/10 border border-red-500/20 text-red-500 rounded-[2.5rem] font-black uppercase tracking-[0.3em] italic flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-2xl"
          >
            <LogOut className="w-5 h-5" /> Terminate Node Session
          </button>
          <div className="text-center mt-6">
             <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Mufambi Core v9.8.1 • Stable Handshake</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToggleRow = ({ label, desc, icon: Icon, active, onClick }: any) => (
  <div className="flex items-center justify-between p-2">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white/5 rounded-2xl text-gray-400">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">{label}</h4>
        <p className="text-[8px] text-gray-500 font-black uppercase tracking-tighter">{desc}</p>
      </div>
    </div>
    <button 
      onClick={onClick}
      className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-indigo-600' : 'bg-gray-800'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7 shadow-[0_0_10px_#fff]' : 'left-1'}`}></div>
    </button>
  </div>
);

export default SettingsOverlay;
