
import React, { useState } from 'react';
import { 
  X, Wallet, Coins, CreditCard, Smartphone, DollarSign, 
  ArrowUpRight, History, ShieldCheck, Check, Plus, 
  ArrowDownLeft, Sparkles, TrendingUp, Zap
} from 'lucide-react';
import { AppState, PaymentMethod } from '../../types';

interface WalletOverlayProps {
  appState: AppState;
  updateState: (updates: Partial<AppState>) => void;
  onClose: () => void;
  addNotification: (msg: string) => void;
}

const WalletOverlay: React.FC<WalletOverlayProps> = ({ appState, updateState, onClose, addNotification }) => {
  const [isToppingUp, setIsToppingUp] = useState(false);
  
  const paymentOptions = [
    { id: PaymentMethod.CARD, name: 'Cloud Card', icon: CreditCard, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { id: PaymentMethod.ECOCASH, name: 'EcoCash Node', icon: Smartphone, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { id: PaymentMethod.PAYPAL, name: 'PayPal Node', icon: Wallet, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: PaymentMethod.CASH, name: 'Physical Asset', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  const transactions = [
    { id: '1', type: 'Ride Payment', amount: -12.50, date: 'Today, 2:45 PM', status: 'Completed', icon: ArrowUpRight },
    { id: '2', type: 'Node Top-up', amount: 50.00, date: 'Yesterday', status: 'Completed', icon: ArrowDownLeft },
    { id: '3', type: 'Ride Payment', amount: -8.20, date: 'Oct 24', status: 'Completed', icon: ArrowUpRight },
    { id: '4', type: 'Loyalty Bonus', amount: 5.00, date: 'Oct 22', status: 'Completed', icon: Sparkles },
  ];

  const handleTopUp = () => {
    setIsToppingUp(true);
    setTimeout(() => {
      updateState({ walletBalance: appState.walletBalance + 50 });
      setIsToppingUp(false);
      addNotification("FINANCE LINK: $50.00 Injected into Wallet Node.");
    }, 1500);
  };

  const pointsValue = appState.loyaltyPoints / 100;

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#050505]/50">
        <div className="flex items-center gap-3">
          <Wallet className="w-5 h-5 text-indigo-500" />
          <h2 className="text-white font-black uppercase italic tracking-tighter text-lg">Neural Finance Node</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide p-6 space-y-8">
        {/* Main Balance Card */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
             <Zap className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">Liquid Assets</p>
                <h3 className="text-4xl font-black text-white italic tracking-tighter">${appState.walletBalance.toFixed(2)}</h3>
              </div>
              <button 
                onClick={handleTopUp}
                disabled={isToppingUp}
                className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/20 hover:bg-white/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isToppingUp ? <History className="w-5 h-5 text-white animate-spin" /> : <Plus className="w-5 h-5 text-white" />}
              </button>
            </div>
            
            <div className="flex items-center gap-6 pt-4 border-t border-white/10">
               <div>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Loyalty Node</p>
                  <div className="flex items-center gap-2">
                    <Coins className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-sm font-black text-white italic">{appState.loyaltyPoints} PTS</span>
                  </div>
               </div>
               <div className="h-8 w-px bg-white/10"></div>
               <div>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Credit Value</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-sm font-black text-white italic">${pointsValue.toFixed(2)}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Grid */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Settlement Protocols</h3>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              {paymentOptions.map((pm) => (
                <button 
                  key={pm.id}
                  onClick={() => updateState({ selectedPaymentMethod: pm.id })}
                  className={`p-5 rounded-[2rem] border transition-all flex flex-col items-center gap-3 text-center group ${
                    appState.selectedPaymentMethod === pm.id 
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-500/20' 
                    : 'bg-[#0f0f12] border-white/5 text-gray-500 hover:border-white/10'
                  }`}
                >
                  <div className={`p-3 rounded-2xl transition-colors ${appState.selectedPaymentMethod === pm.id ? 'bg-white/20' : pm.bg + ' ' + pm.color}`}>
                    <pm.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className={`block text-[10px] font-black uppercase tracking-widest mb-0.5 ${appState.selectedPaymentMethod === pm.id ? 'text-white' : 'text-white/80'}`}>{pm.name}</span>
                    <span className={`text-[8px] font-bold uppercase tracking-tighter ${appState.selectedPaymentMethod === pm.id ? 'text-white/50' : 'text-gray-600'}`}>
                      {appState.selectedPaymentMethod === pm.id ? 'Selected Node' : 'Initialize Link'}
                    </span>
                  </div>
                  {appState.selectedPaymentMethod === pm.id && (
                    <div className="absolute top-3 right-3">
                       <Check className="w-3 h-3 text-white stroke-[4px]" />
                    </div>
                  )}
                </button>
              ))}
           </div>
        </div>

        {/* Transaction History */}
        <div className="space-y-4 pb-12">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Ledger History</h3>
              <History className="w-3.5 h-3.5 text-gray-600" />
           </div>
           <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] overflow-hidden">
              {transactions.map((tx, i) => (
                <div key={tx.id} className={`p-5 flex items-center justify-between hover:bg-white/5 transition-colors ${i !== transactions.length - 1 ? 'border-b border-white/5' : ''}`}>
                   <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${tx.amount < 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                         <tx.icon className="w-4 h-4" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-white uppercase tracking-widest">{tx.type}</p>
                         <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">{tx.date}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className={`text-sm font-black italic tracking-tighter ${tx.amount < 0 ? 'text-white' : 'text-green-400'}`}>
                        {tx.amount < 0 ? '' : '+'}${Math.abs(tx.amount).toFixed(2)}
                      </p>
                      <p className="text-[7px] font-black text-gray-700 uppercase tracking-widest">Neural Verified</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default WalletOverlay;
