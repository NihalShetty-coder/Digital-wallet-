import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Bell,
  User,
  Building2
} from 'lucide-react';
import { 
  AnimatedDashboardIcon, 
  AnimatedTransferIcon, 
  AnimatedPlusIcon, 
  AnimatedHistoryIcon, 
  AnimatedWalletIcon, 
  AnimatedCreditCardIcon 
} from './AnimatedIcons';
import WalletLogo from './WalletLogo';
import { cn } from '../lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: AnimatedDashboardIcon, label: 'Dashboard', path: '/' },
    { icon: AnimatedTransferIcon, label: 'Transfer', path: '/transfer' },
    { icon: AnimatedPlusIcon, label: 'Deposit', path: '/deposit' },
    { icon: AnimatedHistoryIcon, label: 'History', path: '/transactions' },
    { icon: AnimatedWalletIcon, label: 'Accounts', path: '/accounts' },
    { icon: AnimatedCreditCardIcon, label: 'Payments', path: '/payment-methods' },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 bg-dark-card/50 backdrop-blur-2xl border-r border-dark-border flex-col p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-white/10">
            <WalletLogo className="text-neutral-900 w-7 h-7" color="#0a0a0a" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Wallet</span>
        </div>

        <nav className="flex-1 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold transition-all group",
                location.pathname === item.path 
                  ? "bg-white/10 text-white shadow-inner shadow-white/5" 
                  : "text-neutral-500 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={22} className={cn(
                "transition-colors",
                location.pathname === item.path ? "text-brand-blue" : "group-hover:text-brand-blue"
              )} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-dark-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold text-neutral-500 hover:bg-red-500/10 hover:text-red-500 transition-all w-full"
          >
            <LogOut size={22} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-dark-bg/80 backdrop-blur-md border-b border-dark-border sticky top-0 z-50 px-8 py-5 flex items-center justify-between">
          <div className="md:hidden flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
               <WalletLogo className="text-neutral-900 w-6 h-6" color="#0a0a0a" />
             </div>
             <span className="text-xl font-bold text-white">Wallet</span>
          </div>
          <div className="hidden md:block">
            <h2 className="text-xl font-bold text-white">
              {navItems.find(i => i.path === location.pathname)?.label || 'Wallet'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 pl-6 border-l border-dark-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{auth.currentUser?.displayName || 'User'}</p>
                <p className="text-xs text-neutral-500">{auth.currentUser?.email}</p>
              </div>
              <div className="w-11 h-11 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden border border-dark-border shadow-sm">
                <User className="text-neutral-400 w-6 h-6" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-dark-bg">
          {children}
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden bg-dark-card/90 backdrop-blur-xl border-t border-dark-border px-8 py-4 flex items-center justify-between sticky bottom-0 z-50">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all",
                location.pathname === item.path ? "text-brand-blue" : "text-neutral-500"
              )}
            >
              <item.icon size={24} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          ))}
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center gap-1.5 text-neutral-500"
          >
            <LogOut size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Exit</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
