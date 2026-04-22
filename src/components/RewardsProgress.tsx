import { motion } from 'motion/react';
import { Coffee, Gift } from 'lucide-react';
import { cn } from '../lib/utils';

interface RewardsProgressProps {
  stamps: number;
}

export function RewardsProgress({ stamps }: RewardsProgressProps) {
  return (
    <div className="bg-transparent">
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3">
        {Array.from({ length: 10 }).map((_, index) => {
          const isStamped = index < stamps;
          const isFinal = index === 9;
          const Icon = isFinal ? Gift : Coffee;

          return (
            <motion.div
              key={index}
              initial={false}
              animate={isStamped ? { scale: [1, 1.1, 1] } : {}}
              className={cn(
                "aspect-square rounded-full flex items-center justify-center transition-all duration-300 border relative overflow-hidden",
                isStamped 
                  ? "bg-[#1a0f0a] border-gold/40 shadow-[0_0_15px_rgba(197,160,89,0.2)]" 
                  : "border-dashed border-white/5",
                isFinal && !isStamped && "border-gold/30 ring-2 ring-gold/10"
              )}
            >
              {isStamped ? (
                <img 
                  src="/Latte cup.png" 
                  alt="Stamped Cup" 
                  className="w-full h-full object-cover scale-110"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full opacity-10">
                   <Icon className={cn(isFinal ? "w-6 h-6" : "w-5 h-5", "text-gold")} />
                </div>
              )}
              {isFinal && !isStamped && (
                <div className="absolute inset-0 rounded-full animate-pulse bg-gold/5" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
