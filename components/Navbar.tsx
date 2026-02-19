"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Users, PlusCircle, Shield, RectangleVertical, Star, GitCompare, Banknote, Columns, Layers, Bell, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { getWatchlistReports } from "@/lib/actions"; 
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Navbar() {
  const pathname = usePathname();
  const [expiringPlayers, setExpiringPlayers] = useState<any[]>([]);

  // Caricamento Notifiche (Scadenze < 6 mesi per i Preferiti)
  useEffect(() => {
    const checkExpirations = async () => {
        const favorites = await getWatchlistReports();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        const today = new Date();

        const expiring = favorites.filter((p: any) => {
            if (!p.contractExpiry) return false;
            const expiryDate = new Date(p.contractExpiry);
            return expiryDate > today && expiryDate <= sixMonthsFromNow;
        });

        setExpiringPlayers(expiring);
    };
    checkExpirations();
  }, [pathname]);

  const links = [
    { href: "/", label: "Home", icon: House },
    { href: "/lineup", label: "Formazione", icon: RectangleVertical },
    { href: "/teams", label: "Squadre", icon: Users },
    { href: "/watchlist", label: "Watchlist", icon: Star },
    { href: "/compare", label: "Confronta", icon: GitCompare },
    { href: "/market", label: "Mercato", icon: Banknote },
    { href: "/pipeline", label: "Pipeline", icon: Columns },
    { href: "/depth-chart", label: "Depth Chart", icon: Layers },
    // RIMOSSO: Mappa
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group shrink-0 mr-4">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-sm">
                <Shield size={18} strokeWidth={3} />
            </div>
            <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-slate-100 hidden sm:inline">
              Scout<span className="text-primary">Pro</span>
            </span>
          </Link>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex items-center gap-1 bg-slate-50/50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-hide flex-1 justify-center max-w-5xl mx-4">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap",
                    isActive 
                      ? "bg-white dark:bg-slate-800 text-primary shadow-sm border border-slate-200 dark:border-slate-700" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}>
                    <link.icon size={14} strokeWidth={isActive ? 3 : 2} />
                    {link.label}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* AZIONI DESTRA */}
          <div className="flex items-center gap-2 shrink-0 ml-4">
            
            {/* NOTIFICHE */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Bell size={18} />
                        {expiringPlayers.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse"></span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0 dark:bg-slate-900 dark:border-slate-800">
                    <div className="p-3 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <h4 className="font-bold text-sm flex items-center gap-2"><Bell size={14} className="text-primary"/> Notifiche Contratti</h4>
                    </div>
                    <ScrollArea className="h-[300px]">
                        {expiringPlayers.length > 0 ? (
                            <div className="flex flex-col p-2">
                                {expiringPlayers.map(p => (
                                    <Link key={p.id} href={`/report/${p.id}`} className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors group">
                                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 dark:text-red-400 shrink-0">
                                            <AlertTriangle size={16} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">{p.playerName}</div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Scadenza: <span className="font-semibold text-red-500">{new Date(p.contractExpiry).toLocaleDateString()}</span></p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                                <Bell size={24} className="opacity-20"/>
                                <p className="text-xs">Nessuna scadenza imminente.</p>
                            </div>
                        )}
                    </ScrollArea>
                </PopoverContent>
            </Popover>

            <ModeToggle />
            
            <Link href="/new-report">
                <Button size="sm" className="hidden sm:flex gap-1.5 font-bold shadow-md shadow-primary/20 cursor-pointer hover:scale-105 transition-transform text-xs h-8 px-3">
                    <PlusCircle size={14} strokeWidth={3} />
                    <span className="hidden lg:inline">Nuovo Report</span>
                    <span className="lg:hidden">Nuovo</span>
                </Button>
                <Button size="icon" className="sm:hidden h-8 w-8 shadow-md cursor-pointer">
                    <PlusCircle size={18} />
                </Button>
            </Link>
          </div>
        </div>
        
        {/* MENU MOBILE */}
        <div className="md:hidden flex justify-between py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-x-auto scrollbar-hide gap-2 px-1">
             {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={cn("p-3 rounded-xl transition-colors shrink-0 flex flex-col items-center justify-center min-w-[60px]", isActive ? "bg-primary/10 text-primary dark:bg-primary/20" : "text-slate-400 dark:text-slate-500")}>
                    <link.icon size={20} strokeWidth={isActive ? 3 : 2}/>
                    <span className="text-[9px] font-bold mt-1">{link.label}</span>
                </Link>
              );
            })}
        </div>
      </div>
    </nav>
  );
}