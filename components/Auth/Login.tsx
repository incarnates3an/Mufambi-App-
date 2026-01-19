
import React, { useState } from 'react';
import { UserRole } from '../../types';
import { 
  Car, User, Zap, Shield, ChevronRight, Fingerprint, Globe, 
  Phone, CreditCard, Camera, Scan, CheckCircle2, AlertCircle, 
  ArrowLeft, Info, Hash, UserCircle
} from 'lucide-react';

interface LoginProps {
  onSelectRole: (role: UserRole) => void;
}

type AuthState = 'ROLE_SELECTION' | 'PASSENGER_REG' | 'DRIVER_REG' | 'VERIFYING';

const Login: React.FC<LoginProps> = ({ onSelectRole }) => {
  const [authState, setAuthState] = useState<AuthState>('ROLE_SELECTION');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    phone: '',
    nationalId: '',
    numberPlate: '',
    selfie: null as string | null,
    license: null as string | null,
  });

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    setAuthState(role === UserRole.PASSENGER ? 'PASSENGER_REG' : 'DRIVER_REG');
  };

  const handleInitialize = () => {
    setAuthState('VERIFYING');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setLoadingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        if (selectedRole) onSelectRole(selectedRole);
      }
    }, 50);
  };

  const InputNode = ({ icon: Icon, label, placeholder, value, onChange, type = "text" }: any) => (
    <div className="space-y-2 group">
      <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2 italic">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/50 group-focus-within:text-indigo-400 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#111115] border border-white/5 p-4 pl-12 rounded-2xl text-xs font-bold text-white outline-none focus:border-indigo-500/40 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-gray-700"
        />
      </div>
    </div>
  );

  const FileNode = ({ icon: Icon, label, status, onSimulate }: any) => (
    <button 
      onClick={onSimulate}
      className={`w-full p-5 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98] ${
        status ? 'bg-green-500/10 border-green-500/20' : 'bg-[#111115] border-white/5 hover:border-white/10'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl ${status ? 'bg-green-500 text-white' : 'bg-gray-800 text-indigo-400'}`}>
          {status ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
        </div>
        <div className="text-left">
          <span className="block text-[10px] font-black uppercase text-white tracking-widest">{label}</span>
          <span className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">
            {status ? 'Neural Link Encrypted' : 'Requires Visual Scan'}
          </span>
        </div>
      </div>
      {!status && <Scan className="w-4 h-4 text-gray-600 animate-pulse" />}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-between p-8 overflow-hidden text-gray-100">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between z-10">
        {authState !== 'ROLE_SELECTION' && authState !== 'VERIFYING' && (
          <button onClick={() => setAuthState('ROLE_SELECTION')} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2 ml-auto px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
           <Globe className="w-3 h-3 text-indigo-400" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Node Sync Active</span>
        </div>
      </div>

      {/* Main Content Node */}
      <div className="w-full max-w-sm flex-1 flex flex-col justify-center relative z-10">
        
        {authState === 'ROLE_SELECTION' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-4">
              <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase">Mufambi</h1>
              <p className="text-[10px] font-black text-indigo-400/80 uppercase tracking-[0.5em] italic">Neural Transport Gateway</p>
            </div>
            
            <div className="space-y-4">
              <button onClick={() => handleRoleSelection(UserRole.PASSENGER)} className="w-full group relative overflow-hidden bg-gradient-to-br from-[#1a1a24] to-[#0f0f12] p-8 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/40 transition-all active:scale-95 shadow-2xl">
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-white/10">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-black text-xl italic tracking-tighter uppercase">Passenger</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Commute with Intelligence</p>
                  </div>
                </div>
              </button>

              <button onClick={() => handleRoleSelection(UserRole.DRIVER)} className="w-full group relative overflow-hidden bg-gradient-to-br from-[#121215] to-[#050505] p-8 rounded-[2.5rem] border border-white/5 hover:border-purple-500/40 transition-all active:scale-95 shadow-2xl">
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner group-hover:bg-purple-600 transition-colors">
                    <Zap className="w-8 h-8 text-purple-400 group-hover:text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-black text-xl italic tracking-tighter uppercase">Elite Driver</h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Optimize Your Revenue</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {authState === 'PASSENGER_REG' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">Passenger Link</h2>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Initialize your travel node</p>
            </div>
            <div className="space-y-4">
              <InputNode 
                label="Mobile Identity" icon={Phone} placeholder="+263 7..." 
                value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} 
              />
              <InputNode 
                label="National ID" icon={CreditCard} placeholder="63-XXXXXX-X-XX" 
                value={formData.nationalId} onChange={(v: string) => setFormData({...formData, nationalId: v})} 
              />
            </div>
            <div className="flex items-center gap-3 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
               <Info className="w-4 h-4 text-indigo-500" />
               <p className="text-[8px] font-black uppercase text-indigo-400/80 leading-relaxed tracking-widest italic">
                 Your node is secured by end-to-end neural encryption. No data is stored on public terminals.
               </p>
            </div>
            <button onClick={handleInitialize} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 active:scale-95 hover:bg-indigo-500 transition-all">
              Initialize Node
            </button>
          </div>
        )}

        {authState === 'DRIVER_REG' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 overflow-y-auto scroll-hide max-h-[70vh] py-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">Fleet Uplink</h2>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Connect your mobile asset</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputNode 
                  label="Phone" icon={Phone} placeholder="+263..." 
                  value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} 
                />
                <InputNode 
                  label="Plate" icon={Hash} placeholder="ABC 1234" 
                  value={formData.numberPlate} onChange={(v: string) => setFormData({...formData, numberPlate: v})} 
                />
              </div>
              <InputNode 
                label="National ID" icon={CreditCard} placeholder="63-XXXXXX-X-XX" 
                value={formData.nationalId} onChange={(v: string) => setFormData({...formData, nationalId: v})} 
              />
              
              <div className="space-y-3 pt-4 border-t border-white/5">
                <FileNode 
                  icon={UserCircle} label="Biometric Selfie" status={formData.selfie} 
                  onSimulate={() => setFormData({...formData, selfie: 'SIM_ID'})} 
                />
                <FileNode 
                  icon={Camera} label="Driver's License" status={formData.license} 
                  onSimulate={() => setFormData({...formData, license: 'SIM_LICENSE'})} 
                />
              </div>
            </div>

            <button 
              onClick={handleInitialize} 
              disabled={!formData.selfie || !formData.license}
              className="w-full mt-6 py-5 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20 active:scale-95 hover:bg-purple-500 transition-all disabled:opacity-30"
            >
              Initialize Fleet Link
            </button>
          </div>
        )}

        {authState === 'VERIFYING' && (
          <div className="flex flex-col items-center justify-center space-y-12 animate-in zoom-in-95">
             <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-indigo-600/10 rounded-full"></div>
                <div 
                  className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(99,102,241,0.5)]" 
                  style={{ animationDuration: '1s' }}
                ></div>
                <div className="absolute inset-4 border-2 border-purple-500/20 border-b-transparent rounded-full animate-spin-reverse" style={{ animationDuration: '3s' }}></div>
                <Fingerprint className="w-16 h-16 text-indigo-500 animate-pulse" />
             </div>
             <div className="text-center space-y-4">
                <h4 className="text-white font-black uppercase tracking-[0.4em] text-sm italic">Verifying Neural Node</h4>
                <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                   <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
                </div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic animate-pulse">
                  {loadingProgress < 40 ? 'Synthesizing Biometrics...' : 
                   loadingProgress < 80 ? 'Validating Gov Ledger...' : 'Finalizing Handshake...'}
                </p>
             </div>
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="mb-12 flex flex-col items-center gap-4 z-10">
        <div className="flex items-center gap-2 opacity-30">
           <Shield className="w-3 h-3 text-gray-500" />
           <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">Precision Protocol v4.8.2-Neural</p>
        </div>
      </div>

      <style>{`
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
