"use client";

import { useState } from "react";
import ComparisonRadar from "@/components/ComparisonRadar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRightLeft, Trophy, Ruler, Weight, Footprints, Shield, Map } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompareInterfaceProps {
  reports: any[];
}

export default function CompareInterface({ reports }: CompareInterfaceProps) {
  const [id1, setId1] = useState<string>("");
  const [id2, setId2] = useState<string>("");

  const p1 = reports.find((r) => r.id === id1);
  const p2 = reports.find((r) => r.id === id2);

  // Helper per calcolare la differenza (es. +5, -2)
  const getDiff = (val1: number, val2: number) => {
    const diff = val1 - val2;
    if (diff > 0) return <span className="text-emerald-600 text-xs font-bold ml-1">(+{diff})</span>;
    if (diff < 0) return <span className="text-red-500 text-xs font-bold ml-1">({diff})</span>;
    return <span className="text-slate-400 text-xs ml-1">(=)</span>;
  };

  // Helper per renderizzare il campetto
  const renderMiniPitch = (zones: string[], color: "blue" | "pink") => {
    const allZones = Array.from({ length: 12 }, (_, i) => `zone_${i + 1}`);
    const activeClass = color === "blue" ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" : "bg-pink-600 shadow-[0_0_8px_rgba(219,39,119,0.6)]";
    const dotClass = color === "blue" ? "bg-blue-200" : "bg-pink-200";

    return (
        <div className="relative w-full max-w-[180px] mx-auto aspect-[2/3] bg-green-600/10 border-2 border-green-700/50 rounded-lg overflow-hidden">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-green-700/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-green-700/20 rounded-full" />
            <div className="grid grid-cols-3 grid-rows-4 h-full w-full relative z-10">
                {allZones.map((zone) => (
                    <div key={zone} className={`flex items-center justify-center border border-green-700/5 transition-colors ${zones.includes(zone) ? activeClass + "/20" : ""}`}>
                        {zones.includes(zone) && <div className={`w-3 h-3 rounded-full ${activeClass}`} />}
                    </div>
                ))}
            </div>
        </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* SELEZIONE GIOCATORI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-6 rounded-xl border shadow-sm sticky top-20 z-30">
        <div className="space-y-2">
            <label className="text-sm font-bold text-blue-600 flex items-center gap-2"><div className="w-2 h-2 bg-blue-600 rounded-full"/> Giocatore A</label>
            <Select onValueChange={setId1} value={id1}>
                <SelectTrigger className="w-full border-blue-200 focus:ring-blue-500"><SelectValue placeholder="Seleziona giocatore..." /></SelectTrigger>
                <SelectContent>
                    {reports.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.playerName} ({r.team})</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="hidden md:flex justify-center text-slate-300 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-slate-100 p-2 rounded-full border">
                 <ArrowRightLeft size={20} className="text-slate-500" />
            </div>
        </div>

        <div className="space-y-2">
             <label className="text-sm font-bold text-pink-600 flex items-center gap-2 justify-end">Giocatore B <div className="w-2 h-2 bg-pink-600 rounded-full"/></label>
            <Select onValueChange={setId2} value={id2}>
                <SelectTrigger className="w-full border-pink-200 focus:ring-pink-500 text-right"><SelectValue placeholder="Seleziona giocatore..." /></SelectTrigger>
                <SelectContent>
                    {reports.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.playerName} ({r.team})</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* CONFRONTO */}
      {p1 && p2 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLONNA SINISTRA: DATI FISICI */}
            <div className="lg:col-span-1 space-y-6">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="bg-slate-50/50 pb-4 border-b"><CardTitle className="text-sm uppercase text-slate-500 tracking-wider font-bold">Confronto Fisico</CardTitle></CardHeader>
                    <CardContent className="pt-4 space-y-5">
                        <div className="flex justify-between items-center text-sm border-b border-dashed pb-3">
                            <div className="text-blue-700 font-bold text-lg">{p1.playerAge}</div>
                            <div className="text-slate-400 font-medium flex flex-col items-center"><Trophy size={16} className="mb-1 text-slate-300"/> Età</div>
                            <div className="text-pink-700 font-bold text-lg">{p2.playerAge}</div>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-dashed pb-3">
                            <div className="text-blue-700 font-bold text-lg">{p1.height} {getDiff(p1.height, p2.height)}</div>
                            <div className="text-slate-400 font-medium flex flex-col items-center"><Ruler size={16} className="mb-1 text-slate-300"/> cm</div>
                            <div className="text-pink-700 font-bold text-lg">{p2.height} {getDiff(p2.height, p1.height)}</div>
                        </div>
                         <div className="flex justify-between items-center text-sm border-b border-dashed pb-3">
                            <div className="text-blue-700 font-bold text-lg">{p1.weight} {getDiff(p1.weight, p2.weight)}</div>
                            <div className="text-slate-400 font-medium flex flex-col items-center"><Weight size={16} className="mb-1 text-slate-300"/> kg</div>
                            <div className="text-pink-700 font-bold text-lg">{p2.weight} {getDiff(p2.weight, p1.weight)}</div>
                        </div>
                        <div className="flex justify-between items-center text-sm pb-1">
                            <div className="text-blue-700 font-bold">{p1.preferredFoot}</div>
                            <div className="text-slate-400 font-medium flex flex-col items-center"><Footprints size={16} className="mb-1 text-slate-300"/> Piede</div>
                            <div className="text-pink-700 font-bold">{p2.preferredFoot}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* --- HEATMAP COMPARISON (NUOVA) --- */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="bg-slate-50/50 pb-4 border-b">
                        <CardTitle className="text-sm uppercase text-slate-500 tracking-wider font-bold flex items-center gap-2">
                            <Map size={16}/> Confronto Tattico
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className="text-xs font-bold text-blue-600 mb-2 uppercase">{p1.playerName}</div>
                                {renderMiniPitch(p1.heatmapZones, "blue")}
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-bold text-pink-600 mb-2 uppercase">{p2.playerName}</div>
                                {renderMiniPitch(p2.heatmapZones, "pink")}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="bg-slate-50/50 pb-4 border-b"><CardTitle className="text-sm uppercase text-slate-500 tracking-wider font-bold">Rating Overall</CardTitle></CardHeader>
                    <CardContent className="pt-6 flex justify-between items-center">
                         <div className={`text-5xl font-black ${p1.rating >= p2.rating ? 'text-blue-600 scale-110 drop-shadow-sm' : 'text-slate-300 scale-90'} transition-all`}>
                            {p1.rating}
                         </div>
                         <div className="text-xs font-bold text-slate-300 bg-slate-100 rounded-full p-2">VS</div>
                         <div className={`text-5xl font-black ${p2.rating >= p1.rating ? 'text-pink-600 scale-110 drop-shadow-sm' : 'text-slate-300 scale-90'} transition-all`}>
                            {p2.rating}
                         </div>
                    </CardContent>
                </Card>
            </div>

            {/* COLONNA CENTRALE: GRAFICO */}
            <div className="lg:col-span-2">
                <Card className="h-full border-slate-200 shadow-sm">
                    <CardHeader className="bg-white border-b">
                        <CardTitle className="flex items-center gap-2 text-lg"><Shield size={20} className="text-slate-800"/> Analisi Comparativa</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {/* Radar */}
                        <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 mb-8">
                            <ComparisonRadar 
                                player1Name={p1.playerName}
                                player2Name={p2.playerName}
                                stats1={{ pace: p1.pace, shooting: p1.shooting, passing: p1.passing, dribbling: p1.dribbling, defending: p1.defending, physical: p1.physical }}
                                stats2={{ pace: p2.pace, shooting: p2.shooting, passing: p2.passing, dribbling: p2.dribbling, defending: p2.defending, physical: p2.physical }}
                            />
                        </div>

                        {/* TABELLA STATS DETTAGLIATA */}
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Dettaglio Parametri</h4>
                        <div className="grid grid-cols-6 gap-x-2 gap-y-4 text-center text-sm">
                             {/* Intestazioni */}
                             {["PAC", "SHO", "PAS", "DRI", "DEF", "PHY"].map(label => (
                                <div key={label} className="font-bold text-slate-400 text-xs bg-slate-50 py-1 rounded">{label}</div>
                             ))}
                             
                             {/* Valori P1 (Blu) */}
                             {[p1.pace, p1.shooting, p1.passing, p1.dribbling, p1.defending, p1.physical].map((val, i) => (
                                <div key={i} className={`font-bold border transition-colors ${val > [p2.pace, p2.shooting, p2.passing, p2.dribbling, p2.defending, p2.physical][i] ? "text-blue-700 bg-blue-50 border-blue-200 shadow-sm" : "text-slate-500 border-transparent"} rounded py-2`}>{val}</div>
                             ))}
                             
                             {/* Valori P2 (Rosa) */}
                             {[p2.pace, p2.shooting, p2.passing, p2.dribbling, p2.defending, p2.physical].map((val, i) => (
                                <div key={i} className={`font-bold border transition-colors ${val > [p1.pace, p1.shooting, p1.passing, p1.dribbling, p1.defending, p1.physical][i] ? "text-pink-700 bg-pink-50 border-pink-200 shadow-sm" : "text-slate-500 border-transparent"} rounded py-2`}>{val}</div>
                             ))}
                        </div>

                        {/* STATS MATCH */}
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 mt-8 border-b pb-2">Rendimento Stagionale (Media/Totale)</h4>
                        <div className="grid grid-cols-3 gap-4">
                             <div className="border rounded-lg p-3 text-center">
                                <div className="text-xs text-slate-400 uppercase">Gol</div>
                                <div className="flex justify-center gap-4 mt-1 font-bold">
                                    <span className={p1.goals > p2.goals ? "text-blue-600" : "text-slate-600"}>{p1.goals}</span>
                                    <span className="text-slate-300">|</span>
                                    <span className={p2.goals > p1.goals ? "text-pink-600" : "text-slate-600"}>{p2.goals}</span>
                                </div>
                             </div>
                             <div className="border rounded-lg p-3 text-center">
                                <div className="text-xs text-slate-400 uppercase">Assist</div>
                                <div className="flex justify-center gap-4 mt-1 font-bold">
                                    <span className={p1.assists > p2.assists ? "text-blue-600" : "text-slate-600"}>{p1.assists}</span>
                                    <span className="text-slate-300">|</span>
                                    <span className={p2.assists > p1.assists ? "text-pink-600" : "text-slate-600"}>{p2.assists}</span>
                                </div>
                             </div>
                             <div className="border rounded-lg p-3 text-center">
                                <div className="text-xs text-slate-400 uppercase">Minuti</div>
                                <div className="flex justify-center gap-4 mt-1 font-bold">
                                    <span className={p1.minutesPlayed > p2.minutesPlayed ? "text-blue-600" : "text-slate-600"}>{p1.minutesPlayed}</span>
                                    <span className="text-slate-300">|</span>
                                    <span className={p2.minutesPlayed > p1.minutesPlayed ? "text-pink-600" : "text-slate-600"}>{p2.minutesPlayed}</span>
                                </div>
                             </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
      ) : (
        // EMPTY STATE
        <div className="text-center py-24 bg-slate-50 border border-dashed rounded-xl">
             <div className="bg-white p-4 rounded-full inline-block shadow-sm mb-4"><ArrowRightLeft className="h-10 w-10 text-primary/50" /></div>
             <h3 className="text-xl font-bold text-slate-900">Modalità Confronto</h3>
             <p className="text-slate-500 max-w-sm mx-auto mt-2">Seleziona due giocatori dai menu in alto per analizzare differenze fisiche, tecniche e tattiche.</p>
        </div>
      )}
    </div>
  );
}