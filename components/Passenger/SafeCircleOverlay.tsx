
import React, { useState } from 'react';
import { X, ShieldAlert, UserPlus, Phone, HeartPulse, Check, UserCheck, Radar, ShieldCheck, AlertCircle } from 'lucide-react';
import { SafeCircleContact } from '../../types';

interface SafeCircleOverlayProps {
  contacts: SafeCircleContact[];
  isActive: boolean;
  onUpdateContacts: (contacts: SafeCircleContact[]) => void;
  onToggleActive: (active: boolean) => void;
  onClose: () => void;
  addNotification: (msg: string) => void;
}

const SafeCircleOverlay: React.FC<SafeCircleOverlayProps> = ({ 
  contacts, isActive, onUpdateContacts, onToggleActive, onClose, addNotification 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const handleAddContact = () => {
    if (!newName || !newPhone) return;
    const newContact: SafeCircleContact = {
      id: Date.now().toString(),
      name: newName,
      phone: newPhone,
      isMonitoring: false,
      lastSync: Date.now()
    };
    onUpdateContacts([...contacts, newContact]);
    setNewName("");
    setNewPhone("");
    setIsAdding(false);
    addNotification(`GUARDIAN ADDED: ${newContact.name} linked to Safety Node.`);
  };

  const handleToggleMonitoring = (id: string) => {
    const updated = contacts.map(c => 
      c.id === id ? { ...c, isMonitoring: !c.isMonitoring } : c
    );
    onUpdateContacts(updated);
  };

  return (
    <div className="fixed inset-0 z-[160] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-300">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#050505]/50">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-green-500" />
          <h2 className="text-white font-black uppercase italic tracking-tighter text-lg">Safe Circle Node</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide p-6 space-y-8">
        {/* Master Toggle Card */}
        <div className={`bg-gradient-to-br transition-all duration-500 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group ${
          isActive ? 'from-green-600 to-indigo-700' : 'from-[#0f0f12] to-[#15151a] border border-white/5'
        }`}>
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Radar className={`w-32 h-32 text-white ${isActive ? 'animate-spin-slow' : ''}`} />
           </div>
           <div className="relative z-10">
              <h3 className="text-white font-black text-2xl italic tracking-tighter uppercase mb-2">Neural Guardian Uplink</h3>
              <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-6">
                {isActive ? 'Live Telemetry Broadcasting to Linked Nodes' : 'Broadcasting Suspended - Node Dark'}
              </p>
              
              <button 
                onClick={() => {
                  onToggleActive(!isActive);
                  addNotification(isActive ? 'SAFETY LINK: Broadcasting Suspended.' : 'SAFETY LINK: Neural Guardian Active.');
                }}
                className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                  isActive 
                  ? 'bg-white text-green-700 shadow-xl' 
                  : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                }`}
              >
                {isActive ? <ShieldCheck className="w-5 h-5" /> : <Radar className="w-5 h-5" />}
                {isActive ? 'Terminate Safety Uplink' : 'Initiate Safety Uplink'}
              </button>
           </div>
        </div>

        {/* Contacts List */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Guardian Nodes</h3>
              <button 
                onClick={() => setIsAdding(true)}
                className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Add Guardian
              </button>
           </div>

           {isAdding && (
             <div className="bg-[#0f0f12] border border-white/10 rounded-[2.5rem] p-6 space-y-4 animate-in slide-in-from-top-4">
                <div className="space-y-4">
                   <div className="space-y-1">
                      <p className="text-[8px] font-black text-gray-500 uppercase ml-2 tracking-widest">Identify Name</p>
                      <input 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Elena (Safety)"
                        className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-xs font-bold text-white outline-none focus:border-indigo-500/50"
                      />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[8px] font-black text-gray-500 uppercase ml-2 tracking-widest">Mobile Frequency</p>
                      <input 
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="+263..."
                        className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-xs font-bold text-white outline-none focus:border-indigo-500/50"
                      />
                   </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setIsAdding(false)} className="flex-1 py-3 text-gray-500 font-black uppercase text-[10px]">Cancel</button>
                   <button onClick={handleAddContact} className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] shadow-lg">Establish Link</button>
                </div>
             </div>
           )}

           <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] overflow-hidden">
              {contacts.length === 0 ? (
                <div className="p-10 text-center space-y-3 opacity-30">
                   <HeartPulse className="w-12 h-12 text-gray-600 mx-auto" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">No Safety Nodes Connected</p>
                </div>
              ) : (
                contacts.map((contact, i) => (
                  <div key={contact.id} className={`p-6 flex items-center justify-between hover:bg-white/5 transition-colors ${i !== contacts.length - 1 ? 'border-b border-white/5' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white italic text-xl border border-white/10 shadow-inner ${isActive ? 'bg-green-600' : 'bg-gray-800'}`}>
                        {contact.name[0]}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase italic tracking-tighter">{contact.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-3 h-3 text-gray-600" />
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleToggleMonitoring(contact.id)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                        contact.isMonitoring 
                        ? 'bg-green-600 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                        : 'bg-black/40 border-white/5 text-gray-600 hover:text-white'
                      }`}
                    >
                      {contact.isMonitoring ? <Check className="w-3.5 h-3.5" /> : 'Sync Node'}
                    </button>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* Arrival Alerts Section */}
        <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-7 space-y-6 shadow-xl">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500">
                 <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-black text-sm uppercase italic tracking-widest tracking-tighter">Auto-Verification Alert</h4>
                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-1">Notify guardians upon node arrival</p>
              </div>
           </div>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between bg-black/40 p-5 rounded-2xl border border-white/5">
                 <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Arrival Confirmation SMS</span>
                 </div>
                 <div className="w-10 h-5 bg-indigo-600 rounded-full relative shadow-inner">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SafeCircleOverlay;
