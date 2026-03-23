import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Account, PaymentMethod, Currency } from '../types';
import { DigitalWalletService } from '../services/DigitalWalletService';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, ChevronDown, AlertCircle, CheckCircle2, CreditCard, Building2 } from 'lucide-react';
import { AnimatedPlusIcon, AnimatedCreditCardIcon } from './AnimatedIcons';
import { Link, useNavigate } from 'react-router-dom';
import Dropdown, { DropdownOption } from './ui/Dropdown';

export default function Deposit() {
  const navigate = useNavigate();
  const walletService = DigitalWalletService.getInstance();
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const accountOptions: DropdownOption[] = accounts.map(acc => ({
    id: acc.id,
    label: `${acc.currency} Account (****${acc.accountNumber.slice(-4)})`,
    sublabel: `Balance: ${formatCurrency(acc.balance, acc.currency)}`,
    icon: acc.currency
  }));

  const paymentMethodOptions: DropdownOption[] = paymentMethods.map(method => ({
    id: method.id,
    label: method.type === 'CreditCard' ? 'Credit Card' : 'Bank Account',
    sublabel: method.type === 'CreditCard' ? `**** ${method.details.cardNumber?.slice(-4)}` : `****${method.details.accountNumber?.slice(-4)}`,
    icon: method.type === 'CreditCard' ? <CreditCard size={18} /> : <Building2 size={18} />
  }));

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const fetchData = async () => {
      const [accs, methodsSnapshot] = await Promise.all([
        walletService.getAccounts(auth.currentUser!.uid),
        getDocs(query(collection(db, 'paymentMethods'), where('uid', '==', auth.currentUser!.uid)))
      ]);
      
      const methods = methodsSnapshot.docs.map(doc => doc.data() as PaymentMethod);
      
      setAccounts(accs);
      setPaymentMethods(methods);
      
      if (accs.length > 0) setSelectedAccountId(accs[0].id);
      if (methods.length > 0) setSelectedPaymentMethodId(methods[0].id);
      
      setLoading(false);
    };
    
    fetchData();
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !selectedAccountId || !selectedPaymentMethodId) return;

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      await walletService.deposit(selectedAccountId, selectedPaymentMethodId, depositAmount);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

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
            <AnimatedPlusIcon className="text-neutral-900 w-8 h-8" color="#0a0a0a" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Add Money</h1>
            <p className="text-neutral-500 font-medium">Top up your wallet instantly</p>
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
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Deposit Successful!</h2>
            <p className="text-neutral-500 font-medium">Your funds have been added to your account.</p>
          </motion.div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-16 space-y-8">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-dark-border">
              <AnimatedCreditCardIcon className="text-neutral-500 w-12 h-12" color="#737373" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">No Payment Methods</h3>
              <p className="text-neutral-500 mb-8 font-medium">You need to add a payment method before you can deposit funds.</p>
              <Link 
                to="/payment-methods"
                className="inline-flex items-center gap-2 bg-white text-neutral-900 px-10 py-4.5 rounded-2xl font-bold hover:bg-neutral-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Add Payment Method
                <AnimatedPlusIcon size={20} color="#0a0a0a" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleDeposit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">To Account</label>
              <Dropdown
                options={accountOptions}
                value={selectedAccountId}
                onChange={setSelectedAccountId}
                placeholder="Select an account"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">From Payment Method</label>
              <Dropdown
                options={paymentMethodOptions}
                value={selectedPaymentMethodId}
                onChange={setSelectedPaymentMethodId}
                placeholder="Select a payment method"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Amount</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-bold text-neutral-600">
                  {accounts.find(a => a.id === selectedAccountId)?.currency === 'INR' ? '₹' : 
                   accounts.find(a => a.id === selectedAccountId)?.currency === 'EUR' ? '€' :
                   accounts.find(a => a.id === selectedAccountId)?.currency === 'GBP' ? '£' :
                   accounts.find(a => a.id === selectedAccountId)?.currency === 'JPY' ? '¥' : '$'}
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

            {error && (
              <div className="flex items-center gap-3 text-red-400 bg-red-500/10 p-5 rounded-2xl border border-red-500/20 font-medium">
                <AlertCircle size={20} />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-white text-neutral-900 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {processing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Deposit {amount ? formatCurrency(parseFloat(amount), accounts.find(a => a.id === selectedAccountId)?.currency) : 'Funds'}
                  <AnimatedPlusIcon size={20} color="#0a0a0a" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
