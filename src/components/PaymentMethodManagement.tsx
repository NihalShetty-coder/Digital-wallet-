import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { PaymentMethod, OperationType } from '../types';
import { DigitalWalletService } from '../services/DigitalWalletService';
import { handleFirestoreError } from '../lib/error-handler';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  Lock
} from 'lucide-react';
import { AnimatedPlusIcon, AnimatedCreditCardIcon, AnimatedChartIcon } from './AnimatedIcons';
import { Link } from 'react-router-dom';

export default function PaymentMethodManagement() {
  const walletService = DigitalWalletService.getInstance();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<'CreditCard' | 'BankAccount'>('CreditCard');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expirationDate: '',
    cvv: '',
    accountNumber: '',
    routingNumber: ''
  });

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'paymentMethods'), where('uid', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ms = snapshot.docs.map(doc => doc.data() as PaymentMethod);
      setMethods(ms);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'paymentMethods'));
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setAdding(true);
    try {
      await walletService.addPaymentMethod(auth.currentUser.uid, type, formData);
      setFormData({
        cardNumber: '',
        expirationDate: '',
        cvv: '',
        accountNumber: '',
        routingNumber: ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'paymentMethods', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `paymentMethods/${id}`);
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
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Payment Methods</h1>
          <p className="text-neutral-500 font-medium">Securely manage your cards and bank accounts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Add New Method Form */}
        <div className="glass-card p-10 space-y-8 shadow-2xl shadow-brand-blue/5">
          <div className="flex gap-4 p-1.5 bg-white/5 rounded-2xl border border-dark-border">
            <button
              onClick={() => setType('CreditCard')}
              className={cn(
                "flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                type === 'CreditCard' ? "bg-white text-neutral-900 shadow-lg shadow-white/10" : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <AnimatedCreditCardIcon size={18} color={type === 'CreditCard' ? "#0a0a0a" : "#737373"} />
              Card
            </button>
            <button
              onClick={() => setType('BankAccount')}
              className={cn(
                "flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                type === 'BankAccount' ? "bg-white text-neutral-900 shadow-lg shadow-white/10" : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <AnimatedChartIcon size={18} color={type === 'BankAccount' ? "#0a0a0a" : "#737373"} />
              Bank
            </button>
          </div>

          <form onSubmit={handleAdd} className="space-y-6">
            <AnimatePresence mode="wait">
              {type === 'CreditCard' ? (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="0000 0000 0000 0000"
                      className="w-full p-5 bg-white/5 border border-dark-border rounded-2xl font-bold text-white focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-neutral-700"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        className="w-full p-5 bg-white/5 border border-dark-border rounded-2xl font-bold text-white focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-neutral-700"
                        value={formData.expirationDate}
                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">CVV</label>
                      <input
                        type="text"
                        required
                        placeholder="123"
                        className="w-full p-5 bg-white/5 border border-dark-border rounded-2xl font-bold text-white focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-neutral-700"
                        value={formData.cvv}
                        onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="bank"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Account Number</label>
                    <input
                      type="text"
                      required
                      placeholder="Account Number"
                      className="w-full p-5 bg-white/5 border border-dark-border rounded-2xl font-bold text-white focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-neutral-700"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1">Routing Number</label>
                    <input
                      type="text"
                      required
                      placeholder="Routing Number"
                      className="w-full p-5 bg-white/5 border border-dark-border rounded-2xl font-bold text-white focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder:text-neutral-700"
                      value={formData.routingNumber}
                      onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3 text-neutral-500 text-[10px] font-bold uppercase tracking-widest py-2">
              <Lock size={14} className="text-brand-blue" />
              Your payment information is encrypted and secure.
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full bg-white text-neutral-900 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-white/5"
            >
              {adding ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Add {type === 'CreditCard' ? 'Card' : 'Bank Account'}
                  <AnimatedPlusIcon size={20} color="#0a0a0a" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Saved Methods List */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-2">Saved Methods</h3>
          {loading ? (
            <div className="space-y-6">
              {[1, 2].map(i => <div key={i} className="h-28 bg-white/5 rounded-[2rem] animate-pulse border border-dark-border" />)}
            </div>
          ) : methods.length > 0 ? (
            methods.map((method) => (
              <motion.div 
                key={method.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 flex items-center justify-between group hover:border-brand-blue/30 transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-dark-border group-hover:bg-brand-blue/10 group-hover:border-brand-blue/20 transition-all">
                    {method.type === 'CreditCard' ? (
                      <AnimatedCreditCardIcon className="text-white w-8 h-8" color="white" />
                    ) : (
                      <AnimatedChartIcon className="text-white w-8 h-8" color="white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">
                      {method.type === 'CreditCard' ? 'Credit Card' : 'Bank Account'}
                    </p>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                      {method.type === 'CreditCard' 
                        ? `**** **** **** ${method.details.cardNumber?.slice(-4)}` 
                        : `****${method.details.accountNumber?.slice(-4)}`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(method.id)}
                  className="p-4 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))
          ) : (
            <div className="p-16 text-center text-neutral-500 font-bold uppercase text-xs tracking-[0.2em] border-2 border-dashed border-dark-border rounded-[2.5rem] bg-white/[0.02]">
              No payment methods saved yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
