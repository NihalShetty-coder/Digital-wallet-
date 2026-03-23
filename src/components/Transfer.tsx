import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { Account, Currency } from '../types';
import { DigitalWalletService } from '../services/DigitalWalletService';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft, ChevronDown, Search } from 'lucide-react';
import { AnimatedSendIcon } from './AnimatedIcons';
import { useNavigate, Link } from 'react-router-dom';
import Dropdown, { DropdownOption } from './ui/Dropdown';

export default function Transfer() {
  const navigate = useNavigate();
  const walletService = DigitalWalletService.getInstance();
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const fetchAccounts = async () => {
      const accs = await walletService.getAccounts(auth.currentUser!.uid);
      setAccounts(accs);
      if (accs.length > 0) setSelectedAccountId(accs[0].id);
    };
    fetchAccounts();
  }, []);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  const accountOptions: DropdownOption[] = accounts.map(acc => ({
    id: acc.id,
    label: `${acc.currency} Account (****${acc.accountNumber.slice(-4)})`,
    sublabel: `Balance: ${formatCurrency(acc.balance, acc.currency)}`,
    icon: acc.currency
  }));

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !selectedAccount) return;

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (transferAmount > selectedAccount.balance) {
      setError('Insufficient balance in selected account');
      return;
    }

    if (recipientEmail.toLowerCase().trim() === auth.currentUser.email?.toLowerCase()) {
      setError("You can't send money to yourself");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await walletService.transferFunds(selectedAccountId, recipientEmail, transferAmount, description);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <Link to="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white mb-10 font-bold uppercase text-xs tracking-widest transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 shadow-2xl shadow-brand-blue/5"
      >
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-white/10">
            <AnimatedSendIcon className="text-neutral-900 w-8 h-8" color="#0a0a0a" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Send Money</h1>
            <p className="text-neutral-500 font-medium">Transfer funds between accounts instantly</p>
          </div>
        </div>

        {success ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="text-emerald-500 w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Transfer Successful!</h2>
            <p className="text-neutral-500 font-medium">Your funds are on their way to {recipientEmail}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleTransfer} className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">From Account</label>
              <Dropdown
                options={accountOptions}
                value={selectedAccountId}
                onChange={setSelectedAccountId}
                placeholder="Select an account"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Recipient Email</label>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="email"
                  required
                  className="w-full pl-14 pr-5 py-4.5 bg-white/5 border border-dark-border rounded-2xl text-white focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-neutral-600"
                  placeholder="friend@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Amount</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-bold text-neutral-600">
                  {selectedAccount?.currency === 'INR' ? '₹' : 
                   selectedAccount?.currency === 'EUR' ? '€' :
                   selectedAccount?.currency === 'GBP' ? '£' :
                   selectedAccount?.currency === 'JPY' ? '¥' : '$'}
                </span>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  className="w-full pl-12 pr-5 py-5 bg-white/5 border border-dark-border rounded-2xl text-3xl font-bold text-white focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-neutral-700"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Note (Optional)</label>
              <textarea
                className="w-full p-5 bg-white/5 border border-dark-border rounded-2xl text-white focus:ring-2 focus:ring-brand-blue outline-none transition-all resize-none placeholder:text-neutral-600"
                rows={3}
                placeholder="What's this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 text-red-400 bg-red-500/10 p-5 rounded-2xl border border-red-500/20 font-medium">
                <AlertCircle size={20} />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-neutral-900 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Send {amount ? formatCurrency(parseFloat(amount), selectedAccount?.currency) : 'Money'}
                  <AnimatedSendIcon size={20} color="#0a0a0a" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
