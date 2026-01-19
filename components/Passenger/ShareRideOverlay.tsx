
import React from 'react';
import { X, Share2, Send, ShieldCheck, Users, Globe, Copy, Check, MessageSquare } from 'lucide-react';
import { DriverBid, SafeCircleContact, Location } from '../../types';

interface ShareRideOverlayProps {
  activeBid: DriverBid | null;
  destination: Location | null;
  contacts: SafeCircleContact[];
  onClose: () => void;
  addNotification: (msg: string) => void;
}

const ShareRideOverlay: React.FC<ShareRideOverlayProps> = ({ 
  activeBid, destination, contacts, onClose, addNotification 
}) => {
  const [copied, setCopied] = React.useState(false);

  const shareText = `Mufambi Ride Sync: I'm in a ${activeBid?.carModel} with ${activeBid?.driverName}. ETA: ${activeBid?.eta} mins to ${destination?.address || 'Destination'}. Track my node.`;

  const handleSystemShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mufambi Ride Telemetry',
          text: shareText,
          url: window.location.href,
        });
        addNotification("SYSTEM: Telemetry shared via External Link.");
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    addNotification("LEDGER: Telemetry copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWithGuardian = (name: string) => {
    addNotification(`ENCRYPTED UPLINK: Ride data sent to ${name}.`);
  };

  return (
    <div className="fixed inset-0 z-[170] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-end p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#0f0f12] rounded-[3rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col animate-in slide-in-from-bottom-12 duration-500">
        
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5" />
            <h3 className="font-black text-lg italic tracking-tighter uppercase">Broadcast Telemetry</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto scroll-hide">
          {/* Summary Card */}
          <div className="bg-black/40 rounded-3xl p-5 border border-white/5 space-y-3">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Data Stream</p>
            <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
               <p className="text-xs font-medium text-gray-300 leading-relaxed italic">
                 "{shareText}"
               </p>
            </div>
          </div>

          {/* Quick Share Guardians */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
               <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Linked Guardians</h4>
               <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {contacts.length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-3xl opacity-30">
                  <p className="text-[10px] font-black uppercase tracking-widest">No Safety Nodes Found</p>
                </div>
              ) : (
                contacts.map(contact => (
                  <button 
                    key={contact.id}
                    onClick={() => shareWithGuardian(contact.name)}
                    className="w-full p-4 flex items-center justify-between bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all active:scale-95 group"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white italic">
                         {contact.name[0]}
                       </div>
                       <div className="text-left">
                          <p className="text-xs font-black text-white uppercase italic tracking-tighter">{contact.name}</p>
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{contact.phone}</p>
                       </div>
                    </div>
                    <Send className="w-4 h-4 text-gray-600 group-hover:text-indigo-400" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* External Options */}
          <div className="grid grid-cols-2 gap-4">
             <button 
               onClick={handleCopy}
               className="p-5 bg-white/5 rounded-3xl border border-white/5 flex flex-col items-center gap-3 transition-all active:scale-95 hover:bg-white/10"
             >
                <div className="p-2.5 bg-gray-800 rounded-xl text-gray-400">
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Copy Node</span>
             </button>
             <button 
               onClick={handleSystemShare}
               className="p-5 bg-indigo-600 rounded-3xl border border-indigo-500/50 flex flex-col items-center gap-3 transition-all active:scale-95 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
             >
                <div className="p-2.5 bg-white/20 rounded-xl text-white">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">External</span>
             </button>
          </div>
        </div>

        <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-center gap-3">
           <MessageSquare className="w-4 h-4 text-indigo-400" />
           <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] italic">Precision Encrypted Broadcast</p>
        </div>
      </div>
    </div>
  );
};

export default ShareRideOverlay;
