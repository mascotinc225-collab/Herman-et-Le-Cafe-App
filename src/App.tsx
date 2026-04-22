import React, { useState, useEffect } from 'react';
import { 
  Coffee, 
  LayoutDashboard, 
  Users, 
  Settings, 
  QrCode, 
  TrendingUp, 
  Star, 
  Gift, 
  Clock, 
  CreditCard,
  ChevronRight,
  Plus,
  Zap,
  Award,
  Crown,
  Trophy,
  Sparkles,
  Smartphone,
  Scan,
  X,
  CheckCircle2,
  Flame,
  Heart,
  Target,
  Wifi,
  WifiOff,
  Bell,
  Info,
  BrainCircuit,
  Share2,
  PieChart as PieChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, PieChart, Cell
} from 'recharts';
import QrReader from 'react-qr-reader-es6';
import { io } from "socket.io-client";

import { MembershipCard } from './components/MembershipCard';
import { RewardsProgress } from './components/RewardsProgress';
import { Menu } from './components/Menu';
import { OrderHistory } from './components/OrderHistory';
import { Customer, Transaction, DashboardStats, Offer, Tier } from './types';
import { formatCurrency, cn } from './lib/utils';
import { getSalesPredictions, getPersonalizedOffers } from './services/geminiService';
import { translations, Language } from './localization';

interface BentoTileProps {
  label?: string;
  children?: React.ReactNode;
  className?: string;
  sub?: string;
  value?: string | number;
}

