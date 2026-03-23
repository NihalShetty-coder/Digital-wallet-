import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { Account, Currency } from '../types';
import { DigitalWalletService } from '../services/DigitalWalletService';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { AnimatedPlusIcon, AnimatedWalletIcon } from './AnimatedIcons';
import { Link } from 'react-router-dom';

export default function AccountManagement() {
  const walletService = DigitalWalletService.getInstance();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(Currency.USD);

  const fetchAccounts = async () => {
    if (!auth.currentUser) return;
    const accs = await walletService.getAccounts(auth.currentUser.uid);
    setAccounts(accs);
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateAccount = async () => {
    if (!auth.currentUser) return;
    setCreating(true);
    try {
      await walletService.createAccount(auth.currentUser.uid, selectedCurrency);
      await fetchAccounts();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
      <Link to="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white mb-4 font-bold uppercase text-xs tracking-widest transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Manage Accounts</h1>
          <p className="text-neutral-500 font-medium">Create and manage your multi-currency accounts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Create New Account Card */}
        <div className="glass-card p-10 space-y-8 shadow-2xl shadow-brand-blue/5">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-white/10">
            <AnimatedPlusIcon className="text-neutral-900 w-8 h-8" color="#0a0a0a" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Open New Account</h2>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Select Currency</label>
              <div className="grid grid-cols-2 gap-4">
                {Object.values(Currency).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setSelectedCurrency(curr)}
                    className={cn(
                      "py-4 px-5 rounded-2xl font-bold border transition-all hover:scale-[1.02] active:scale-[0.98]",
                      selectedCurrency === curr 
                        ? "bg-white text-neutral-900 border-white shadow-lg shadow-white/10" 
                        : "bg-white/5 text-neutral-500 border-dark-border hover:border-neutral-700"
                    )}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateAccount}
              disabled={creating || accounts.some(a => a.currency === selectedCurrency)}
              className="w-full bg-brand-blue text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-blue/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-brand-blue/20"
            >
              {creating ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : accounts.some(a => a.currency === selectedCurrency) ? (
                "Account Already Exists"
              ) : (
                <>
                  Create {selectedCurrency} Account
                  <AnimatedPlusIcon size={20} color="white" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Existing Accounts List */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-2">Your Active Accounts</h3>
          {loading ? (
            <div className="space-y-6">
              {[1, 2].map(i => <div key={i} className="h-28 bg-white/5 rounded-[2rem] animate-pulse border border-dark-border" />)}
            </div>
          ) : (
            accounts.map((acc) => (
              <motion.div 
                key={acc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 flex items-center justify-between group hover:border-brand-blue/30 transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center font-bold text-white text-xl border border-dark-border group-hover:bg-brand-blue/10 group-hover:border-brand-blue/20 transition-all">
                    {acc.currency}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Account ****{acc.accountNumber.slice(-4)}</p>
                    <p className="text-3xl font-bold text-white tracking-tight">{formatCurrency(acc.balance, acc.currency)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase tracking-widest border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Active
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
