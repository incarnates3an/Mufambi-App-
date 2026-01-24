import React, { useState } from 'react';
import {
  X, DollarSign, TrendingUp, Building2, CreditCard, Calendar, Award,
  Users, Activity, CheckCircle, Clock, FileText, Download, RefreshCw, PiggyBank, Banknote
} from 'lucide-react';
import { CompanyWallet, RideTransaction, CommissionConfig, PaymentMethod } from '../../types';
import { getCommissionStats, formatCurrency } from '../../services/commission';

interface CompanyDashboardProps {
  wallet: CompanyWallet;
  transactions: RideTransaction[];
  commissionConfig: CommissionConfig;
  onClose: () => void;
  onUpdateBankAccount: (details: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber?: string;
  }) => void;
}

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({
  wallet,
  transactions,
  commissionConfig,
  onClose,
  onUpdateBankAccount
}) => {
  const [showBankSetup, setShowBankSetup] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountName: wallet.bankAccountDetails?.accountName || '',
    accountNumber: wallet.bankAccountDetails?.accountNumber || '',
    bankName: wallet.bankAccountDetails?.bankName || '',
    routingNumber: wallet.bankAccountDetails?.routingNumber || ''
  });

  const stats = getCommissionStats(transactions, wallet);

  const handleSaveBankAccount = () => {
    onUpdateBankAccount(bankDetails);
    setShowBankSetup(false);
  };

  const handleExportTransactions = () => {
    const csvContent = [
      ['Transaction ID', 'Date', 'Driver', 'Passenger', 'Fare', 'Commission Rate', 'Commission', 'Driver Earnings', 'Payment Method', 'Status'],
      ...transactions.map(t => [
        t.id,
        new Date(t.timestamp).toLocaleDateString(),
        t.driverName,
        t.passengerName,
        t.fareAmount.toFixed(2),
        `${t.commissionRate}%`,
        t.commissionAmount.toFixed(2),
        t.driverEarnings.toFixed(2),
        t.paymentMethod,
        t.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mufambi-transactions-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#050505]/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-xl">
            <Building2 className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h2 className="text-white font-black uppercase italic tracking-tighter text-xl">Company Dashboard</h2>
            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Financial Control Center</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide p-6 space-y-6">
        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <DollarSign className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-white/80" />
                <p className="text-[8px] font-black text-white/60 uppercase tracking-widest">Total Revenue</p>
              </div>
              <p className="text-4xl font-black text-white italic tracking-tighter">
                {formatCurrency(wallet.totalRevenue)}
              </p>
              <p className="text-[10px] font-bold text-white/80 mt-2">{wallet.totalTransactions} transactions</p>
            </div>
          </div>

          {/* Completed Commission */}
          <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Completed</p>
            </div>
            <p className="text-3xl font-black text-white italic tracking-tighter">
              {formatCurrency(wallet.completedCommission)}
            </p>
            <p className="text-[10px] font-bold text-gray-500 mt-2">Available for withdrawal</p>
          </div>

          {/* Pending Commission */}
          <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Pending</p>
            </div>
            <p className="text-3xl font-black text-white italic tracking-tighter">
              {formatCurrency(wallet.pendingCommission)}
            </p>
            <p className="text-[10px] font-bold text-gray-500 mt-2">Processing transactions</p>
          </div>
        </div>

        {/* Commission Rates Info */}
        <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black text-white uppercase italic tracking-wider">Commission Structure</h3>
            </div>
            <div className="px-3 py-1 bg-green-500/10 rounded-full">
              <span className="text-[8px] font-black text-green-400 uppercase tracking-wider">Market Leading</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {commissionConfig.commissionRates.map((rate) => (
              <div key={rate.driverRank} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{rate.driverRank}</span>
                  <span className="text-lg font-black text-white italic">{rate.percentage}%</span>
                </div>
                <p className="text-[8px] text-gray-600 font-bold">{rate.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-black text-white uppercase italic tracking-wider">Payment Methods</h3>
          </div>

          <div className="space-y-2">
            {Object.keys(PaymentMethod).map((method) => {
              const methodData = stats.commissionByPaymentMethod[method as PaymentMethod];
              const percentage = stats.totalRides > 0
                ? ((methodData?.count || 0) / stats.totalRides * 100).toFixed(1)
                : '0';

              return (
                <div key={method} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">{method}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-gray-400">{methodData?.count || 0} rides</span>
                    <span className="text-sm font-black text-white">{formatCurrency(methodData?.total || 0)}</span>
                    <span className="text-[9px] font-bold text-indigo-400">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bank Account Setup */}
        <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Banknote className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black text-white uppercase italic tracking-wider">Company Bank Account</h3>
            </div>
            {wallet.bankAccountLinked ? (
              <div className="px-3 py-1 bg-green-500/10 rounded-full flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span className="text-[8px] font-black text-green-400 uppercase tracking-wider">Linked</span>
              </div>
            ) : (
              <div className="px-3 py-1 bg-amber-500/10 rounded-full">
                <span className="text-[8px] font-black text-amber-400 uppercase tracking-wider">Not Configured</span>
              </div>
            )}
          </div>

          {wallet.bankAccountLinked && wallet.bankAccountDetails ? (
            <div className="p-4 bg-white/5 rounded-2xl space-y-2">
              <div className="flex justify-between">
                <span className="text-[9px] font-bold text-gray-500 uppercase">Account Name</span>
                <span className="text-xs font-black text-white">{wallet.bankAccountDetails.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[9px] font-bold text-gray-500 uppercase">Bank</span>
                <span className="text-xs font-black text-white">{wallet.bankAccountDetails.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[9px] font-bold text-gray-500 uppercase">Account Number</span>
                <span className="text-xs font-black text-white font-mono">••••{wallet.bankAccountDetails.accountNumber.slice(-4)}</span>
              </div>
              <button
                onClick={() => setShowBankSetup(true)}
                className="w-full mt-2 py-2 bg-white/5 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-wider hover:bg-white/10 transition-all"
              >
                Update Details
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowBankSetup(true)}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95"
            >
              Configure Bank Account
            </button>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-[#0f0f12] border border-white/5 rounded-[2.5rem] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black text-white uppercase italic tracking-wider">Recent Transactions</h3>
            </div>
            <button
              onClick={handleExportTransactions}
              className="px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-wider hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Download className="w-3 h-3" />
              Export CSV
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto scroll-hide">
            {stats.recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-sm font-black text-gray-600 uppercase">No transactions yet</p>
              </div>
            ) : (
              stats.recentTransactions.map((txn) => (
                <div key={txn.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs font-black text-white">{txn.driverName} → {txn.passengerName}</p>
                      <p className="text-[8px] text-gray-500 font-bold">{new Date(txn.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">{formatCurrency(txn.fareAmount)}</p>
                      <p className="text-[8px] text-green-400 font-bold">+{formatCurrency(txn.commissionAmount)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[8px]">
                    <span className="font-bold text-gray-600 uppercase">{txn.paymentMethod}</span>
                    <span className={`font-bold uppercase ${
                      txn.status === 'completed' ? 'text-green-400' :
                      txn.status === 'pending' ? 'text-amber-400' :
                      txn.status === 'disputed' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>{txn.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bank Setup Modal */}
      {showBankSetup && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0f0f12] border border-white/5 rounded-[3rem] p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6">Bank Account Setup</h3>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-2">Account Name</label>
                <input
                  type="text"
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  placeholder="Mufambi Holdings Ltd"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-gray-700 outline-none focus:border-indigo-500/40"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-2">Bank Name</label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  placeholder="Standard Bank Zimbabwe"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-gray-700 outline-none focus:border-indigo-500/40"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-2">Account Number</label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  placeholder="1234567890"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-gray-700 outline-none focus:border-indigo-500/40"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block mb-2">Routing Number (Optional)</label>
                <input
                  type="text"
                  value={bankDetails.routingNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-gray-700 outline-none focus:border-indigo-500/40"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBankSetup(false)}
                className="flex-1 py-3 bg-white/5 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-wider hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBankAccount}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-500 transition-all active:scale-95"
              >
                Save Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
