"use client";

import { useState, useEffect } from "react";
import { getReports } from "@/lib/actions";
import { ScoutReport } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Banknote, TrendingUp, DollarSign, Calculator, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MarketPage() {
  const [reports, setReports] = useState<ScoutReport[]>([]);
  
  // Stati Simulatore ROI
  const [roiPlayerId, setRoiPlayerId] = useState<string>(""); // ID del giocatore selezionato per ROI
  const [purchasePrice, setPurchasePrice] = useState(10);
  const [years, setYears] = useState(3);
  const [growthRate, setGrowthRate] = useState(15);

  useEffect(() => {
    getReports().then((data: any) => {
        setReports(data.map((r: any) => ({
            ...r,
            matchDate: new Date(r.matchDate).toISOString(),
            stats: { pace: r.pace, shooting: r.shooting, passing: r.passing, dribbling: r.dribbling, defending: r.defending, physical: r.physical, diving: r.diving, handling: r.handling, kicking: r.kicking, reflexes: r.reflexes, gkPositioning: r.gkPositioning, gkSpeed: r.gkSpeed },
            customTags: r.customTags || [],
            imageUrl: r.imageUrl || null
        })));
    });
  }, []);

  // Quando seleziono un giocatore dal dropdown ROI, aggiorno il prezzo
  const handleRoiPlayerChange = (id: string) => {
      setRoiPlayerId(id);
      const player = reports.find(r => r.id === id);
      if (player) {
          setPurchasePrice(player.marketValue > 0 ? player.marketValue : 1);
      }
  };

  const selectedRoiPlayer = reports.find(r => r.id === roiPlayerId);

  // Top list per valore
  const topValuePlayers = [...reports].sort((a, b) => b.marketValue - a.marketValue).slice(0, 5);
  
  // Calcolo ROI
  const futureValue = purchasePrice * Math.pow(1 + growthRate / 100, years);
  const profit = futureValue - purchasePrice;
  const roi = purchasePrice > 0 ? (profit / purchasePrice) * 100 : 0;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b dark:border-slate-800 pb-6">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    <Banknote className="text-emerald-600 dark:text-emerald-500" size={32} />
                    Centro Mercato
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                    Analisi finanziaria, valori di mercato e proiezioni future.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* TOP VALORE ROSA */}
            <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-full">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 pb-4">
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                        <DollarSign className="text-emerald-600 dark:text-emerald-500" /> Top Valore Rosa
                    </CardTitle>
                    <CardDescription className="dark:text-slate-400">I giocatori con la valutazione di mercato più alta nel database.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="space-y-4">
                        {topValuePlayers.map((player, index) => (
                            <div key={player.id} className="flex items-center justify-between p-3 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-950 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="font-black text-slate-300 text-xl w-6 text-center">{index + 1}</div>
                                    <Avatar className="h-10 w-10 border border-slate-100 dark:border-slate-700">
                                        <AvatarImage src={player.imageUrl || ""} className="object-cover" />
                                        <AvatarFallback>{player.rating}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-slate-100">{player.playerName}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{player.team} • {player.playerAge} anni</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">€{player.marketValue}M</div>
                                    <Link href={`/report/${player.id}`} className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-end gap-1">
                                        Analisi <ArrowRight size={10}/>
                                    </Link>
                                </div>
                            </div>
                        ))}
                        {topValuePlayers.length === 0 && <p className="text-center text-slate-400 py-4">Nessun dato disponibile.</p>}
                    </div>
                </CardContent>
            </Card>

            {/* SIMULATORE ROI */}
            <Card className="border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 shadow-sm h-full">
                <CardHeader className="pb-4 border-b border-emerald-100 dark:border-emerald-900">
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                            <Calculator size={24} /> Simulatore ROI
                        </CardTitle>
                    </div>
                    <CardDescription className="text-emerald-700/70 dark:text-emerald-500/70">
                        Stima il ritorno sull'investimento basato sulla crescita prevista.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-8">
                    
                    {/* SELETTORE GIOCATORE PER ROI */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Importa dati da giocatore</label>
                        <Select onValueChange={handleRoiPlayerChange} value={roiPlayerId}>
                            <SelectTrigger className="bg-white dark:bg-slate-900 dark:border-emerald-900/50">
                                <SelectValue placeholder="Seleziona un giocatore (Opzionale)" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-900 dark:border-emerald-900">
                                {reports.map(r => <SelectItem key={r.id} value={r.id} className="cursor-pointer">{r.playerName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <label className="font-bold text-slate-700 dark:text-slate-300 text-sm">Prezzo Acquisto (€ Mln)</label>
                                {/* Mostra nome giocatore se selezionato */}
                                {selectedRoiPlayer && (
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                                        Per: {selectedRoiPlayer.playerName}
                                    </span>
                                )}
                            </div>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xl">€{purchasePrice}M</span>
                        </div>
                        {/* Slider fino a 500M */}
                        <Slider 
                            value={[purchasePrice]} 
                            onValueChange={(vals) => {
                                setPurchasePrice(vals[0]);
                                if (roiPlayerId) setRoiPlayerId(""); // Deseleziona se modifico a mano
                            }} 
                            max={500} 
                            step={1} 
                            className="cursor-pointer" 
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <label className="font-bold text-slate-700 dark:text-slate-300 text-sm">Anni di Sviluppo</label>
                            <span className="font-bold text-blue-700 dark:text-blue-400">{years} Anni</span>
                        </div>
                        <Slider value={[years]} onValueChange={(vals) => setYears(vals[0])} max={10} step={1} className="cursor-pointer" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <label className="font-bold text-slate-700 dark:text-slate-300 text-sm">Crescita Annuale Stimata (%)</label>
                            <span className="font-bold text-purple-700 dark:text-purple-400">+{growthRate}% / anno</span>
                        </div>
                        <Slider value={[growthRate]} onValueChange={(vals) => setGrowthRate(vals[0])} max={50} step={1} className="cursor-pointer" />
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900 shadow-sm mt-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">Valore Futuro</div>
                                <div className="text-3xl font-black text-slate-900 dark:text-white">€{futureValue.toFixed(1)}M</div>
                            </div>
                            <div>
                                <div className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">Profitto Netto</div>
                                <div className={`text-3xl font-black ${profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                                    {profit >= 0 ? "+" : ""}€{profit.toFixed(1)}M
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t dark:border-slate-800 flex justify-between items-center">
                            <span className="font-bold text-slate-600 dark:text-slate-400 text-sm">ROI Totale</span>
                            <Badge className={`text-lg text-white ${roi >= 0 ? "bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}>
                                {roi >= 0 ? "+" : ""}{roi.toFixed(0)}%
                            </Badge>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    </div>
  );
}