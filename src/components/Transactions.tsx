import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, or } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Transaction, OperationType } from '../types';
import { handleFirestoreError } from '../lib/error-handler';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { 
  Search,
  Filter,
  Download,
  Loader2
} from 'lucide-react';
import { 
  AnimatedArrowUpRight, 
  AnimatedArrowDownLeft 
} from './AnimatedIcons';
import { format } from 'date-fns';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;

    const transactionsRef = collection(db, 'transactions');
    const q = query(
      transactionsRef,
      or(
        where('sourceUid', '==', auth.currentUser.uid),
        where('destinationUid', '==', auth.currentUser.uid)
      ),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(txs);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'transactions'));

    return () => unsubscribe();
  }, []);

  const filteredTransactions = transactions.filter(tx => 
    tx.destinationEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.sourceEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Transaction History</h1>
          <p className="text-neutral-500 font-medium">View and manage all your wallet activities</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-white/5 border border-dark-border px-6 py-3 rounded-2xl font-bold text-white hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by email or description..."
            className="w-full pl-14 pr-5 py-4 bg-white/5 border border-dark-border rounded-2xl focus:ring-2 focus:ring-brand-blue outline-none transition-all text-white placeholder:text-neutral-600 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center gap-2 bg-white/5 border border-dark-border px-8 py-4 rounded-2xl font-bold text-white hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Filter size={18} />
          Filters
        </button>
      </div>

      <div className="glass-card overflow-hidden shadow-2xl shadow-brand-blue/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-dark-border">
                <th className="px-8 py-5 text-xs font-bold text-neutral-500 uppercase tracking-widest">Transaction</th>
                <th className="px-8 py-5 text-xs font-bold text-neutral-500 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-xs font-bold text-neutral-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-neutral-500 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <Loader2 className="w-10 h-10 text-brand-blue animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={tx.id} 
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 border",
                          tx.sourceUid === auth.currentUser?.uid 
                            ? "bg-red-500/10 border-red-500/20" 
                            : "bg-emerald-500/10 border-emerald-500/20"
                        )}>
                          {tx.sourceUid === auth.currentUser?.uid ? (
                            <AnimatedArrowUpRight className="text-red-400 w-6 h-6" color="#f87171" />
                          ) : (
                            <AnimatedArrowDownLeft className="text-emerald-400 w-6 h-6" color="#34d399" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg tracking-tight">
                            {tx.sourceUid === auth.currentUser?.uid ? `To: ${tx.destinationEmail}` : `From: ${tx.sourceEmail}`}
                          </p>
                          <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-0.5">{tx.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-neutral-300 font-bold">
                        {tx.timestamp ? format(tx.timestamp.toDate(), 'MMM d, yyyy') : '...'}
                      </p>
                      <p className="text-xs text-neutral-500 font-medium mt-0.5">
                        {tx.timestamp ? format(tx.timestamp.toDate(), 'h:mm a') : '...'}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase tracking-widest border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Completed
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className={cn(
                        "text-xl font-bold tracking-tight",
                        tx.sourceUid === auth.currentUser?.uid ? "text-red-400" : "text-emerald-400"
                      )}>
                        {tx.sourceUid === auth.currentUser?.uid ? '-' : '+'}{formatCurrency(tx.amount, tx.currency)}
                      </p>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-neutral-500 font-bold uppercase text-xs tracking-widest">
                    No transactions found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
