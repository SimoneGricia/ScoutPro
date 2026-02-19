"use client";

import { useState, useEffect, useTransition } from "react";
import { getReports } from "@/lib/actions";
import { generateAiComparison, AiVerdict } from "@/lib/ai-actions";
import { ScoutReport } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitCompare, Shield, Trophy, Activity, User, Sparkles, ArrowRightLeft, Share2, Bot, Loader2, AlertTriangle, CalendarDays } from "lucide-react";
import SkillsChart from "@/components/SkillsChart";

export default function ComparePage() {
  const [reports, setReports] = useState<ScoutReport[]>([]);
  const [playerAId, setPlayerAId] = useState<string>("");
  const [playerBId, setPlayerBId] = useState<string>("");
  
  const [aiVerdict, setAiVerdict] = useState<AiVerdict | null>(null);
  const [isAiLoading, startAiTransition] = useTransition();

  useEffect(() => {
    getReports().then((data: any) => {
        setReports(data.map((r: any) => ({
            ...r,
            matchDate: new Date(r.matchDate).toISOString(),
            stats: { pace: r.pace, shooting: r.shooting, passing: r.passing, dribbling: r.dribbling, defending: r.defending, physical: r.physical, diving: r.diving, handling: r.handling, kicking: r.kicking, reflexes: r.reflexes, gkPositioning: r.gkPositioning, gkSpeed: r.gkSpeed },
            customTags: r.customTags || [],
            imageUrl: r.imageUrl || null,
            // Assicuriamoci che i logs ci siano
            matchLogs: r.matchLogs || [] 
        })));
    });
  }, []);

  const playerA = reports.find(r => r.id === playerAId);
  const playerB = reports.find(r => r.id === playerBId);

  // AUTO-GENERAZIONE AI
  useEffect(() => {
      if (playerA && playerB) {
          startAiTransition(async () => {
              setAiVerdict(null);
              const result = await generateAiComparison(playerA, playerB);
              setAiVerdict(result);
          });
      } else {
          setAiVerdict(null);
      }
  }, [playerA, playerB]);

  const handleSwap = () => {
      setPlayerAId(playerBId);
      setPlayerBId(playerAId);
  };

  const handleShare = () => {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      alert("Link copiato!");
  };

  // --- FUNZIONE CALCOLO STATS STAGIONALI ---
  const calculateSeasonalStats = (logs: any[]) => {
    if (!logs || logs.length === 0) return { apps: 0, avgRating: 0, goals: 0, assists: 0, saves: 0, cleanSheets: 0 };
    
    return {
        apps: logs.length,
        avgRating: Number((logs.reduce((acc, log) => acc + log.rating, 0) / logs.length).toFixed(2)),
        goals: logs.reduce((acc, log) => acc + log.goals, 0),
        assists: logs.reduce((acc, log) => acc + log.assists, 0),
        saves: logs.reduce((acc, log) => acc + log.saves, 0),
        cleanSheets: logs.filter(log => log.cleanSheet).length,
    };
  };

  const statsA = playerA ? calculateSeasonalStats(playerA.matchLogs || []) : null;
  const statsB = playerB ? calculateSeasonalStats(playerB.matchLogs || []) : null;

  // Helper Stat Row
  const StatRow = ({ label, valA, valB, reverse = false, isFloat = false }: { label: string, valA: number, valB: number, reverse?: boolean, isFloat?: boolean }) => {
      const winA = reverse ? valA < valB : valA > valB;
      const winB = reverse ? valB < valA : valB > valA;
      const isDraw = valA === valB;
      const colorA = isDraw ? "text-slate-500 dark:text-slate-400" : (winA ? "text-emerald-600 dark:text-emerald-400 font-black" : "text-red-600 dark:text-red-500");
      const colorB = isDraw ? "text-slate-500 dark:text-slate-400" : (winB ? "text-emerald-600 dark:text-emerald-400 font-black" : "text-red-600 dark:text-red-500");

      return (
          <div className="flex items-center justify-between py-3 border-b dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors px-2">
              <div className={`text-lg w-16 text-center ${colorA}`}>{isFloat ? valA.toFixed(2) : valA}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest flex-1 text-center">{label}</div>
              <div className={`text-lg w-16 text-center ${colorB}`}>{isFloat ? valB.toFixed(2) : valB}</div>
          </div>
      );
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b dark:border-slate-800 pb-6">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    <GitCompare className="text-purple-600 dark:text-purple-400" size={32} />
                    Confronta Giocatori
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                    Analisi testa a testa tra due profili per supportare le decisioni.
                </p>
            </div>
            {playerA && playerB && (
                <Button variant="outline" onClick={handleShare} className="gap-2 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"><Share2 size={16}/> Condividi</Button>
            )}
        </div>

        {/* SELEZIONE */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* GIOCATORE A */}
            <div className="flex-1 w-full">
                <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-full">
                    <CardContent className="pt-6">
                        <label className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 block uppercase tracking-wide">Giocatore A</label>
                        <Select onValueChange={setPlayerAId} value={playerAId}>
                            <SelectTrigger className="w-full h-12 text-lg font-bold bg-white dark:bg-slate-950 dark:border-slate-700 dark:text-white"><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                            <SelectContent className="dark:bg-slate-900 dark:border-slate-800">{reports.map(r => <SelectItem key={r.id} value={r.id} className="cursor-pointer dark:text-slate-200">{r.playerName}</SelectItem>)}</SelectContent>
                        </Select>
                        {playerA && (
                            <div className="mt-6 flex flex-col items-center text-center animate-in zoom-in duration-300">
                                <div className="relative mb-4">
                                    <Avatar className="h-28 w-28 border-4 border-slate-100 dark:border-slate-800 shadow-xl"><AvatarImage src={playerA.imageUrl || ""} className="object-cover" /><AvatarFallback className="text-3xl font-black bg-slate-200 dark:bg-slate-800">{playerA.rating}</AvatarFallback></Avatar>
                                    <Badge className="absolute -bottom-2 -right-2 text-lg px-3 py-1 bg-purple-600 border-2 border-white dark:border-slate-900">{playerA.rating}</Badge>
                                </div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">{playerA.playerName}</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-1"><Shield size={14}/> {playerA.team}</p>
                                <div className="flex gap-2 mt-3"><Badge variant="outline" className="dark:border-slate-700">{playerA.playerAge} anni</Badge><Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">€{playerA.marketValue}M</Badge></div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* BOTTONE SWAP */}
            <Button variant="ghost" size="icon" onClick={handleSwap} className="shrink-0 rounded-full h-12 w-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:rotate-180 transition-transform duration-500"><ArrowRightLeft size={20} className="text-slate-500 dark:text-slate-400"/></Button>

            {/* GIOCATORE B */}
            <div className="flex-1 w-full">
                <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-full">
                    <CardContent className="pt-6">
                        <label className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 block uppercase tracking-wide">Giocatore B</label>
                        <Select onValueChange={setPlayerBId} value={playerBId}>
                            <SelectTrigger className="w-full h-12 text-lg font-bold bg-white dark:bg-slate-950 dark:border-slate-700 dark:text-white"><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                            <SelectContent className="dark:bg-slate-900 dark:border-slate-800">{reports.map(r => <SelectItem key={r.id} value={r.id} className="cursor-pointer dark:text-slate-200">{r.playerName}</SelectItem>)}</SelectContent>
                        </Select>
                        {playerB && (
                            <div className="mt-6 flex flex-col items-center text-center animate-in zoom-in duration-300">
                                <div className="relative mb-4">
                                    <Avatar className="h-28 w-28 border-4 border-slate-100 dark:border-slate-800 shadow-xl"><AvatarImage src={playerB.imageUrl || ""} className="object-cover" /><AvatarFallback className="text-3xl font-black bg-slate-200 dark:bg-slate-800">{playerB.rating}</AvatarFallback></Avatar>
                                    <Badge className="absolute -bottom-2 -right-2 text-lg px-3 py-1 bg-blue-600 border-2 border-white dark:border-slate-900">{playerB.rating}</Badge>
                                </div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">{playerB.playerName}</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-1"><Shield size={14}/> {playerB.team}</p>
                                <div className="flex gap-2 mt-3"><Badge variant="outline" className="dark:border-slate-700">{playerB.playerAge} anni</Badge><Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">€{playerB.marketValue}M</Badge></div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* CONFRONTO DATI */}
        {playerA && playerB && statsA && statsB && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-10 fade-in duration-500">
                <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 pb-4"><CardTitle className="text-lg flex items-center gap-2 dark:text-white"><Activity size={18}/> Confronto Tecnico</CardTitle></CardHeader>
                    <CardContent className="pt-6 relative h-[400px]">
                        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300"><div className="w-3 h-3 rounded-full bg-purple-500"></div> {playerA.playerName}</div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300"><div className="w-3 h-3 rounded-full bg-blue-500"></div> {playerB.playerName}</div>
                        </div>
                        <SkillsChart stats={playerA.stats} compareStats={playerB.stats} />
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 pb-4"><CardTitle className="text-lg flex items-center gap-2 dark:text-white"><Trophy size={18}/> Head to Head</CardTitle></CardHeader>
                    <CardContent className="pt-0">
                        <div className="mt-4">
                            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center mb-4">Profilo</div>
                            <StatRow label="Età" valA={playerA.playerAge} valB={playerB.playerAge} reverse />
                            <StatRow label="Altezza" valA={playerA.height} valB={playerB.height} />
                            <StatRow label="Peso" valA={playerA.weight} valB={playerB.weight} />
                            
                            {/* --- NUOVA SEZIONE: RENDIMENTO STAGIONALE DINAMICO --- */}
                            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center mt-6 mb-4 flex items-center justify-center gap-2"><CalendarDays size={14}/> Stagione Corrente</div>
                            <StatRow label="Presenze" valA={statsA.apps} valB={statsB.apps} />
                            <StatRow label="Media Voto" valA={statsA.avgRating} valB={statsB.avgRating} isFloat />
                            
                            {/* LOGICA RUOLI: Se Portiere mostra Parate, altrimenti Gol */}
                            {playerA.mainRole === "Portiere" || playerB.mainRole === "Portiere" ? (
                                <>
                                    <StatRow label="Parate" valA={statsA.saves} valB={statsB.saves} />
                                    <StatRow label="Clean Sheet" valA={statsA.cleanSheets} valB={statsB.cleanSheets} />
                                </>
                            ) : (
                                <>
                                    <StatRow label="Gol Totali" valA={statsA.goals} valB={statsB.goals} />
                                    <StatRow label="Assist Totali" valA={statsA.assists} valB={statsB.assists} />
                                </>
                            )}
                            
                            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center mt-6 mb-4">Economici</div>
                            <StatRow label="Valore (M)" valA={playerA.marketValue} valB={playerB.marketValue} reverse={false} />
                            <StatRow label="Ingaggio (M)" valA={playerA.salary} valB={playerB.salary} reverse={true} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}

        {/* --- SEZIONE AI VERDICT (IN FONDO) --- */}
        {isAiLoading && playerA && playerB && (
             <Card className="border-none shadow-xl bg-slate-100 dark:bg-slate-900 animate-pulse mt-8">
                <CardContent className="pt-6 flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="animate-spin text-purple-600" size={40} />
                    <p className="text-slate-500 font-medium animate-pulse">L'Intelligenza Artificiale sta analizzando i dati...</p>
                </CardContent>
             </Card>
        )}

        {!isAiLoading && aiVerdict && playerA && playerB && (
            <Card className={`border-none shadow-xl text-white animate-in slide-in-from-bottom-5 duration-700 overflow-hidden relative mt-8 ${
                aiVerdict.winnerId === null 
                ? "bg-slate-700 dark:bg-slate-800" 
                : "bg-gradient-to-br from-purple-500 to-indigo-600"
            }`}>
                <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <CardContent className="pt-6 relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            {aiVerdict.winnerId === null ? <AlertTriangle size={24} className="text-white"/> : <Bot size={24} className="text-white" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg uppercase tracking-wider text-purple-100 dark:text-slate-300">L'Opinione dello Scout AI</h3>
                            <p className="text-xs text-purple-200 dark:text-slate-400 font-medium">Analisi basata su dati oggettivi e potenziale</p>
                        </div>
                    </div>
                    
                    <div className="bg-black/20 backdrop-blur-md rounded-xl p-5 border border-white/10">
                        <h4 className="text-2xl font-black mb-2 flex items-center gap-2">
                            {aiVerdict.winnerId === null ? null : <Sparkles size={22} className="text-yellow-300 fill-yellow-300 animate-pulse"/>}
                            {aiVerdict.title}
                        </h4>
                        <p className="text-purple-50 dark:text-slate-200 text-lg leading-relaxed">{aiVerdict.reasoning}</p>
                    </div>

                    {aiVerdict.winnerId !== null && (
                        <div className="flex justify-between items-end mt-4 px-2">
                            <div className="text-center">
                                <div className="text-xs font-bold uppercase opacity-70 mb-1">{playerA.playerName}</div>
                                <div className="text-3xl font-black">{aiVerdict.scoreA}<span className="text-base opacity-60">/10</span></div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-bold uppercase opacity-70 mb-1">{playerB.playerName}</div>
                                <div className="text-3xl font-black">{aiVerdict.scoreB}<span className="text-base opacity-60">/10</span></div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}
    </div>
  );
}