function BentoTile({ label, children, className, sub, value }: BentoTileProps) {
  return (
    <div className={cn("bg-surface border border-[#222] rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col justify-between relative overflow-hidden", className)}>
      <div>
        {label && <p className="text-[9px] md:text-[11px] text-text-secondary uppercase tracking-[1px] md:tracking-[2px] font-bold mb-1.5 md:mb-3 relative z-10">{label}</p>}
        {value && <div className="text-xl md:text-3xl font-light tracking-tight relative z-10">{value}</div>}
        {sub && <p className="text-[10px] md:text-xs text-emerald-400 mt-1 relative z-10 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {sub}
        </p>}
      </div>
      <div className={cn(label || value ? "mt-3 md:mt-4" : "", "relative z-10")}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<'customer' | 'admin' | 'menu' | 'history'>('customer');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [peronalizedOffers, setPersonalizedOffers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [isWalletFlipped, setIsWalletFlipped] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<Tier | 'All'>('All');
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newCustomerForm, setNewCustomerForm] = useState({ 
    name: '', 
    phone: '', 
    email: '',
    joinDate: new Date().toISOString().split('T')[0],
    lastVisit: new Date().toISOString().split('T')[0]
  });

  const [menuUploadForm, setMenuUploadForm] = useState({
    name: '',
    price: '',
    description: '',
    image: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleMenuUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuUploadForm.image || !menuUploadForm.name || !menuUploadForm.price) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', menuUploadForm.image);

      const uploadRes = await fetch('/api/menu/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();

      if (uploadData.url) {
        // In a real app, you'd save this to the DB. For now, we'll just log and maybe show it?
        // Actually, let's just show a success notification
        const newNotif = {
           id: Date.now().toString(),
           title: "Menu Item Ready",
           message: `${menuUploadForm.name} with custom image has been prepared for the menu.`,
           time: "Just now",
           type: "System",
           read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
        setMenuUploadForm({ name: '', price: '', description: '', image: null });
        alert("Image uploaded successfully! Path: " + uploadData.url);
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check server logs.");
    } finally {
      setIsUploading(false);
    }
  };

  const tierThemes = {
    Bronze: {
      accent: 'text-gold',
      ring: 'ring-gold/20',
      bg: 'from-espresso/20 to-matte-black',
      pattern: 'opacity-5',
      icon: Coffee
    },
    Silver: {
      accent: 'text-slate-300',
      ring: 'ring-slate-300/20',
      bg: 'from-slate-800/20 to-matte-black',
      pattern: 'opacity-10',
      icon: Award
    },
    Gold: {
      accent: 'text-gold',
      ring: 'ring-gold/40',
      bg: 'from-[#1a1308] to-[#0A0A0A]',
      pattern: 'opacity-20 animate-pulse',
      icon: Crown
    }
  };

  useEffect(() => {
    fetchData();
    
    // Socket.io for Real-time Updates
    const socket = io(window.location.origin);
    
    socket.on("connect", () => setIsLiveConnected(true));
    socket.on("disconnect", () => setIsLiveConnected(false));
    
    socket.on("data_update", (data) => {
      setActivities(data.activities);
      setStats(data.stats);
      setEmails(data.emails);
      setCustomers(data.customers);
      if (data.notifications) setNotifications(data.notifications);
      
      // If the currently active customer was updated, sync it
      if (activeCustomer) {
        const updatedActive = data.customers.find((c: any) => c.id === activeCustomer.id);
        if (updatedActive) setActiveCustomer(updatedActive);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  async function fetchLiveUpdates() {
    // Keep as fallback or just use Socket
    try {
      const [actRes, statsRes, mailRes] = await Promise.all([
        fetch('/api/activities'),
        fetch('/api/stats'),
        fetch('/api/emails')
      ]);
      const actData = await actRes.json();
      const statsData = await statsRes.json();
      const mailData = await mailRes.json();
      setActivities(actData);
      setStats(statsData);
      setEmails(mailData);
    } catch (err) {}
  }

  useEffect(() => {
    if (activeCustomer) {
      fetchPersonalizedOffers(activeCustomer);
    }
  }, [activeCustomer?.id]);

  useEffect(() => {
    if (activeCustomer && view === 'history') {
      fetchHistory(activeCustomer.id);
    }
  }, [activeCustomer?.id, view]);

  async function fetchHistory(customerId: string) {
    try {
      const res = await fetch(`/api/customers/${customerId}/transactions`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchPersonalizedOffers(customer: Customer) {
    const offers = await getPersonalizedOffers(customer);
    setPersonalizedOffers(offers);
  }

  async function fetchData() {
    setIsLoading(true);
    try {
      const [custRes, statsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/stats')
      ]);
      
      if (!custRes.ok || !statsRes.ok) throw new Error('Server unreachable');
      
      const custData = await custRes.json();
      const statsData = await statsRes.json();
      
      setCustomers(custData);
      setStats(statsData);
      setActiveCustomer(custData[0]); 
    } catch (err) {
      console.warn("Using local fallback data (Netlify/Static Mode)");
      // Fallback for Netlify/Static hosting
      const mockCustomers: Customer[] = [
        {
          id: "HC001",
          name: "Monty Carlo",
          phone: "+225 07070707",
          points: 120,
          stamps: 6,
          tier: "Bronze",
          joinDate: "2024-01-15",
          lastVisit: new Date().toISOString(),
          referralCode: "MONTY-BREW",
          referralCount: 0,
          segment: "Active"
        },
        {
          id: "HC002",
          name: "Linda Espresso",
          phone: "+225 01010101",
          points: 450,
          stamps: 8,
          tier: "Silver",
          joinDate: "2023-11-20",
          lastVisit: new Date().toISOString(),
          referralCode: "LINDA-BREW",
          referralCount: 2,
          segment: "Champion"
        }
      ];

      const mockStats: DashboardStats = {
        revenueOverTime: [
          { date: "Mon", amount: 45000 },
          { date: "Tue", amount: 52000 },
          { date: "Wed", amount: 48000 },
          { date: "Thu", amount: 61000 },
          { date: "Fri", amount: 75000 }
        ],
        customerGrowth: [
          { date: "Week 1", new: 45, returning: 120 },
          { date: "Week 2", new: 52, returning: 145 }
        ],
        topCustomers: mockCustomers.map(c => ({ name: c.name, spend: c.points * 100 })),
        popularDrinks: [
          { name: "Espresso", count: 145 },
          { name: "Latte", count: 230 }
        ],
        rewardsIssued: [
          { date: "Mon", count: 2 },
          { id: "Tue", count: 5 } as any
        ],
        segmentData: [
          { name: "Active", value: 45 },
          { name: "Champion", value: 12 }
        ]
      };

      const mockActivities = [
        { id: 1, type: 'join', customer: 'Monty Carlo', time: 'Just now', detail: 'Joined Signature Club' }
      ];

      setCustomers(mockCustomers);
      setActiveCustomer(mockCustomers[0]);
      setStats(mockStats);
      setActivities(mockActivities);
    } finally {
      setIsLoading(false);
      try {
        const insights = await getSalesPredictions([]);
        setAiInsight(insights);
      } catch (e) {}
    }
  }

  async function handleAddVisit(customerId: string, drink?: { name: string; price: number }) {
    // Optimistic Update for "Friendly" static mode
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const updated = { ...c, points: c.points + Math.floor((drink?.price || 2500) / 100), stamps: (c.stamps + 1) % 10 };
        if (activeCustomer?.id === customerId) setActiveCustomer(updated);
        return updated;
      }
      return c;
    }));

    try {
      const res = await fetch(`/api/customers/${customerId}/visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drinkType: drink?.name || 'Signature Ivorian Latte',
          price: drink?.price || 2500,
          staff: 'Herman'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveCustomer(data.customer);
        setCustomers(prev => prev.map(c => c.id === data.customer.id ? data.customer : c));
      }
    } catch (err) {
      console.warn("Backend unavailable, using local optimistic state.");
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!newCustomerForm.name || newCustomerForm.name.length < 3) errors.name = 'Name must be at least 3 characters';
    if (!newCustomerForm.phone.match(/^\+?[0-9\s-]{8,20}$/)) errors.phone = 'Invalid phone format';
    if (newCustomerForm.email && !newCustomerForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Invalid email format';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Optimistic Update for Static Mode
    const tempId = `HC-TEMP-${Date.now()}`;
    const newCustomer: Customer = {
      ...newCustomerForm,
      id: tempId,
      points: 0,
      stamps: 0,
      tier: 'Bronze',
      referralCode: `REF-${tempId.slice(-4)}`,
      referralCount: 0
    };
    
    setCustomers(prev => [...prev, newCustomer]);
    setShowAddCustomer(false);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomerForm)
      });
      if (res.ok) {
        const data = await res.json();
        // Replace temp customer with real data from server
        setCustomers(prev => prev.map(c => c.id === tempId ? data : c));
        if (activeCustomer?.id === tempId) setActiveCustomer(data);
      }
    } catch (err) {
      console.warn("Backend unavailable, keeping local registration.");
    } finally {
      setNewCustomerForm({ 
        name: '', 
        phone: '', 
        email: '',
        joinDate: new Date().toISOString().split('T')[0],
        lastVisit: new Date().toISOString().split('T')[0]
      });
    }
  }

  function handleScan(data: string | null) {
    if (data) {
      const customer = customers.find(c => c.id === data || c.phone === data);
      if (customer) {
        setScanStatus('success');
        setScanResult(data);
        // Haptic feedback simulation via visual pulse
        const main = document.querySelector('main');
        if (main) {
           main.classList.add('animate-pulse-gold');
           setTimeout(() => main.classList.remove('animate-pulse-gold'), 1000);
        }
        setTimeout(() => {
          setActiveCustomer(customer);
          setView('customer');
          setShowScanner(false);
          setScanStatus('idle');
        }, 1500);
      } else {
        setScanStatus('error');
        // Visual shake simulation
        const scanner = document.getElementById('qr-scanner-box');
        if (scanner) {
          scanner.classList.add('animate-shake');
          setTimeout(() => scanner.classList.remove('animate-shake'), 500);
        }
        setTimeout(() => setScanStatus('idle'), 2000);
      }
    }
  }

  function handleError(err: any) {
    console.error(err);
  }

  const activeTheme = activeCustomer ? tierThemes[activeCustomer.tier] : tierThemes.Bronze;
  const t = (translations as any)[language];

  const getTierProgress = () => {
    if (!activeCustomer) return 0;
    const currentPoints = activeCustomer.points;
    if (activeCustomer.tier === 'Bronze') return Math.min((currentPoints / 300) * 100, 100);
    if (activeCustomer.tier === 'Silver') return Math.min((currentPoints / 750) * 100, 100);
    return 100;
  };

  const getTierBenefits = (tier: Tier) => {
    switch(tier) {
      case 'Gold': return ["2x Points on all orders", "Monthly Reserved Lot Coffee", "Private Cupping Invites", "Zero Redemption Waiting"];
      case 'Silver': return ["1.5x Points on all orders", "Priority Queueing", "Early Access to New Roasts"];
      default: return ["1x Points on all orders", "Free Signature Stamp Card", "Birthday Reward"];
    }
  };

  const totalRevenue = stats?.revenueOverTime.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const totalRewards = stats?.rewardsIssued.reduce((acc, curr) => acc + curr.count, 0) || 0;
  const conversionRate = 68.2; // Keep mock but could be derived

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-matte-black text-gold font-mono tracking-widest">{t.connecting}</div>;

  return (
    <div className={cn(
      "min-h-screen transition-all duration-1000 bg-matte-black text-white selection:bg-gold/30",
      view !== 'admin' && activeCustomer ? "bg-gradient-to-b " + activeTheme.bg : ""
    )}>
      {/* Header (Bento Style) */}
      <header className="px-5 md:px-10 py-5 border-b border-white/5 flex items-center justify-between gap-4 sticky top-0 z-[60] bg-matte-black/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-full flex items-center justify-center p-0.5 border border-gold/40 shadow-[0_0_15px_rgba(197,160,89,0.3)]">
            <img 
              src="/logo.jpg" 
              alt="Herman & Le Café Logo" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="font-serif text-base md:text-2xl tracking-[1px] md:tracking-[2px] text-gold uppercase underline decoration-gold/30 underline-offset-8">
            {t.brand}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden sm:flex bg-surface border border-white/5 rounded-full p-1 h-8">
            <button 
              onClick={() => setLanguage('en')}
              className={cn("px-3 rounded-full text-[10px] uppercase font-bold transition-all", language === 'en' ? "bg-gold text-matte-black" : "text-text-secondary")}
            >EN</button>
            <button 
              onClick={() => setLanguage('fr')}
              className={cn("px-3 rounded-full text-[10px] uppercase font-bold transition-all", language === 'fr' ? "bg-gold text-matte-black" : "text-text-secondary")}
            >FR</button>
          </div>

          <div className={cn(
            "text-[9px] md:text-[10px] px-2 md:px-3 py-1 rounded-full uppercase tracking-[1px] flex items-center gap-1.5 md:gap-2 border transition-all duration-500",
            isLiveConnected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isLiveConnected ? "bg-emerald-400" : "bg-red-400")} />
            <span className="hidden xs:inline">{isLiveConnected ? t.activeLive : t.connecting}</span>
          </div>

          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-text-secondary hover:text-white transition-colors bg-white/5 rounded-full"
          >
            <Bell className="w-4 h-4 md:w-5 md:h-5" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-matte-black" />
            )}
          </button>
        </div>
      </header>
      {/* Sidebar / Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-matte-black/80 backdrop-blur-2xl border-t border-white/5 md:top-[81px] md:bottom-0 md:left-0 md:w-24 md:flex-col md:border-t-0 md:border-r pb-safe">
        <div className="flex justify-around items-center px-1 py-2 md:flex-col md:h-full md:gap-8 md:py-10">
          <button 
            onClick={() => setView('customer')}
            className={cn(
              "flex flex-col items-center gap-1 p-1 md:p-2 rounded-2xl transition-all duration-500 flex-1 md:flex-none md:min-w-0",
              view === 'customer' ? "text-gold" : "text-text-secondary hover:text-white"
            )}
          >
            <div className={cn(
              "p-2 md:p-2.5 rounded-xl transition-all duration-500",
              view === 'customer' ? "bg-gold/10 shadow-[0_0_20px_rgba(197,160,89,0.15)] ring-1 ring-gold/30" : "bg-transparent"
            )}>
              <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-[8px] md:text-[9px] uppercase font-bold tracking-[1px] md:hidden">Card</span>
          </button>

          <button 
            onClick={() => setView('menu')}
            className={cn(
              "flex flex-col items-center gap-1 p-1 md:p-2 rounded-2xl transition-all duration-500 flex-1 md:flex-none md:min-w-0",
              view === 'menu' ? "text-gold" : "text-text-secondary hover:text-white"
            )}
          >
            <div className={cn(
              "p-2 md:p-2.5 rounded-xl transition-all duration-500",
              view === 'menu' ? "bg-gold/10 shadow-[0_0_20px_rgba(197,160,89,0.15)] ring-1 ring-gold/30" : "bg-transparent"
            )}>
              <Coffee className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-[8px] md:text-[9px] uppercase font-bold tracking-[1px] md:hidden">Menu</span>
          </button>

          <button 
            onClick={() => setView('admin')}
            className={cn(
              "flex flex-col items-center gap-1 p-1 md:p-2 rounded-2xl transition-all duration-500 flex-1 md:flex-none md:min-w-0",
              view === 'admin' ? "text-gold" : "text-text-secondary hover:text-white"
            )}
          >
            <div className={cn(
              "p-2 md:p-2.5 rounded-xl transition-all duration-500",
              view === 'admin' ? "bg-gold/10 shadow-[0_0_20px_rgba(197,160,89,0.15)] ring-1 ring-gold/30" : "bg-transparent"
            )}>
              <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-[8px] md:text-[9px] uppercase font-bold tracking-[1px] md:hidden">Stats</span>
          </button>

          <button 
            onClick={() => setView('history')}
            className={cn(
              "flex flex-col items-center gap-1 p-1 md:p-2 rounded-2xl transition-all duration-500 flex-1 md:flex-none md:min-w-0",
              view === 'history' ? "text-gold" : "text-text-secondary hover:text-white"
            )}
          >
            <div className={cn(
              "p-2 md:p-2.5 rounded-xl transition-all duration-500",
              view === 'history' ? "bg-gold/10 shadow-[0_0_20px_rgba(197,160,89,0.15)] ring-1 ring-gold/30" : "bg-transparent"
            )}>
              <Clock className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-[8px] md:text-[9px] uppercase font-bold tracking-[1px] md:hidden">History</span>
          </button>


          <div className="hidden md:flex mt-auto text-gold/10 flex-col items-center p-4">
             <Coffee className="w-8 h-8 opacity-20" />
          </div>
        </div>
      </nav>

      <main className="pb-24 md:pl-20 md:pb-0">
        {/* Tier Pattern Background Layer */}
        <div className={cn("fixed inset-0 pointer-events-none transition-all duration-1000", activeTheme.bg)} />

        <AnimatePresence mode="wait">
          {view === 'customer' ? (
            <motion.div 
              key="customer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-6xl mx-auto p-4 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8"
            >
               {/* Sidebar Left */}
              <div className="space-y-6 relative z-10 px-2 md:px-0">
                <div className={cn(
                  "border rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center transition-all duration-700",
                  activeCustomer?.tier === 'Gold' ? "bg-[#1a0f0a] border-gold/50" : "bg-surface border-[#222]"
                )}>
                   {/* Background Pattern */}
                   <div className={cn("absolute inset-0 z-0", activeTheme.pattern)}>
                      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(197, 160, 89, 0.2) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                   </div>

                   <div className="relative z-10 w-full flex flex-col items-center">
                     <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center p-0.5 border-2 border-gold shadow-[0_0_20px_rgba(197,160,89,0.4)] mb-3">
                          <img 
                            src="/logo.jpg" 
                            alt="Logo" 
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <div className="card-brand font-serif text-[14px] text-center tracking-[2px] text-gold uppercase">
                           {t.brand}<br/>
                           <span className="text-[10px] opacity-70">{t.since} 2024</span>
                        </div>
                     </div>
                     <div className="text-center mb-6">
                        <h2 className="font-serif text-2xl text-white">{t.clubName}</h2>
                        <p className={cn("text-[11px] mt-1 uppercase tracking-wider", activeTheme.accent)}>{t.memberId}: {activeCustomer?.id}</p>
                     </div>
                     <MembershipCard customer={activeCustomer!} />
                     <div className="mt-8 space-y-4 w-full">
                        <div className="text-center">
                          <p className="text-[11px] uppercase tracking-[1px] font-bold">{activeCustomer?.name}</p>
                          <div className="flex items-center gap-2 justify-center mt-2">
                             <div className={cn("w-2 h-2 rounded-full", activeCustomer?.tier === 'Gold' ? "bg-gold shadow-[0_0_8px_#C5A059]" : "bg-text-secondary")} />
                             <span className={cn("text-[10px] font-bold uppercase tracking-widest", activeTheme.accent)}>{activeCustomer?.tier} MEMBER</span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => setShowWallet(true)}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[11px] font-bold uppercase tracking-widest"
                        >
                          <Smartphone className="w-4 h-4" />
                          {t.addWallet}
                        </button>
                     </div>
                   </div>
                </div>

                <BentoTile label={t.tierBenefits} className="group overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <activeTheme.icon className="w-24 h-24" />
                  </div>
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className={cn("p-2.5 rounded-xl bg-gold/10", activeTheme.accent)}>
                         <activeTheme.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-end mb-1">
                           <p className="text-xs font-bold uppercase tracking-wider">{activeCustomer?.tier} Status</p>
                           <span className="text-[9px] opacity-40 uppercase font-bold tracking-widest">{activeCustomer?.points} PTS</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-2">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${getTierProgress()}%` }}
                             className={cn("h-full", activeTheme.accent.replace('text-', 'bg-'))}
                           />
                        </div>
                        <ul className="mt-4 space-y-2">
                           {getTierBenefits(activeCustomer!.tier).map((benefit, i) => (
                             <li key={i} className="flex items-center gap-2 text-[10px] text-text-secondary">
                               <CheckCircle2 className={cn("w-3 h-3", activeTheme.accent)} />
                               {benefit}
                             </li>
                           ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </BentoTile>
              </div>

              {/* Main Content Center/Right */}
              <div className="md:col-span-2 space-y-6 relative z-10">                 <div className="relative h-60 md:h-72 w-full rounded-[24px] md:rounded-[32px] overflow-hidden border border-gold/20 shadow-2xl group cursor-pointer active:scale-[0.99] transition-all bg-matte-black">
                   <img src="/cups.jpg" alt="Signature Coffee Cups" className="w-full h-full object-cover brightness-[0.4] contrast-[1.1] group-hover:scale-110 transition-transform duration-[2000ms]" referrerPolicy="no-referrer" />                    <div className="absolute inset-0 bg-gradient-to-t from-matte-black via-matte-black/40 to-transparent" />
                   <div className="absolute inset-0 bg-gradient-to-r from-matte-black via-transparent to-transparent opacity-60" />
                   <div className="absolute bottom-5 left-5 md:bottom-10 md:left-10 pr-6">
                      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                        <div className="flex items-center gap-2 mb-1.5 md:mb-3">
                          <div className="h-[1px] w-6 md:w-8 bg-gold/50" />
                          <p className="text-[7px] md:text-[10px] uppercase tracking-[2px] md:tracking-[4px] gold-text font-bold">The Art of the Roast</p>
                        </div>
                        <h1 className="font-serif text-2xl md:text-6xl text-white mb-0.5 md:mb-2 leading-tight tracking-tight">Welcome Back,<br/><span className="italic">{activeCustomer?.name.split(' ')[0]}</span></h1>
                        <p className="text-[8px] md:text-[11px] uppercase tracking-[1px] md:tracking-[3px] text-gold/60 font-medium">Elevating your daily coffee ritual</p>
                      </motion.div>
                   </div>
                   <div className="absolute top-5 right-5 md:top-8 md:right-10">
                      <div className="flex flex-col items-end gap-1 md:gap-2">
                        <div className="flex items-center gap-1 md:gap-2 px-2.5 md:px-4 py-1.5 md:py-2 bg-gold text-matte-black rounded-full text-[8px] md:text-[11px] font-bold uppercase tracking-widest shadow-2xl">
                           <Star className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 fill-matte-black" />
                           {activeCustomer?.tier} Privilege
                        </div>
                      </div>
                   </div>
                </div>



                {/* Signature Series Feature Banner */}
                <div className="relative h-48 w-full rounded-[24px] overflow-hidden border border-white/5 group bg-matte-black shadow-2xl cursor-pointer">
                   <img src="/drinks shot.png" alt="Signature Series" className="w-full h-full object-cover brightness-[0.4] group-hover:scale-110 transition-transform duration-[2000ms]" referrerPolicy="no-referrer" />
                   <div className="absolute inset-0 bg-gradient-to-r from-matte-black via-matte-black/40 to-transparent" />
                   <div className="absolute inset-0 flex flex-col justify-center px-10">
                      <div className="flex items-center gap-2 mb-2">
                         <Crown className="w-4 h-4 text-gold shadow-[0_0_8px_#C5A059]" />
                         <span className="text-[10px] uppercase tracking-[3px] text-gold font-bold">Signature Series</span>
                      </div>
                      <h3 className="font-serif text-3xl text-white mb-2 tracking-tight">The Connoisseur's Guide</h3>
                      <p className="text-[11px] uppercase tracking-[2px] text-text-secondary opacity-80 font-medium">Discover our seasonal roasts & brewing methods</p>
                      <div className="mt-4">
                         <button className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white hover:bg-gold hover:text-matte-black transition-all rounded-lg">Explore Collection</button>
                      </div>
                   </div>
                </div>

                <BentoTile label={t.rewardsJourney}>
                  <div className="relative z-10">
                    <RewardsProgress stamps={activeCustomer?.stamps || 0} />
                    <p className="text-[10px] text-text-secondary mt-4 uppercase tracking-widest text-center">
                      {10 - (activeCustomer?.stamps || 0)} cups until your next signature reward
                    </p>
                  </div>
                </BentoTile>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BentoTile label={t.pointsBalance} value={activeCustomer?.points} className="relative group overflow-hidden">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity">
                       <img src="/coffee cups.png" alt="Cups" className="w-full h-full object-cover grayscale" />
                    </div>
                    <div className="flex flex-col gap-2 mt-2 relative z-10">
                       <div className="flex items-center gap-2">
                         <Zap className={cn("w-4 h-4", activeTheme.accent)} />
                         <span className="text-xs text-text-secondary uppercase tracking-widest">
                           {activeCustomer?.tier === 'Gold' ? '2x Multiplier Active' : 
                            activeCustomer?.tier === 'Silver' ? '1.5x Multiplier Active' : 
                            t.foundersBonus}
                         </span>
                       </div>
                    </div>
                  </BentoTile>
                  <BentoTile label={t.recentPerks} className="overflow-hidden">
                     <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                           {[1,2,3].map(i => (
                             <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-espresso flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-gold" />
                             </div>
                           ))}
                        </div>
                        <span className="text-[10px] text-text-secondary uppercase tracking-[1px]">3 {t.unclaimed}</span>
                     </div>
                  </BentoTile>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <BentoTile label="Referral Program Details" className="bg-gradient-to-r from-gold/5 to-transparent border-gold/20 overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <Share2 className="w-32 h-32 text-gold" />
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="p-4 rounded-2xl bg-gold text-matte-black shadow-lg shadow-gold/20">
                           <Users className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-2xl font-mono font-bold gold-text tracking-wider">{activeCustomer?.referralCode}</p>
                          <p className="text-[11px] text-text-secondary uppercase tracking-[1.5px] font-semibold">Share your unique code & grow the club</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 w-full md:w-auto">
                        <div className="text-center px-4">
                           <p className="text-xl font-light">{activeCustomer?.referralCount}</p>
                           <p className="text-[9px] text-text-secondary uppercase tracking-wider">Total Referrals</p>
                        </div>
                        <div className="text-center px-4 border-x border-white/10">
                           <p className="text-xl font-light text-gold">50</p>
                           <p className="text-[10px] text-gold uppercase tracking-wider font-bold">PTS / Referral</p>
                        </div>
                        <div className="text-center px-4">
                           <p className="text-xl font-light text-emerald-400">25</p>
                           <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">PTS For Friend</p>
                        </div>
                      </div>

                      <button className="whitespace-nowrap px-8 py-3 bg-white text-matte-black text-[11px] font-bold uppercase tracking-[2px] rounded-xl hover:bg-gold transition-all active:scale-95 shadow-xl">
                        Copy Invite Link
                      </button>
                    </div>
                  </BentoTile>
                </div>

                  <BentoTile label={t.personalized} className="bg-[#080808] border-gold/10 p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                      <div className="md:col-span-2 relative h-40 md:h-48 rounded-xl md:rounded-[24px] overflow-hidden border border-white/5 group bg-matte-black shadow-inner">
                         <img src="/coffee guide.jpg" alt="Coffee Guide" className="w-full h-full object-cover brightness-[0.3] group-hover:scale-105 transition-transform duration-1000" />
                         <div className="absolute inset-0 bg-gradient-to-r from-matte-black via-transparent to-transparent" />
                         <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
                            <h3 className="font-serif text-xl md:text-2xl text-gold mb-1">Seasonal Specialties</h3>
                            <p className="text-[9px] md:text-[10px] uppercase tracking-[1px] md:tracking-[2px] text-text-secondary">Limited edition blends for your collection</p>
                            <div className="mt-4 flex gap-4">
                               <button className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-gold border-b border-gold/30 pb-1 hover:border-gold transition-colors">Start Learning</button>
                            </div>
                         </div>
                      </div>
                      {peronalizedOffers.map((offer, i) => {
                         const Icon = { Coffee, Zap, Star, Gift, Crown, Trophy, Sparkles, Flame, Heart, Target, BrainCircuit }[offer.icon] || BrainCircuit;
                         const isCurrentlyRedeeming = isRedeeming === offer.id;
                         return (
                           <div key={i} className="group relative bg-[#121212] border border-white/5 rounded-2xl md:rounded-[24px] p-6 md:p-8 hover:border-gold/30 hover:bg-[#161616] transition-all duration-700 flex flex-col justify-between overflow-hidden">
                              {/* AI Indicator */}
                              <div className="absolute top-3 right-4 md:top-4 md:right-6 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20">
                                <BrainCircuit className="w-2.5 h-2.5 md:w-3 h-3 text-gold animate-pulse" />
                                <span className="text-[7px] md:text-[8px] text-gold uppercase font-bold tracking-tighter">AI Curated</span>
                              </div>
                                
                                <div className="flex items-start gap-4 md:gap-6">
                                  <div className="p-3 md:p-4 bg-gold/5 rounded-xl md:rounded-2xl text-gold group-hover:scale-110 group-hover:bg-gold/10 transition-all">
                                     <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                  </div>
                                  <div className="flex-1">
                                     <h4 className="font-serif text-lg md:text-xl font-medium text-white mb-1 md:mb-2 tracking-tight">{offer.title}</h4>
                                     <p className="text-[10px] md:text-xs text-text-secondary leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity line-clamp-2 md:line-clamp-none">{offer.description}</p>
                                  </div>
                                </div>

                              <button 
                                onClick={() => {
                                  setIsRedeeming(offer.id);
                                  setTimeout(() => setIsRedeeming(null), 2000);
                                }}
                                disabled={isCurrentlyRedeeming}
                                className={cn(
                                  "relative z-10 mt-8 w-full py-3.5 border border-gold/20 rounded-xl text-[10px] font-bold uppercase tracking-[3px] text-gold hover:bg-gold hover:text-matte-black transition-all shadow-lg active:scale-95 overflow-hidden",
                                  isCurrentlyRedeeming && "bg-gold text-matte-black"
                                )}
                              >
                                {isCurrentlyRedeeming ? (
                                  <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> REWARD CLAIMED
                                  </motion.div>
                                ) : t.claimOffer}
                                {isCurrentlyRedeeming && (
                                   <motion.div 
                                      initial={{ x: '-100%' }} 
                                      animate={{ x: '100%' }} 
                                      transition={{ duration: 1.5 }}
                                      className="absolute inset-0 bg-white/20" 
                                   />
                                )}
                              </button>
                           </div>
                         );
                      })}
                    </div>
                  </BentoTile>

                <div className="grid grid-cols-1 gap-6">
                  <BentoTile label="Coffee Station (POS Simulator)">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => handleAddVisit(activeCustomer!.id)}
                        className="flex-1 py-4 bg-gold rounded-[12px] text-matte-black font-bold flex items-center justify-center gap-3 shadow-lg shadow-gold/10 hover:shadow-gold/20 transition-all active:scale-[0.98]"
                      >
                        <Scan className="w-5 h-5" />
                        {t.recordDrink}
                      </button>
                      <button className="flex-1 py-4 bg-surface border border-[#333] rounded-[12px] text-white font-bold flex items-center justify-center gap-3 hover:bg-[#1a1a1a] transition-all">
                        <Gift className="w-5 h-5 text-gold" />
                        {t.redeemItem}
                      </button>
                    </div>
                  </BentoTile>
                </div>
              </div>
            </motion.div>
          ) : view === 'history' ? (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto p-4 md:p-10"
            >
              <OrderHistory transactions={history} />
            </motion.div>
          ) : view === 'admin' ? (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 auto-rows-min"
            >
              {/* Menu Upload Tile */}
              <div className="md:col-span-3 p-6 bg-surface border border-white/5 rounded-2xl md:rounded-[32px] overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Coffee className="w-48 h-48" />
                </div>
                <div className="relative z-10 max-w-2xl">
                  <h3 className="font-serif text-2xl text-white mb-2">Update Signature Menu</h3>
                  <p className="text-xs text-text-secondary uppercase tracking-[2px] mb-6">Upload item photography to synchronize with digital menu</p>
                  
                  <form onSubmit={handleMenuUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Item Name"
                      value={menuUploadForm.name}
                      onChange={e => setMenuUploadForm(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-matte-black border border-[#222] rounded-xl p-3 text-xs outline-none focus:border-gold transition-all"
                    />
                    <input 
                      type="number" 
                      placeholder="Price (FCFA)"
                      value={menuUploadForm.price}
                      onChange={e => setMenuUploadForm(prev => ({ ...prev, price: e.target.value }))}
                      className="bg-matte-black border border-[#222] rounded-xl p-3 text-xs outline-none focus:border-gold transition-all"
                    />
                    <div className="md:col-span-2">
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <label className="flex-1 w-full relative cursor-pointer group">
                          <div className="bg-matte-black border border-[#222] border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 group-hover:border-gold transition-all min-h-[100px]">
                            {menuUploadForm.image ? (
                              <div className="flex flex-col items-center gap-1">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                <span className="text-[10px] text-text-secondary truncate max-w-[200px]">{menuUploadForm.image.name}</span>
                              </div>
                            ) : (
                              <>
                                <Plus className="w-6 h-6 text-gold opacity-50" />
                                <span className="text-[10px] uppercase tracking-widest text-text-secondary">Attach Photograph</span>
                              </>
                            )}
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) setMenuUploadForm(prev => ({ ...prev, image: file }));
                            }}
                          />
                        </label>
                        <button 
                          type="submit"
                          disabled={isUploading || !menuUploadForm.image}
                          className={cn(
                            "w-full md:w-auto px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all h-fit",
                            (isUploading || !menuUploadForm.image)
                              ? "bg-white/5 text-white/20 cursor-not-allowed"
                              : "bg-white text-matte-black hover:bg-gold shadow-xl"
                          )}
                        >
                          {isUploading ? "Uploading..." : "Save to Menu"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              <BentoTile label="AI Customer Segmentation" className="md:col-span-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
                  {stats?.segmentData.map((seg) => (
                    <div key={seg.name} className="bg-matte-black/40 border border-white/5 p-4 rounded-2xl">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">{seg.name}</p>
                        <PieChartIcon className="w-3 h-3 text-gold/40" />
                      </div>
                      <div className="text-2xl font-light">{seg.value}</div>
                      <p className="text-[9px] text-emerald-400 mt-1 uppercase font-bold tracking-tighter">AI Predicted Group</p>
                    </div>
                  ))}
                </div>
              </BentoTile>

              <div className="md:col-span-3">
                 <BentoTile label={t.mailLog} className="bg-surface/50">
                    <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                       {emails.length === 0 ? (
                         <p className="text-[10px] text-text-secondary uppercase text-center py-8">No outbound notifications sent</p>
                       ) : (
                         emails.map(email => (
                           <div key={email.id} className="p-4 rounded-xl bg-matte-black border border-white/5 space-y-2">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <p className="text-[9px] uppercase tracking-widest text-gold font-bold">{t.to}: {email.to}</p>
                                    <h4 className="text-xs font-bold text-white mt-1">{email.subject}</h4>
                                 </div>
                                 <span className="text-[8px] opacity-40 font-mono uppercase">{email.time}</span>
                              </div>
                              <p className="text-[11px] text-text-secondary leading-relaxed">{email.body}</p>
                           </div>
                         ))
                       )}
                    </div>
                 </BentoTile>
              </div>

              <BentoTile label={t.activityFeed} className="md:col-span-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] text-emerald-500 uppercase font-bold tracking-widest">Live Sync</span>
                  </div>
                </div>
                <div className="mt-2">
                   <div className="grid grid-cols-3 md:grid-cols-4 px-2 md:px-4 py-2 text-[9px] md:text-[10px] uppercase tracking-[1px] md:tracking-[2px] opacity-40 font-bold border-b border-white/5">
                      <span>{t.event}</span>
                      <span className="hidden md:block">{t.member}</span>
                      <span>{t.status}</span>
                      <span className="text-right">{t.time}</span>
                   </div>
                   <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      <AnimatePresence initial={false}>
                        {activities.map((act) => (
                          <motion.div 
                            key={act.id} 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-3 md:grid-cols-4 items-center gap-2 md:gap-4 px-2 md:px-4 py-3 md:py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all group"
                          >
                             <div className="flex items-center gap-2 md:gap-3">
                                <div className="p-1.5 rounded-lg bg-surface border border-white/5 group-hover:border-gold/30 transition-colors">
                                  {act.type === 'join' ? <Users className="w-3.5 h-3.5 text-blue-400" /> : 
                                   act.type === 'tier' ? <Trophy className="w-3.5 h-3.5 text-gold" /> :
                                   <Coffee className="w-3.5 h-3.5 text-gold/40" />}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider">{act.type}</span>
                                  <span className="text-[8px] md:hidden text-white/50">{act.customer}</span>
                                </div>
                             </div>
                             <div className="hidden md:block text-xs font-bold text-white/80">{act.customer}</div>
                             <div className="text-[9px] md:text-[10px] text-text-secondary italic group-hover:text-gold transition-colors line-clamp-1">{act.detail}</div>
                             <div className="text-[9px] md:text-[10px] font-mono opacity-40 text-right uppercase">{act.time}</div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                   </div>
                </div>
              </BentoTile>

              <BentoTile label={t.dailyRevenue} value={formatCurrency(totalRevenue)} sub="+12.4% vs yesterday" />
              
              <BentoTile label={t.conversion} value={`${conversionRate}%`} sub="42 new members today" />
              
              <BentoTile label={t.clv} value={formatCurrency(18400)} sub="Avg spend per member" />

              <BentoTile label="Actions" className="md:col-span-1">
                <button 
                  onClick={() => setShowAddCustomer(true)}
                  className="w-full py-4 bg-gold rounded-[12px] text-matte-black font-bold flex items-center justify-center gap-2 shadow-lg shadow-gold/10 hover:shadow-gold/20 transition-all active:scale-[0.98]"
                >
                  <Plus className="w-5 h-5" />
                  New Registration
                </button>
              </BentoTile>

              <BentoTile label="Customer Directory" className="md:col-span-3">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="flex items-center bg-matte-black border border-white/10 rounded-xl md:rounded-2xl p-1 shrink-0 overflow-x-auto scrollbar-none">
                    {(['All', 'Bronze', 'Silver', 'Gold'] as const).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setFilterTier(tier)}
                        className={cn(
                          "px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                          filterTier === tier ? "bg-gold text-matte-black shadow-lg" : "text-text-secondary hover:text-white"
                        )}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {customers
                    .filter(c => {
                      const matchesTier = filterTier === 'All' || c.tier === filterTier;
                      return matchesTier;
                    })
                    .map(customer => (
                    <div 
                      key={customer.id} 
                      onClick={() => {
                        setActiveCustomer(customer);
                        setView('customer');
                      }}
                      className="group p-6 bg-matte-black border border-white/5 rounded-[24px] hover:border-gold/50 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-5 h-5 text-gold" />
                      </div>
                      
                      {/* Interactive hover background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-transparent to-gold/0 group-hover:from-gold/5 transition-all" />

                      <div className="flex items-start gap-5 relative z-10">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-serif text-xl border transition-all", 
                          customer.tier === 'Gold' ? "bg-gold/5 border-gold/30 text-gold shadow-[0_0_15px_rgba(197,160,89,0.1)]" : 
                          customer.tier === 'Silver' ? "bg-slate-300/5 border-slate-300/30 text-slate-300" : 
                          "bg-surface border-white/5 text-text-secondary")}>
                          {customer.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-serif font-medium text-white mb-1 group-hover:text-gold transition-colors">{customer.name}</p>
                          <div className="flex flex-wrap items-center gap-2">
                             <span className={cn("px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border",
                                customer.tier === 'Gold' ? "border-gold/20 text-gold bg-gold/5" :
                                customer.tier === 'Silver' ? "border-slate-300/20 text-slate-300 bg-slate-300/5" :
                                "border-white/10 text-text-secondary bg-white/5"
                             )}>
                                {customer.tier}
                             </span>
                             {customer.segment && (
                               <span className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                 {customer.segment}
                               </span>
                             )}
                             <span className="text-[10px] text-text-secondary font-mono tracking-tighter">{customer.id}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 flex justify-between items-end relative z-10 border-t border-white/5 pt-4">
                        <div>
                           <p className="text-sm font-mono text-gold">{customer.points} <span className="text-[8px] opacity-40">PTS</span></p>
                           <p className="text-[9px] text-text-secondary uppercase tracking-widest mt-0.5">{Math.floor(customer.points/100)} Purchases</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] text-text-secondary uppercase tracking-widest">{t.lastVisit}</p>
                           <p className="text-[10px] font-mono opacity-60 mt-0.5">{new Date(customer.lastVisit).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </BentoTile>

              <BentoTile label="Top Customers by Spend" className="md:col-span-2 md:row-span-2">
                <div className="mt-2 space-y-1">
                  {customers.sort((a,b) => b.points - a.points).slice(0, 6).map((customer, i) => (
                    <div key={customer.id} className="flex items-center justify-between py-3 border-b border-[#222] last:border-0">
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-text-secondary font-mono">0{i+1}</span>
                        <div className="text-sm font-medium">{customer.name}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-xs opacity-40 font-mono hidden sm:block">{Math.floor(customer.points/10)} Drinks</div>
                        <div className="text-sm text-gold font-mono">{formatCurrency(customer.points * 100)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </BentoTile>

              <BentoTile label="Reward ROI" value={`${(totalRevenue / (totalRewards || 1) / 100).toFixed(1)}x`} sub="Revenue per reward point" />

              <BentoTile label="AI Sales Prediction">
                <div className="mt-2">
                  <span className="inline-block text-[9px] px-2 py-0.5 bg-[#2c1a4d] text-[#b794f4] rounded-[4px] font-bold uppercase mb-2">Predicted High</span>
                  <div className="text-2xl font-light">+18% Surge</div>
                  <p className="text-[11px] text-text-secondary mt-1">Expected at 16:30 (Frappuccino Season)</p>
                </div>
              </BentoTile>

              <BentoTile label="SMS Automation" className="md:col-span-1">
                 <div className="flex items-center justify-between">
                    <div>
                       <div className="text-xl font-light tracking-tight">94.2%</div>
                       <p className="text-[10px] text-[#4caf50] uppercase mt-1">Open Rate</p>
                    </div>
                    <div className="text-right">
                       <div className="text-xl font-light tracking-tight">12</div>
                       <p className="text-[10px] text-text-secondary uppercase mt-1">Active</p>
                    </div>
                 </div>
              </BentoTile>

              <BentoTile label="Inventory Alert">
                 <div className="text-[#ffcc00] text-sm mb-2 font-medium">Medium Roast Low</div>
                 <div className="w-full h-1 bg-[#222] rounded-full overflow-hidden">
                    <div className="w-[28%] h-full bg-[#ffcc00] transition-all duration-1000" />
                 </div>
                 <p className="text-[10px] text-text-secondary mt-2">Order from Man, CdI supplier</p>
              </BentoTile>

              <BentoTile label="Growth Trends" className="md:col-span-2 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.revenueOverTime}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C5A059" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#141414', border: '1px solid #222', borderRadius: '8px' }}
                      itemStyle={{ color: '#C5A059' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#C5A059" fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </BentoTile>
            </motion.div>
          ) : (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto p-4 md:p-10 scroll-smooth relative z-10"
            >
              <Menu onQuickAdd={(drink) => handleAddVisit(activeCustomer!.id, drink)} activeCustomer={activeCustomer} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button (QR) */}
      <button 
        onClick={() => setShowScanner(true)}
        className="fixed bottom-28 right-5 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gold text-matte-black shadow-[0_10px_40px_rgba(197,160,89,0.3)] flex items-center justify-center group transition-all hover:scale-110 active:scale-90 z-[70] border-4 border-matte-black ring-1 ring-gold/20"
      >
        <Scan className="w-6 h-6 md:w-8 md:h-8" />
        <div className="absolute -top-12 right-0 bg-gold/10 backdrop-blur-md px-3 py-1 rounded-full border border-gold/30 text-[8px] font-bold text-gold uppercase tracking-[2px] opacity-0 group-hover:opacity-100 transition-opacity hidden md:block whitespace-nowrap">
           Scan Member QR
        </div>
      </button>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-matte-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
            <div className="w-full flex justify-end absolute top-6 right-6">
              <button 
                onClick={() => setShowScanner(false)}
                className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div 
               id="qr-scanner-box"
               className="relative w-full max-w-[280px] sm:max-w-sm aspect-square border-2 border-gold/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(197,160,89,0.1)] transition-all"
            >
               <QrReader
                 onScan={handleScan}
                 onError={handleError}
                 style={{ width: '100%' }}
               />
               <div className="absolute inset-0 border-[30px] md:border-[40px] border-matte-black/60 pointer-events-none" />
               <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gold shadow-[0_0_15px_#C5A059] animate-scan" />
               
               <AnimatePresence>
                 {scanStatus !== 'idle' && (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className={cn(
                       "absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-20",
                       scanStatus === 'success' ? "bg-emerald-500/20" : "bg-red-500/20"
                     )}
                   >
                     {scanStatus === 'success' ? (
                       <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                     ) : (
                       <X className="w-16 h-16 text-red-500 mb-4" />
                     )}
                     <p className={cn("font-bold uppercase tracking-widest text-sm", scanStatus === 'success' ? "text-emerald-500" : "text-red-500")}>
                        {scanStatus === 'success' ? "Member Verified" : "Unknown Signature"}
                     </p>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
            <p className="mt-8 md:mt-10 font-serif text-lg md:text-xl gold-text italic">Awaiting Signature QR...</p>
            <p className="mt-2 text-[10px] text-text-secondary uppercase tracking-[2px]">Scan any Member ID to sync</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet View Modal */}
      <AnimatePresence>
        {showWallet && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-matte-black/95 backdrop-blur-2xl flex flex-col items-center p-4 md:p-6 overflow-y-auto"
          >
             <div className="w-full max-w-sm mt-12 md:mt-20 space-y-8 md:space-y-10 flex flex-col items-center">
                <div className="flex flex-col items-center gap-1 md:gap-2">
                   <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gold/10 flex items-center justify-center mb-1 md:mb-2 text-gold">
                      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                   </div>
                   <h2 className="font-serif text-2xl md:text-3xl gold-text italic tracking-tight">Passport Verified</h2>
                   <p className="text-[8px] md:text-[10px] text-text-secondary uppercase tracking-[2px] md:tracking-[3px] text-center opacity-60">Digital Signature Pass Active</p>
                </div>

                <div 
                  onClick={() => setIsWalletFlipped(!isWalletFlipped)}
                  className="w-full cursor-pointer transition-transform hover:scale-[1.02]"
                >
                   <MembershipCard customer={activeCustomer!} isFlipped={isWalletFlipped} />
                </div>
                 <div className="w-full space-y-6 pb-12">
                   <div className="flex justify-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full transition-all", !isWalletFlipped ? "bg-gold scale-125" : "bg-white/20")} />
                      <div className={cn("w-1.5 h-1.5 rounded-full transition-all", isWalletFlipped ? "bg-gold scale-125" : "bg-white/20")} />
                   </div>

                   <BentoTile label={t.memberInfo} className="p-4 md:p-6">
                      <div className="space-y-3 md:space-y-4">
                         <div className="flex justify-between items-center group">
                            <div className="flex flex-col gap-0.5">
                               <span className="text-[8px] md:text-[9px] text-text-secondary uppercase tracking-widest font-bold">{t.memberId}</span>
                               <span className="text-[10px] md:text-[11px] font-mono group-hover:text-gold transition-colors">{activeCustomer?.id}</span>
                            </div>
                            <QrCode className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" />
                         </div>
                         <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-0.5">
                               <span className="text-[8px] md:text-[9px] text-text-secondary uppercase tracking-widest font-bold">{t.regIn}</span>
                               <span className="text-[10px] md:text-[11px] uppercase tracking-wider">{new Date(activeCustomer?.joinDate || '').toLocaleDateString(language === 'fr' ? 'fr-CI' : 'en-CI', { month: 'long', year: 'numeric' })}</span>
                            </div>
                            <Clock className="w-4 h-4 opacity-20" />
                         </div>
                      </div>
                   </BentoTile>
                   
                   <button 
                    onClick={() => {
                        setShowWallet(false);
                        setIsWalletFlipped(false);
                    }}
                    className="w-full py-4 md:py-5 bg-white text-matte-black font-bold uppercase tracking-[2px] md:tracking-[3px] text-[10px] md:text-[11px] rounded-2xl hover:bg-gold transition-all shadow-xl active:scale-95"
                   >
                     {t.backToClub}
                   </button>
                </div>

             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddCustomer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-matte-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-surface border border-white/10 rounded-2xl md:rounded-[24px] p-5 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h2 className="font-serif text-xl md:text-2xl text-gold mb-4 md:mb-6 italic">Member Registration</h2>
              <form onSubmit={handleAddCustomer} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[9px] md:text-[10px] uppercase tracking-[1px] md:tracking-[2px] text-text-secondary mb-1.5 md:mb-2">{t.fullName}</label>
                    <input 
                      required
                      type="text"
                      value={newCustomerForm.name}
                      onChange={(e) => setNewCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                      className={cn(
                        "w-full bg-matte-black border rounded-xl md:rounded-[12px] p-3 md:p-4 text-xs md:text-sm outline-none transition-all",
                        formErrors.name ? "border-red-500/50 focus:border-red-500" : "border-[#222] focus:border-gold"
                      )}
                      placeholder="e.g. Jean-Luc N'Guessan"
                    />
                    {formErrors.name && <p className="text-red-500 text-[8px] md:text-[9px] mt-1 ml-1 font-medium">{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] uppercase tracking-[1px] md:tracking-[2px] text-text-secondary mb-1.5 md:mb-2">{t.phone}</label>
                    <input 
                      required
                      type="tel"
                      value={newCustomerForm.phone}
                      onChange={(e) => setNewCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                      className={cn(
                        "w-full bg-matte-black border rounded-xl md:rounded-[12px] p-3 md:p-4 text-xs md:text-sm outline-none transition-all",
                        formErrors.phone ? "border-red-500/50 focus:border-red-500" : "border-[#222] focus:border-gold"
                      )}
                      placeholder="+225 00 00"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] uppercase tracking-[1px] md:tracking-[2px] text-text-secondary mb-1.5 md:mb-2">{t.email}</label>
                    <input 
                      type="email"
                      value={newCustomerForm.email}
                      onChange={(e) => setNewCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                      className={cn(
                        "w-full bg-matte-black border rounded-xl md:rounded-[12px] p-3 md:p-4 text-xs md:text-sm outline-none transition-all",
                        formErrors.email ? "border-red-500/50 focus:border-red-500" : "border-[#222] focus:border-gold"
                      )}
                      placeholder="email@cafe.ci"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] md:text-[10px] uppercase tracking-[1px] md:tracking-[2px] text-text-secondary mb-1.5 md:mb-2">{t.referredBy}</label>
                  <input 
                    type="text"
                    value={(newCustomerForm as any).referralCode || ''}
                    onChange={(e) => setNewCustomerForm(prev => ({ ...prev, referralCode: e.target.value } as any))}
                    className="w-full bg-matte-black border border-[#222] rounded-xl md:rounded-[12px] p-3 md:p-4 text-xs md:text-sm focus:border-gold outline-none transition-all"
                    placeholder="CODE-123"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-[9px] md:text-[10px] uppercase tracking-[1px] md:tracking-[2px] text-text-secondary mb-1.5 md:mb-2">{t.joinDate}</label>
                    <input 
                      required
                      type="date"
                      value={newCustomerForm.joinDate}
                      onChange={(e) => setNewCustomerForm(prev => ({ ...prev, joinDate: e.target.value }))}
                      className="w-full bg-matte-black border border-[#222] rounded-xl md:rounded-[12px] p-3 md:p-4 text-xs md:text-sm focus:border-gold outline-none transition-all text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] uppercase tracking-[1px] md:tracking-[2px] text-text-secondary mb-1.5 md:mb-2">{t.lastVisit}</label>
                    <input 
                      required
                      type="date"
                      value={newCustomerForm.lastVisit}
                      onChange={(e) => setNewCustomerForm(prev => ({ ...prev, lastVisit: e.target.value }))}
                      className="w-full bg-matte-black border border-[#222] rounded-xl md:rounded-[12px] p-3 md:p-4 text-xs md:text-sm focus:border-gold outline-none transition-all text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2 md:pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAddCustomer(false)}
                    className="flex-1 py-3 md:py-4 border border-[#222] rounded-xl text-[10px] md:text-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 md:py-4 bg-gold text-matte-black rounded-xl text-[10px] md:text-sm font-bold uppercase tracking-widest shadow-lg shadow-gold/10 hover:shadow-gold/20 transition-all active:scale-[0.98]"
                  >
                    {t.register}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-matte-black/60 backdrop-blur-sm z-[150]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-surface border-l border-white/5 z-[151] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-matte-black/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gold/10">
                    <Bell className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="font-serif text-2xl text-white">Inbox</h3>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="p-2 rounded-full hover:bg-white/5 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                      <Bell className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-xs text-text-secondary uppercase tracking-[2px]">Your connection is clear</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <motion.div 
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-5 rounded-[24px] border transition-all group",
                        notif.read ? "bg-matte-black/20 border-white/5" : "bg-gold/5 border-gold/20"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-gold uppercase font-bold tracking-widest">{notif.type}</span>
                        <span className="text-[9px] opacity-40 font-mono italic">{notif.time}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-2 group-hover:text-gold transition-colors">{notif.title}</h4>
                      <p className="text-[11px] text-text-secondary leading-relaxed">{notif.message}</p>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="p-6 bg-matte-black/40 border-t border-white/5">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="w-full py-4 bg-white text-matte-black font-bold uppercase tracking-[3px] text-[11px] rounded-xl hover:bg-gold transition-all"
                >
                  Close Bulletin
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
