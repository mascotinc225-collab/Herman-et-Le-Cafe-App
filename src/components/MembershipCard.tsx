import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import { Coffee, ShieldCheck, Crown } from 'lucide-react';
import { Customer } from '../types';
import { cn } from '../lib/utils';

interface MembershipCardProps {
  customer: Customer;
  isFlipped?: boolean;
}

export function MembershipCard({ customer, isFlipped = false }: MembershipCardProps) {
  const tierColors = {
    Bronze: 'from-espresso to-[#0A0A0A] border-gold/20',
    Silver: 'from-slate-800 to-matte-black border-slate-600/30',
    Gold: 'from-[#1a0f0a] to-[#0A0A0A] border-gold/40',
  };

  const TierIcon = {
    Bronze: Coffee,
    Silver: ShieldCheck,
    Gold: Crown,
  }[customer.tier];

  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto h-[240px]">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        className="w-full h-full relative preserve-3d"
      >
        {/* FRONT */}
        <motion.div
          className={cn(
            "absolute inset-0 backface-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-2xl overflow-hidden",
            tierColors[customer.tier]
          )}
        >
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="grid grid-cols-6 gap-4 translate-rotate-45">
              {Array.from({ length: 24 }).map((_, i) => (
                <Coffee key={i} className="w-12 h-12" />
              ))}
            </div>
          </div>

          {/* Card Header */}
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center p-0.5 border border-gold/40 shrink-0 shadow-[0_0_10px_rgba(197,160,89,0.2)]">
                <img 
                  src="/logo.jpg" 
                  alt="Logo" 
                  className="w-full h-full object-cover rounded-[2px]"
                />
              </div>
              <div>
                <h2 className="font-serif text-xl tracking-tight gold-text">HERMAN & LE CAFÉ</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-60">Signature Brew Club</p>
              </div>
            </div>
            <TierIcon className={cn("w-6 h-6", customer.tier === 'Gold' ? 'text-gold' : 'opacity-60')} />
          </div>

          {/* Card Body */}
          <div className="mt-8 flex justify-between items-end relative z-10">
            <div>
              <p className="font-serif text-lg uppercase tracking-wider truncate max-w-[180px]">{customer.name}</p>
              <p className="text-sm opacity-60 font-mono mt-1">{customer.id}</p>
            </div>
            <div className="bg-white p-1 rounded-sm shadow-inner group transition-transform hover:scale-105">
              <QRCodeSVG 
                value={customer.id} 
                size={64} 
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Card Footer */}
          <div className="mt-6 flex justify-between items-center relative z-10 pt-4 border-t border-white/5 text-[10px] uppercase tracking-widest opacity-40">
             <span>Côte d'Ivoire</span>
             <span>Premium Club</span>
          </div>
        </motion.div>

        {/* BACK */}
        <motion.div
          className={cn(
            "absolute inset-0 backface-hidden rounded-2xl border bg-[#111] p-6 shadow-2xl rotate-y-180 flex flex-col justify-between",
            customer.tier === 'Gold' ? "border-gold/30" : "border-white/10"
          )}
        >
           <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                 <span className="text-[9px] uppercase tracking-widest opacity-50">Member Since</span>
                 <span className="text-[11px] font-medium">{new Date(customer.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                 <span className="text-[9px] uppercase tracking-widest opacity-50">Tier Status</span>
                 <span className={cn("text-[11px] font-bold", customer.tier === 'Gold' ? "text-gold" : "")}>{customer.tier}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                 <span className="text-[9px] uppercase tracking-widest opacity-50">Points Balance</span>
                 <span className="text-[11px]">{customer.points}</span>
              </div>
           </div>

           <div className="text-center">
              <div className="inline-block p-1 bg-white rounded-sm mb-2">
                 <QRCodeSVG value={`https://ais-dev.example.com/check/${customer.id}`} size={40} />
              </div>
              <p className="text-[8px] opacity-40 uppercase tracking-widest">Digital Merchant Copy</p>
           </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
