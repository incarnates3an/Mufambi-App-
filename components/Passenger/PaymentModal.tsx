
import React, { useState } from 'react';
import { X, CreditCard, DollarSign, Smartphone, CheckCircle2, Loader2, ArrowRight, ExternalLink, Shield, Coins, Building2, UserCheck, Wallet, TrendingUp, Award } from 'lucide-react';
import { PaymentMethod, DriverRank, RideTransaction } from '../../types';
import { calculateCommission, formatCurrency } from '../../services/commission';

interface PaymentModalProps {
  amount: number;
  creditsUsed: number;
  driverRank: DriverRank;
  paymentMethod: PaymentMethod;
  onComplete: (transaction: Omit<RideTransaction, 'id' | 'rideId' | 'driverId' | 'driverName' | 'passengerId' | 'passengerName' | 'timestamp'>) => void;
  onCancel: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ amount, creditsUsed, driverRank, paymentMethod: initialPaymentMethod, onComplete, onCancel }) => {
  const [step, setStep] = useState<'SELECT' | 'PROCESS' | 'SUCCESS'>('SELECT');
  const [method, setMethod] = useState<PaymentMethod>(initialPaymentMethod);

  // Calculate commission breakdown
  const fareAmount = amount;
  const { commissionRate, commissionAmount, driverEarnings } = calculateCommission(fareAmount, driverRank);

  const handlePayment = () => {
    setStep('PROCESS');
    setTimeout(() => {
      setStep('SUCCESS');
    }, 3000);
  };

  const handleComplete = () => {
    // Create transaction data to pass back
    const transactionData = {
      fareAmount,
      commissionRate,
      commissionAmount,
      driverEarnings,
      paymentMethod: method,
      status: 'completed' as const,
      processingFee: 0
    };
    onComplete(transactionData);
  };

  const creditUSD = creditsUsed / 100;

  const paymentOptions = [
    { 
      id: PaymentMethod.CARD, 
      name: 'Cloud Card', 
      icon: CreditCard, 
      subtitle: 'Visa / Master / Amex', 
      activeColor: 'bg-indigo-600',
      textColor: 'text-indigo-400' 
    },
    { 
      id: PaymentMethod.PAYPAL, 
      name: 'PayPal Node', 
      icon: Wallet, 
      subtitle: 'International Wallet', 
      activeColor: 'bg-blue-600',
      textColor: 'text-blue-400' 
    },
    { 
      id: PaymentMethod.ECOCASH, 
      name: 'EcoCash Node', 
      icon: Smartphone, 
      subtitle: 'Instant Mobile Link', 
      activeColor: 'bg-sky-500',
      textColor: 'text-sky-400' 
    },
    { 
      id: PaymentMethod.CASH, 
      name: 'Physical Asset', 
      icon: DollarSign, 
      subtitle: 'Handover to Driver', 
      activeColor: 'bg-green-600',
      textColor: 'text-green-400' 
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-[#0f0f12] rounded-[3rem] shadow-[0_0_60px_rgba(0,0,0,1)] overflow-hidden border border-white/10 animate-in zoom-in-95 duration-400">
        
        {/* Header */}
        <div className="p-10 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_50%_50%,#fff,transparent)] pointer-events-none"></div>
          <h3 className="font-black text-2xl italic tracking-tighter uppercase mb-2 relative z-10">Secure Settlement</h3>
          <div className="flex flex-col gap-1 relative z-10">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Balance Remaining</p>
             <p className="text-5xl font-black italic tracking-tighter">${amount.toFixed(2)}</p>
             {creditsUsed > 0 && (
               <div className="mt-4 inline-flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full mx-auto border border-white/10">
                 <Coins className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                 <span className="text-[10px] font-black uppercase tracking-widest">-{creditUSD.toFixed(2)} Credits Injected</span>
               </div>
             )}
          </div>
        </div>

        <div className="p-8 min-h-[350px] flex flex-col">
          {step === 'SELECT' && (
            <div className="space-y-6">
              <div className="space-y-3">
                {paymentOptions.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all group ${
                      method === m.id 
                        ? `border-white/20 ${m.activeColor} shadow-[0_0_20px_rgba(255,255,255,0.1)]` 
                        : 'border-white/5 bg-[#1a1a1f] hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl transition-colors ${method === m.id ? 'bg-white/20 text-white' : `bg-gray-800 ${m.textColor}`}`}>
                        <m.icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className={`block font-black text-[11px] uppercase tracking-widest ${method === m.id ? 'text-white' : 'text-gray-500'}`}>{m.name}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-tighter ${method === m.id ? 'text-white/60' : 'text-gray-600'}`}>{m.subtitle}</span>
                      </div>
                    </div>
                    {method === m.id && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </button>
                ))}
              </div>

              <button 
                onClick={handlePayment}
                className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black uppercase tracking-[0.25em] shadow-xl shadow-white/5 transition-all active:scale-95 flex items-center justify-center gap-3 hover:bg-gray-100"
              >
                EXECUTE PAYMENT <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 'PROCESS' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-10">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-8 border-indigo-600/10 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 w-8 h-8" />
              </div>
              <div>
                <h4 className="text-white font-black uppercase tracking-[0.3em] text-sm italic">Broadcasting Transaction</h4>
                <p className="text-[9px] text-gray-500 font-black mt-2 uppercase tracking-widest italic animate-pulse">Syncing with Elite Driver Node...</p>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="flex-1 flex flex-col space-y-8 animate-in zoom-in-95">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-500/20 rounded-[2rem] flex items-center justify-center mx-auto text-green-500 shadow-[0_0_40px_rgba(34,197,94,0.2)] border border-green-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-white font-black uppercase tracking-[0.2em] text-xl italic">Sychronized</h4>
                  <p className="text-[10px] text-gray-500 font-black uppercase mt-1 tracking-widest">Transaction Verified & Distributed</p>
                </div>
              </div>

              {/* Commission & Payment Breakdown */}
              <div className="bg-white/5 border border-white/5 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Payment Breakdown</p>
                  <div className="px-2 py-1 bg-green-500/10 rounded-full">
                    <span className="text-[7px] font-black text-green-400 uppercase tracking-wider">Completed</span>
                  </div>
                </div>

                {/* Total Fare */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Fare</span>
                  <span className="text-sm font-black text-white">{formatCurrency(fareAmount)}</span>
                </div>

                {/* Commission */}
                <div className="flex items-center justify-between py-1 bg-indigo-500/5 -mx-2 px-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-indigo-500/10 rounded"><Building2 className="w-3 h-3 text-indigo-400" /></div>
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">Mufambi Commission ({commissionRate}%)</span>
                  </div>
                  <span className="text-xs font-black text-indigo-400">-{formatCurrency(commissionAmount)}</span>
                </div>

                {/* Driver Earnings */}
                <div className="flex items-center justify-between py-1 bg-green-500/5 -mx-2 px-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-green-500/10 rounded"><UserCheck className="w-3 h-3 text-green-500" /></div>
                    <span className="text-[10px] font-black text-green-300 uppercase tracking-wider">Driver Receives</span>
                  </div>
                  <span className="text-sm font-black text-green-400">{formatCurrency(driverEarnings)}</span>
                </div>

                {/* Commission Notice */}
                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-start gap-2">
                    <Award className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[8px] text-gray-500 font-bold leading-relaxed">
                      {driverRank} drivers enjoy {commissionRate}% commission rate -
                      {commissionRate <= 10 ? ' beats all major competitors!' : ' competitive market rate'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black uppercase tracking-[0.1em] shadow-2xl transition-all active:scale-95 hover:bg-gray-100"
              >
                Close Session
              </button>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-white/5 text-center flex items-center justify-center gap-3 bg-[#050505]">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] italic">Precision Encrypted Ledger Sync</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
