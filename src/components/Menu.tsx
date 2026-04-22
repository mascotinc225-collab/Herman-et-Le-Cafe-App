import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, IceCream, Star, Clock, Zap, Crown, ChevronRight, Filter, Flame, Plus, Sparkles } from 'lucide-react';
import { menuData, offers } from '../data/menuData';
import { cn } from '../lib/utils';
import { Customer } from '../types';

interface MenuProps {
  onQuickAdd?: (item: { name: string; price: number }) => void;
  activeCustomer?: Customer | null;
}

export function Menu({ onQuickAdd, activeCustomer }: MenuProps) {
  const [activeCategory, setActiveCategory] = useState(menuData[0].title);
  const [isScrolled, setIsScrolled] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const filteredMenu = menuData;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
      
      // Determine active section based on scroll position
      const sections = menuData.map(cat => document.getElementById(cat.title.replace(/\s+/g, '-')));
      const currentSection = sections.find(section => {
        if (!section) return false;
        const rect = section.getBoundingClientRect();
        return rect.top >= 0 && rect.top <= 400;
      });
      
      if (currentSection) {
        setActiveCategory(currentSection.id.replace(/-/g, ' '));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCategory = (title: string) => {
    const id = title.replace(/\s+/g, '-');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveCategory(title);
    }
  };

  const isItemInOffer = (item: any) => {
    // Logic for o2: Chill Combo (Iced drink + Milkshake)
    if (item.id.startsWith('i') || item.id.startsWith('s')) return 'Chill Combo Deal';
    // Logic for o3: Happy Hour (3PM-6PM: Iced drinks)
    const hour = new Date().getHours();
    if (item.id.startsWith('i') && hour >= 15 && hour <= 18) return 'Happy Hour 🔥';
    return null;
  };

  return (
    <div className="space-y-6 md:space-y-12 pb-24 px-1">
      {/* Category Navigation Bar */}
      <div className={cn(
        "sticky top-0 z-50 transition-all duration-500 py-2.5 md:py-4 px-1.5 -mx-1.5 md:px-6 md:-mx-6",
        isScrolled ? "bg-matte-black/90 backdrop-blur-xl border-b border-white/10 shadow-2xl" : "bg-transparent"
      )}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-1.5 scrollbar-none justify-start md:justify-center -mx-4 px-4 md:mx-0 md:px-0">
            {menuData.map((category) => (
              <button
                key={category.title}
                onClick={() => scrollToCategory(category.title)}
                className={cn(
                  "whitespace-nowrap px-3.5 md:px-6 py-1.5 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-[1px] md:tracking-[2px] transition-all border",
                  activeCategory === category.title
                    ? "bg-gold text-matte-black border-gold shadow-lg shadow-gold/10"
                    : "bg-white/5 text-text-secondary border-white/10 hover:border-gold/30 hover:text-white"
                )}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="relative h-48 md:h-72 w-full rounded-2xl md:rounded-[32px] overflow-hidden border border-gold/20 shadow-2xl group transition-all bg-matte-black mt-4 md:mb-12">
        <img 
          src="/ice drinks.jpg" 
          alt="Herman & Le Café Menu" 
          className="w-full h-full object-cover brightness-[0.3] group-hover:scale-105 transition-transform duration-[3000ms]" 
          referrerPolicy="no-referrer" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-matte-black via-matte-black/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
              <div className="w-8 md:w-12 h-[1px] bg-gold/50" />
              <Coffee className="w-4 h-4 md:w-6 md:h-6 text-gold" />
              <div className="w-8 md:w-12 h-[1px] bg-gold/50" />
            </div>
            <h1 className="font-serif text-3xl md:text-7xl text-white mb-1 md:mb-2 tracking-tight">HERMAN & LE CAFÉ</h1>
            <p className="text-gold text-[10px] md:text-sm tracking-[3px] md:tracking-[6px] uppercase font-light">Le Menu Signature</p>
          </motion.div>
        </div>
      </div>

      {/* Offers Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {offers.map((offer, idx) => (
          <motion.div 
            key={offer.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="relative overflow-hidden bg-surface border border-gold/10 p-4 md:p-6 rounded-2xl md:rounded-[24px] group hover:border-gold/30 hover:bg-white/[0.04] transition-all duration-500"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              {offer.title === 'Happy Hour' ? <Clock className="w-12 h-12 md:w-16 md:h-16 text-gold" /> : <Zap className="w-12 h-12 md:w-16 md:h-16 text-gold" />}
            </div>
            <div className="flex items-start gap-3 md:gap-4">
              <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-gold/10 text-gold shadow-inner shrink-0">
                {offer.title === 'Happy Hour' ? <Clock className="w-5 h-5 md:w-6 md:h-6" /> : <Star className="w-5 h-5 md:w-6 md:h-6" />}
              </div>
              <div>
                <h3 className="text-white font-serif text-lg md:text-xl mb-0.5 md:mb-1">{offer.title}</h3>
                <p className="text-text-secondary text-[10px] md:text-[11px] uppercase tracking-[1px] md:tracking-widest leading-relaxed">{offer.description}</p>
                <div className="mt-2.5 md:mt-3 inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 bg-gold text-matte-black text-[9px] md:text-[10px] font-bold rounded-full">
                  <Sparkles className="w-2.5 md:w-3 h-2.5 md:h-3" />
                  {offer.discount}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Menu Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 mt-16">
        {filteredMenu.map((category, catIdx) => (
          <motion.div 
            key={category.title}
            id={category.title.replace(/\s+/g, '-')}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: catIdx * 0.1 }}
            className="space-y-8 scroll-mt-32"
          >
            <div className="flex items-end gap-3 md:gap-4 border-b border-gold/20 pb-3 md:pb-4">
              <div>
                <h2 className="font-serif text-2xl md:text-4xl text-white tracking-tight leading-none">{category.title}</h2>
                {category.description && (
                  <p className="text-[9px] md:text-[10px] text-gold/60 uppercase tracking-[1px] md:tracking-[2px] mt-1.5 md:mt-2 font-medium">{category.description}</p>
                )}
              </div>
              <div className="flex-1 h-[1px] bg-gold/10 mb-1" />
            </div>

            <div className="space-y-4 md:space-y-6">
              {category.items.map((item, itemIdx) => {
                const offerTag = isItemInOffer(item);
                const isItemJustAdded = justAdded === item.id;
                
                return (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (catIdx * 0.05) + (itemIdx * 0.03) }}
                  className="group relative flex gap-3 md:gap-6 p-2.5 md:p-4 rounded-xl md:rounded-[28px] bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-all duration-500 overflow-hidden"
                >
                  {item.image && (
                    <div className="shrink-0 w-20 h-20 md:w-32 md:h-32 rounded-lg md:rounded-[24px] overflow-hidden border border-gold/10 group-hover:border-gold/30 transition-all bg-matte-black shadow-xl relative">
                      <motion.img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        referrerPolicy="no-referrer"
                      />
                      {item.isSignature && (
                        <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-matte-black/70 backdrop-blur-md p-1 md:p-2 rounded-full border border-gold/40 shadow-xl">
                           <Crown className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-gold" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-center gap-1 md:gap-2 overflow-hidden">
                    <div className="flex justify-between items-baseline gap-2">
                      <div className="flex flex-col gap-0.5 md:gap-1 overflow-hidden">
                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                          <h3 className="text-white font-serif text-sm md:text-2xl group-hover:text-gold transition-colors truncate">
                            {item.name}
                          </h3>
                          {item.isBestseller && (
                            <span className="flex items-center gap-1 text-[6px] md:text-[7px] bg-orange-500/20 text-orange-400 px-1 md:px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-orange-500/20">
                              <Flame className="w-2 md:w-2.5 h-2 md:h-2.5 fill-orange-400" /> Best
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                          {item.name.includes('2 ×') && (
                            <span className="text-[6px] md:text-[8px] bg-gold/20 text-gold px-1 md:px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-gold/20">
                              Double
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <div className="flex items-baseline gap-0.5">
                           <span className="font-mono text-gold text-sm md:text-xl font-bold md:font-light tracking-tight md:tracking-widest">{item.price.toLocaleString()}</span>
                           <span className="text-[6px] md:text-[9px] text-gold/40 uppercase tracking-widest font-black">FCFA</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-text-secondary text-[9px] md:text-xs group-hover:text-white/80 transition-colors pr-2 md:pr-16 leading-tight md:leading-relaxed font-light line-clamp-2 italic mb-2 md:mb-4">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-end">
                      {onQuickAdd && activeCustomer && (
                        <button 
                          onClick={() => {
                            onQuickAdd(item);
                            setJustAdded(item.id);
                            setTimeout(() => setJustAdded(null), 2000);
                          }}
                          disabled={isItemJustAdded}
                          className={cn(
                            "group/btn flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl transition-all duration-300 border",
                            isItemJustAdded 
                              ? "bg-emerald-500 text-white border-emerald-500 scale-95" 
                              : "bg-gold/5 text-gold border-gold/20 hover:bg-gold hover:text-matte-black hover:border-gold shadow-lg"
                          )}
                        >
                          {isItemJustAdded ? (
                            <>
                              <Plus className="w-3 md:w-3.5 h-3 md:h-3.5 rotate-45" />
                              <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider">Confirmed</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 md:w-3.5 h-3 md:h-3.5 group-hover/btn:rotate-90 transition-transform" />
                              <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider">Quick Add</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Subtle Glow Effect on Hover */}
                  <div className="absolute inset-0 rounded-2xl md:rounded-[28px] bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl -z-10" />
                </motion.div>
              )})}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-20 p-10 rounded-[32px] bg-surface/50 border border-gold/5 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
           <Crown className="w-64 h-64 text-gold" />
        </div>
        <div className="relative z-10">
           <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
             <Crown className="w-4 h-4 text-gold" />
             <span className="text-[10px] text-gold uppercase tracking-[3px] font-bold">Exclusive Privilege</span>
           </div>
           <h4 className="font-serif text-3xl text-white mb-2">Member Speciality Selection</h4>
           <p className="text-text-secondary text-xs pr-4 max-w-md">Earn coffee stamps and points on every selection from our signature menu. Elevating the Abidjan coffee culture, one roast at a time.</p>
        </div>
        <button className="relative z-10 whitespace-nowrap px-10 py-5 bg-white text-matte-black text-[11px] font-bold uppercase tracking-[4px] rounded-full hover:bg-gold transition-all active:scale-95 shadow-2xl shadow-white/5">
          Order for Pickup
        </button>
      </div>
    </div>
  );
}
