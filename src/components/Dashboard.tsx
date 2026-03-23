import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, collection, query, where, orderBy, limit, or } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, Transaction, Account, OperationType } from '../types';
import { handleFirestoreError } from '../lib/error-handler';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  MoreVertical
} from 'lucide-react';
import { 
  AnimatedWalletIcon, 
  AnimatedSendIcon, 
  AnimatedPlusIcon, 
  AnimatedChartIcon, 
  AnimatedCreditCardIcon, 
  AnimatedHistoryIcon,
  AnimatedArrowUpRight,
  AnimatedArrowDownLeft
} from './AnimatedIcons';
import WalletLogo from './WalletLogo';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, 'users', auth.currentUser.uid);
    const unsubscribeProfile = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${auth.currentUser?.uid}`));

    const accountsRef = collection(db, 'accounts');
    const qAccounts = query(accountsRef, where('uid', '==', auth.currentUser.uid));
    const unsubscribeAccounts = onSnapshot(qAccounts, (snapshot) => {
      const accs = snapshot.docs.map(doc => doc.data() as Account);
      setAccounts(accs);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'accounts'));

    const transactionsRef = collection(db, 'transactions');
    const qCombined = query(
      transactionsRef,
      or(
        where('sourceUid', '==', auth.currentUser.uid),
        where('destinationUid', '==', auth.currentUser.uid)
      ),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribeTransactions = onSnapshot(qCombined, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(txs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'transactions'));

    // Fetch all transactions for income/expense calculation
    const qAll = query(
      transactionsRef,
      or(
        where('sourceUid', '==', auth.currentUser.uid),
        where('destinationUid', '==', auth.currentUser.uid)
      )
    );
    const unsubscribeAll = onSnapshot(qAll, (snapshot) => {
      const allTxs = snapshot.docs.map(doc => doc.data() as Transaction);
      const income = allTxs
        .filter(tx => tx.destinationUid === auth.currentUser?.uid)
        .reduce((acc, curr) => acc + curr.amount, 0);
      const expenses = allTxs
        .filter(tx => tx.sourceUid === auth.currentUser?.uid)
        .reduce((acc, curr) => acc + curr.amount, 0);
      
      setStats({ income, expenses });
    });

    return () => {
      unsubscribeProfile();
      unsubscribeAccounts();
      unsubscribeTransactions();
      unsubscribeAll();
    };
  }, []);

  const [stats, setStats] = useState({ income: 0, expenses: 0 });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-neutral-200 rounded-full" />
          <div className="h-4 w-32 bg-neutral-200 rounded" />
        </div>
      </div>
    );
  }

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="space-y-10 max-w-6xl mx-auto px-6 py-10">
      {/* Hero Balance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 relative overflow-hidden bg-dark-card border border-dark-border rounded-[3rem] p-10 text-white shadow-2xl shadow-brand-blue/5 group"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <WalletLogo size={200} color="white" />
          </div>
          
          <div className="relative z-10">
            <p className="text-neutral-400 font-medium mb-3 tracking-wide uppercase text-xs">Total Combined Balance (USD)</p>
            <h2 className="text-6xl font-bold tracking-tighter mb-10 gradient-text">
              {formatCurrency(totalBalance)}
            </h2>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/transfer"
                className="flex-1 min-w-[160px] bg-white text-neutral-900 py-4.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <AnimatedSendIcon size={20} color="#0a0a0a" />
                Transfer
              </Link>
              <Link
                to="/deposit"
                className="flex-1 min-w-[160px] bg-white/5 border border-dark-border text-white py-4.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <AnimatedPlusIcon size={20} color="white" />
                Add Money
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Account Cards List */}
        <div className="space-y-5">
          <h3 className="text-xl font-bold text-white px-2">My Accounts</h3>
          {accounts.map((acc) => (
            <motion.div 
              key={acc.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 flex items-center justify-between hover:border-brand-blue/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center font-bold text-brand-blue border border-dark-border group-hover:border-brand-blue/50 transition-colors">
                  {acc.currency}
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Account {acc.accountNumber.slice(-4)}</p>
                  <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(acc.balance, acc.currency)}</p>
                </div>
              </div>
              <button className="p-2 text-neutral-500 hover:text-white transition-colors">
                <MoreVertical size={20} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 group hover:border-emerald-500/30 transition-all">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:border-emerald-500/50 transition-colors">
            <AnimatedChartIcon size={32} color="#10b981" accentColor="#34d399" />
          </div>
          <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest">Income</p>
          <p className="text-3xl font-bold text-emerald-500 mt-2 tracking-tight">{formatCurrency(stats.income)}</p>
        </div>
        <div className="glass-card p-8 group hover:border-red-500/30 transition-all">
          <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20 group-hover:border-red-500/50 transition-colors">
            <AnimatedCreditCardIcon size={32} color="#ef4444" />
          </div>
          <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest">Expenses</p>
          <p className="text-3xl font-bold text-red-500 mt-2 tracking-tight">{formatCurrency(stats.expenses)}</p>
        </div>
        <div className="glass-card p-8 group hover:border-brand-purple/30 transition-all">
          <div className="w-12 h-12 bg-brand-purple/10 rounded-2xl flex items-center justify-center mb-6 border border-brand-purple/20 group-hover:border-brand-purple/50 transition-colors">
            <AnimatedHistoryIcon size={32} color="#8b5cf6" />
          </div>
          <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest">Transactions</p>
          <p className="text-3xl font-bold text-white mt-2 tracking-tight">{transactions.length} total</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card overflow-hidden">
        <div className="p-8 border-b border-dark-border flex items-center justify-between bg-white/2">
          <h3 className="text-2xl font-bold text-white tracking-tight">Recent Transactions</h3>
          <Link to="/transactions" className="text-brand-blue font-bold hover:text-brand-purple transition-colors flex items-center gap-2">
            See All
            <ArrowUpRight size={18} />
          </Link>
        </div>
        
        <div className="divide-y divide-dark-border">
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <div key={tx.id} className="p-8 flex items-center justify-between hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110",
                    tx.sourceEmail === auth.currentUser?.email 
                      ? "bg-red-500/10 border-red-500/20 text-red-500" 
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  )}>
                    {tx.sourceEmail === auth.currentUser?.email ? (
                      <AnimatedArrowUpRight size={24} color="#f87171" />
                    ) : (
                      <AnimatedArrowDownLeft size={24} color="#34d399" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg tracking-tight">
                      {tx.sourceEmail === auth.currentUser?.email ? `Sent to ${tx.destinationEmail}` : `Received from ${tx.sourceEmail}`}
                    </p>
                    <p className="text-sm text-neutral-500 font-medium">
                      {tx.timestamp ? format(tx.timestamp.toDate(), 'MMM d, h:mm a') : 'Pending...'}
                    </p>
                  </div>
                </div>
                <p className={cn(
                  "text-xl font-bold tracking-tight",
                  tx.sourceEmail === auth.currentUser?.email ? "text-red-500" : "text-emerald-500"
                )}>
                  {tx.sourceEmail === auth.currentUser?.email ? '-' : '+'}{formatCurrency(tx.amount, tx.currency)}
                </p>
              </div>
            ))
          ) : (
            <div className="p-20 text-center text-neutral-500 font-medium">
              No recent transactions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
