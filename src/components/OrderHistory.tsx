import React from 'react';
import { motion } from 'motion/react';
import { Clock, Calendar, Coffee, User, Tag, ArrowRight } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';

interface OrderHistoryProps {
  transactions: Transaction[];
}

export function OrderHistory({ transactions }: OrderHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 md:p-20 text-center space-y-4">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
          <Clock className="w-8 h-8 md:w-10 md:h-10 text-text-secondary opacity-20" />
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-serif text-white">No Drink History Yet</h3>
          <p className="text-text-secondary text-[10px] uppercase tracking-widest mt-2">Start your journey with a signature brew</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="font-serif text-2xl md:text-4xl text-white tracking-tight">Drink History</h2>
          <p className="text-[9px] md:text-[10px] text-gold uppercase tracking-[2px] md:tracking-[3px] mt-1 md:mt-2 font-bold opacity-70">Recent selections & rewards</p>
        </div>
        <div className="px-3 md:px-4 py-1.5 md:py-2 bg-gold/10 border border-gold/20 rounded-xl self-start sm:self-center">
          <span className="text-[10px] text-gold font-bold uppercase tracking-widest">{transactions.length} Visits</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4">
        {transactions.map((transaction, idx) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative bg-surface border border-white/5 rounded-2xl md:rounded-[24px] p-4 md:p-6 hover:border-gold/30 hover:bg-white/[0.04] transition-all duration-500 overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <Coffee className="w-32 h-32 text-gold" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 relative z-10">
              <div className="flex items-start gap-4 md:gap-5">
                <div className="shrink-0 p-3 md:p-4 bg-gold/10 rounded-xl md:rounded-2xl text-gold border border-gold/10 group-hover:scale-110 transition-transform">
                  <Coffee className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-0.5 md:mb-1">
                    <h4 className="font-serif text-lg md:text-xl text-white group-hover:text-gold transition-colors">{transaction.drinkType}</h4>
                    <span className={cn(
                      "text-[7px] md:text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-[1px] border leading-none",
                      transaction.action === 'purchase' 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-gold/10 text-gold border-gold/20"
                    )}>
                      {transaction.action}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-1.5 md:gap-y-2">
                    <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] text-text-secondary uppercase tracking-[1px] md:tracking-widest">
                       <Calendar className="w-3 h-3" />
                       {new Date(transaction.timestamp).toLocaleDateString('en-US', { 
                         month: 'short', 
                         day: 'numeric', 
                         hour: '2-digit',
                         minute: '2-digit'
                       })}
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] text-text-secondary uppercase tracking-[1px] md:tracking-widest">
                       <User className="w-3 h-3" />
                       <span className="hidden sm:inline">Service by:</span> <span className="text-white ml-0.5">{transaction.staff}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8 border-t border-white/5 pt-4 md:pt-0 md:border-t-0 md:border-l md:pl-8">
                <div className="text-left md:text-right">
                  <p className="text-[9px] md:text-[10px] text-text-secondary uppercase tracking-widest mb-0.5 md:mb-1">Earned</p>
                  <p className="text-base md:text-lg font-mono text-emerald-400 font-light flex items-center gap-1.5 text-left md:justify-end">
                    <Tag className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    +{transaction.pointsEarned} <span className="text-[9px] md:text-[10px] font-bold">PTS</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] md:text-[10px] text-text-secondary uppercase tracking-widest mb-0.5 md:mb-1">Total</p>
                  <p className="text-base md:text-lg font-mono text-gold font-light tracking-tighter">
                    {formatCurrency(transaction.price)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
