"use client";

import { useState, useTransition } from "react";
import { ScoutReport } from "@/types";
import { saveLineup, deleteSavedLineup } from "@/lib/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCcw, Shirt, Settings2, Banknote, Save, Trash2, Calendar } from "lucide-react";
import Image from "next/image";

interface LineupBuilderProps {
  reports: ScoutReport[];
  savedLineups: any[];
}

// --- CONFIGURAZIONE MODULI TATTICI COMPLETA ---
const FORMATIONS: Record<string, { label: string; positions: { id: string; role: string; label: string; top: string; left: string }[] }> = {
  // --- DIFESA A 4 ---
  "4-3-3": {
    label: "4-3-3 Classico",
    positions: [
        { id: "GK", role: "Portiere", label: "POR", top: "88%", left: "50%" },
        { id: "LB", role: "Difensore", label: "TS", top: "75%", left: "15%" }, { id: "CB1", role: "Difensore", label: "DC", top: "78%", left: "38%" }, { id: "CB2", role: "Difensore", label: "DC", top: "78%", left: "62%" }, { id: "RB", role: "Difensore", label: "TD", top: "75%", left: "85%" },
        { id: "CM1", role: "Centrocampista", label: "CC", top: "55%", left: "30%" }, { id: "CM2", role: "Centrocampista", label: "MED", top: "60%", left: "50%" }, { id: "CM3", role: "Centrocampista", label: "CC", top: "55%", left: "70%" },
        { id: "LW", role: "Attaccante", label: "AS", top: "25%", left: "20%" }, { id: "ST", role: "Attaccante", label: "ATT", top: "18%", left: "50%" }, { id: "RW", role: "Attaccante", label: "AD", top: "25%", left: "80%" }
    ]
  },
  "4-3-3-CAM": {
    label: "4-3-3 (Con Trequartista)",
    positions: [
        { id: "GK", role: "Portiere", label: "POR", top: "88%", left: "50%" },
        { id: "LB", role: "Difensore", label: "TS", top: "75%", left: "15%" }, { id: "CB1", role: "Difensore", label: "DC", top: "78%", left: "38%" }, { id: "CB2", role: "Difensore", label: "DC", top: "78%", left: "62%" }, { id: "RB", role: "Difensore", label: "TD", top: "75%", left: "85%" },
        { id: "CM1", role: "Centrocampista", label: "CC", top: "60%", left: "35%" }, { id: "CM2", role: "Centrocampista", label: "CC", top: "60%", left: "65%" },
        { id: "CAM", role: "Centrocampista", label: "TRQ", top: "40%", left: "50%" },
        { id: "LW", role: "Attaccante", label: "AS", top: "25%", left: "20%" }, { id: "ST", role: "Attaccante", label: "ATT", top: "18%", left: "50%" }, { id: "RW", role: "Attaccante", label: "AD", top: "25%", left: "80%" }
    ]
  },
  "4-4-2": {
    label: "4-4-2 Classico",
    positions: [
        { id: "GK", role: "Portiere", label: "POR", top: "88%", left: "50%" },
        { id: "LB", role: "Difensore", label: "TS", top: "75%", left: "15%" }, { id: "CB1", role: "Difensore", label: "DC", top: "78%", left: "38%" }, { id: "CB2", role: "Difensore", label: "DC", top: "78%", left: "62%" }, { id: "RB", role: "Difensore", label: "TD", top: "75%", left: "85%" },
        { id: "LM", role: "Centrocampista", label: "ES", top: "50%", left: "15%" }, { id: "CM1", role: "Centrocampista", label: "CC", top: "55%", left: "40%" }, { id: "CM2", role: "Centrocampista", label: "CC", top: "55%", left: "60%" }, { id: "RM", role: "Centrocampista", label: "ED", top: "50%", left: "85%" },
        { id: "ST1", role: "Attaccante", label: "ATT", top: "20%", left: "35%" }, { id: "ST2", role: "Attaccante", label: "ATT", top: "20%", left: "65%" }
    ]
  },
  "4-2-3-1": {
    label: "4-2-3-1",
    positions: [
        { id: "GK", role: "Portiere", label: "POR", top: "88%", left: "50%" },
        { id: "LB", role: "Difensore", label: "TS", top: "75%", left: "15%" }, { id: "CB1", role: "Difensore", label: "DC", top: "78%", left: "38%" }, { id: "CB2", role: "Difensore", label: "DC", top: "78%", left: "62%" }, { id: "RB", role: "Difensore", label: "TD", top: "75%", left: "85%" },
        { id: "CDM1", role: "Centrocampista", label: "MED", top: "62%", left: "35%" }, { id: "CDM2", role: "Centrocampista", label: "MED", top: "62%", left: "65%" },
        { id: "LAM", role: "Centrocampista", label: "TRQ", top: "40%", left: "20%" }, { id: "CAM", role: "Centrocampista", label: "TRQ", top: "40%", left: "50%" }, { id: "RAM", role: "Centrocampista", label: "TRQ", top: "40%", left: "80%" },
        { id: "ST", role: "Attaccante", label: "ATT", top: "15%", left: "50%" }
    ]
  },
  "4-3-1-2": {
    label: "4-3-1-2 (Rombo)",
    positions: [
        { id: "GK", role: "Portiere", label: "POR", top: "88%", left: "50%" },
        { id: "LB", role: "Difensore", label: "TS", top: "75%", left: "15%" }, { id: "CB1", role: "Difensore", label: "DC", top: "78%", left: "38%" }, { id: "CB2", role: "Difensore", label: "DC", top: "78%", left: "62%" }, { id: "RB", role: "Difensore", label: "TD", top: "75%", left: "85%" },
        { id: "CM1", role: "Centrocampista", label: "CC", top: "58%", left: "25%" }, { id: "CDM", role: "Centrocampista", label: "MED", top: "65%", left: "50%" }, { id: "CM2", role: "Centrocampista", label: "CC", top: "58%", left: "75%" },
        { id: "CAM", role: "Centrocampista", label: "TRQ", top: "40%", left: "50%" },
        { id: "ST1", role: "Attaccante", label: "ATT", top: "20%", left: "35%" }, { id: "ST2", role: "Attaccante", label: "ATT", top: "20%", left: "65%" }
    ]
  },
  "4-3-2-1": {
    label: "4-3-2-1 (Albero di Natale)",
    positions: [
        { id: "GK", role: "Portiere", label: "POR", top: "88%", left: "50%" },
        { id: "LB", role: "Difensore", label: "TS", top: "75%", left: "15%" }, { id: "CB1", role: "Difensore", label: "DC", top: "78%", left: "38%" }, { id: "CB2", role: "Difensore", label: "DC", top: "78%", left: "62%" }, { id: "RB", role: "Difensore", label: "TD", top: "75%", left: "85%" },
        { id: "CM1", role: "Centrocampista", label: "CC", top: "60%", left: "30%" }, { id: "CM2", role: "Centrocampista", label: "CC", top: "60%", left: "50%" }, { id: "CM3", role: "Centrocampista", label: "CC", top: "60%", left: "70%" },
        { id: "CAM1", role: "Centrocampista", label: "TRQ", top: "40%", left: "35%" }, { id: "CAM2", role: "Centrocampista", label: "TRQ", top: "40%", left: "65%" },
        { id: "ST", role: "Attaccante", label: "ATT", top: "18%", left: "50%" }
    ]
  },
  
  // --- DIFESA A 3 ---
  "3-5-2": {
    label: "3-5-2",
    positions: [
        { id: "GK", role: "Portiere", label: "POR", top: "88%", left: "50%" },
        { id: "CB1", role: "Difensore", label: "DC", top: "75%", left: "25%" }, { id: "CB2", role: "Difensore", label: "DC", top: "78%", left: "50%" }, { id: "CB3", role: "Difensore", label: "DC", top: "75%", left: "75%" },
        { id: "LWB", role: "Centrocampista", label: "ES", top: "50%", left: "10%" }, { id: "CM1", role: "Centrocampista", label: "CC", top: "60%", left: "35%" }, { id: "CM2", role: "Centrocampista", label: "MED", top: "65%", left: "50%" }, { id: "CM3", role: "Centrocampista", label: "CC", top: "60%", left: "65%" }, { id: "RWB", role: "Centrocampista", label: "ED", top: "50%", left: "90%" },
        { id: "ST1", role: "Attaccante", label: "ATT", top: "20%", left: "35%" }, { id: "ST2", role: "Attaccante", label: "ATT", top: "20%", left: "65%" }
    ]
  },
  "3-4-3": {
    label: "3-4-3",
    positions: [
        { id: "GK", role: "Portiere", label: "POR", top: "88%", left: "50%" },
        { id: "CB1", role: "Difensore", label: "DC", top: "75%", left: "25%" }, { id: "CB2", role: "Difensore", label: "DC", top: "78%", left: "50%" }, { id: "CB3", role: "Difensore", label: "DC", top: "75%", left: "75%" },
        { id: "LM", role: "Centrocampista", label: "ES", top: "50%", left: "15%" }, { id: "CM1", role: "Centrocampista", label: "CC", top: "60%", left: "40%" }, { id: "CM2", role: "Centrocampista", label: "CC", top: "60%", left: "60%" }, { id: "RM", role: "Centrocampista", label: "ED", top: "50%", left: "85%" },
        { id: "LW", role: "Attaccante", label: "AS", top: "25%", left: "20%" }, { id: "ST", role: "Attaccante", label: "ATT", top: "18%", left: "50%" }, { id: "RW", role: "Attaccante", label: "AD", top: "25%", left: "80%" }
    ]
  },
  "3-4-1-2": {
    label: "3-4-1-2",
    positions: [
        { id: "GK", role: "Portiere", label: "POR", top: "88%", left: "50%" },
        { id: "CB1", role: "Difensore", label: "DC", top: "75%", left: "25%" }, { id: "CB2", role: "Difensore", label: "DC", top: "78%", left: "50%" }, { id: "CB3", role: "Difensore", label: "DC", top: "75%", left: "75%" },
        { id: "LM", role: "Centrocampista", label: "ES", top: "50%", left: "15%" }, { id: "CM1", role: "Centrocampista", label: "CC", top: "60%", left: "40%" }, { id: "CM2", role: "Centrocampista", label: "CC", top: "60%", left: "60%" }, { id: "RM", role: "Centrocampista", label: "ED", top: "50%", left: "85%" },
        { id: "CAM", role: "Centrocampista", label: "TRQ", top: "35%", left: "50%" },
        { id: "ST1", role: "Attaccante", label: "ATT", top: "18%", left: "35%" }, { id: "ST2", role: "Attaccante", label: "ATT", top: "18%", left: "65%" }
    ]
  },
  "3-4-2-1": {
    label: "3-4-2-1",
    positions: [
        { id: "GK", role: "Portiere", label: "POR", top: "88%", left: "50%" },
        { id: "CB1", role: "Difensore", label: "DC", top: "75%", left: "25%" }, { id: "CB2", role: "Difensore", label: "DC", top: "78%", left: "50%" }, { id: "CB3", role: "Difensore", label: "DC", top: "75%", left: "75%" },
        { id: "LM", role: "Centrocampista", label: "ES", top: "50%", left: "15%" }, { id: "CM1", role: "Centrocampista", label: "CC", top: "60%", left: "40%" }, { id: "CM2", role: "Centrocampista", label: "CC", top: "60%", left: "60%" }, { id: "RM", role: "Centrocampista", label: "ED", top: "50%", left: "85%" },
        { id: "CAM1", role: "Centrocampista", label: "TRQ", top: "35%", left: "35%" }, { id: "CAM2", role: "Centrocampista", label: "TRQ", top: "35%", left: "65%" },
        { id: "ST", role: "Attaccante", label: "ATT", top: "18%", left: "50%" }
    ]
  },

  // --- DIFESA A 5 ---
  "5-3-2": {
    label: "5-3-2",
    positions: [
        { id: "GK", role: "Portiere", label: "POR", top: "88%", left: "50%" },
        { id: "LWB", role: "Difensore", label: "TS", top: "70%", left: "10%" }, { id: "CB1", role: "Difensore", label: "DC", top: "75%", left: "30%" }, { id: "CB2", role: "Difensore", label: "DC", top: "78%", left: "50%" }, { id: "CB3", role: "Difensore", label: "DC", top: "75%", left: "70%" }, { id: "RWB", role: "Difensore", label: "TD", top: "70%", left: "90%" },
        { id: "CM1", role: "Centrocampista", label: "CC", top: "55%", left: "30%" }, { id: "CM2", role: "Centrocampista", label: "CC", top: "55%", left: "50%" }, { id: "CM3", role: "Centrocampista", label: "CC", top: "55%", left: "70%" },
        { id: "ST1", role: "Attaccante", label: "ATT", top: "20%", left: "35%" }, { id: "ST2", role: "Attaccante", label: "ATT", top: "20%", left: "65%" }
    ]
  },
  "5-4-1": {
    label: "5-4-1",
    positions: [
        { id: "GK", role: "Portiere", label: "POR", top: "88%", left: "50%" },
        { id: "LWB", role: "Difensore", label: "TS", top: "70%", left: "10%" }, { id: "CB1", role: "Difensore", label: "DC", top: "75%", left: "30%" }, { id: "CB2", role: "Difensore", label: "DC", top: "78%", left: "50%" }, { id: "CB3", role: "Difensore", label: "DC", top: "75%", left: "70%" }, { id: "RWB", role: "Difensore", label: "TD", top: "70%", left: "90%" },
        { id: "LM", role: "Centrocampista", label: "ES", top: "50%", left: "20%" }, { id: "CM1", role: "Centrocampista", label: "CC", top: "55%", left: "40%" }, { id: "CM2", role: "Centrocampista", label: "CC", top: "55%", left: "60%" }, { id: "RM", role: "Centrocampista", label: "ED", top: "50%", left: "80%" },
        { id: "ST", role: "Attaccante", label: "ATT", top: "20%", left: "50%" }
    ]
  }
};

export default function LineupBuilder({ reports, savedLineups }: LineupBuilderProps) {
  const [formation, setFormation] = useState("4-3-3");
  const [lineup, setLineup] = useState<Record<string, ScoutReport | null>>({});
  const [lineupName, setLineupName] = useState("");
  const [isPending, startTransition] = useTransition();

  const currentModule = FORMATIONS[formation] || FORMATIONS["4-3-3"];

  const handleSelect = (posId: string, player: ScoutReport) => {
    const isAlreadySelected = Object.entries(lineup).some(([key, p]) => p?.id === player.id && key !== posId);
    if (isAlreadySelected) { alert(`${player.playerName} è già in campo!`); return; }
    setLineup((prev) => ({ ...prev, [posId]: player }));
  };

  const handleRemove = (posId: string) => { setLineup((prev) => { const newState = { ...prev }; delete newState[posId]; return newState; }); };
  
  // --- FUNZIONE SVUOTA CAMPO ---
  const handleClear = () => {
      if (Object.keys(lineup).length === 0) return;
      if (confirm("Sei sicuro di voler rimuovere tutti i giocatori dal campo?")) {
          setLineup({});
      }
  };

  const handleSave = () => { if (!lineupName.trim()) { alert("Inserisci un nome!"); return; } startTransition(async () => { await saveLineup(lineupName, formation, lineup); setLineupName(""); alert("Salvata!"); }); };
  const handleDelete = (id: string, e: React.MouseEvent) => { e.stopPropagation(); if (confirm("Eliminare?")) { startTransition(async () => { await deleteSavedLineup(id); }); } };
  const handleLoad = (savedLineup: any) => { if (Object.keys(lineup).length > 0 && !confirm("Caricare questa? Modifiche perse.")) return; setFormation(savedLineup.module); setLineup(savedLineup.lineup); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const selectedPlayers = Object.values(lineup).filter(Boolean) as ScoutReport[];
  const totalRating = selectedPlayers.reduce((acc, p) => acc + p.rating, 0);
  const avgRating = selectedPlayers.length > 0 ? Math.round(totalRating / selectedPlayers.length) : 0;
  const totalValue = selectedPlayers.reduce((acc, p) => acc + (p.marketValue || 0), 0);
  const getFilteredPlayers = (role: string) => reports.filter(r => r.mainRole === role || r.specificRoles.some(sr => sr.includes(role)));

  return (
    <div className="space-y-12">
        <div className="flex flex-col lg:flex-row gap-8">
        
        {/* CAMPO DA CALCIO */}
        <div className="flex-1 relative w-full aspect-[3/4] md:aspect-[4/3] lg:aspect-[16/11] bg-emerald-600 dark:bg-emerald-800/80 rounded-xl overflow-hidden shadow-2xl border-4 border-emerald-800 dark:border-emerald-900">
            
            {/* PULSANTE SVUOTA CAMPO (Alto a Destra) */}
            {Object.keys(lineup).length > 0 && (
                <div className="absolute top-4 right-4 z-20">
                    <Button 
                        onClick={handleClear} 
                        variant="destructive" 
                        size="icon" 
                        className="rounded-full shadow-lg border-2 border-white/20 hover:scale-110 transition-transform bg-red-600 hover:bg-red-700"
                        title="Svuota Formazione"
                    >
                        <Trash2 size={20} />
                    </Button>
                </div>
            )}

            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 49px, #000 50px)" }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/50 rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/50 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 border-x-2 border-b-2 border-white/50 rounded-b-lg pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 border-x-2 border-t-2 border-white/50 rounded-t-lg pointer-events-none" />

            {currentModule.positions.map((pos) => {
                const player = lineup[pos.id];
                return (
                    <div key={pos.id} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all hover:scale-105 z-10" style={{ top: pos.top, left: pos.left }}>
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="relative group cursor-pointer">
                                    {player ? (
                                        <div className="flex flex-col items-center">
                                            <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-full border-2 border-white shadow-lg overflow-hidden bg-slate-100">
                                                {player.imageUrl ? ( <Image src={player.imageUrl} alt={player.playerName} fill className="object-cover" /> ) : ( <div className="h-full w-full flex items-center justify-center bg-emerald-800 text-white font-bold">{player.rating}</div> )}
                                            </div>
                                            <div className="mt-1 bg-slate-900/90 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded shadow-sm max-w-[80px] truncate text-center backdrop-blur-sm">{player.playerName}</div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity">
                                            <div className="h-12 w-12 md:h-14 md:w-14 rounded-full border-2 border-dashed border-white/60 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:border-white transition-all"><Shirt size={20} /></div>
                                            <div className="mt-1 bg-black/40 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{pos.label}</div>
                                        </div>
                                    )}
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
                                <DialogHeader><DialogTitle className="dark:text-white">Seleziona {pos.role}</DialogTitle></DialogHeader>
                                <div className="space-y-2 mt-2">
                                    {player && <Button variant="destructive" className="w-full mb-2 cursor-pointer" onClick={() => handleRemove(pos.id)}><RefreshCcw className="mr-2 h-4 w-4" /> Rimuovi</Button>}
                                    {getFilteredPlayers(pos.role).map((p) => (
                                        <div key={p.id} onClick={() => handleSelect(pos.id, p)} className={`flex items-center justify-between p-3 rounded-lg border dark:border-slate-700 cursor-pointer transition-colors ${ Object.values(lineup).some(sel => sel?.id === p.id && pos.id !== p.id) ? 'opacity-50 bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800' }`}>
                                            <div className="flex items-center gap-3">
                                                <Avatar><AvatarImage src={p.imageUrl || ""} className="object-cover" /><AvatarFallback>{p.rating}</AvatarFallback></Avatar>
                                                <div><div className="font-bold text-sm dark:text-slate-100">{p.playerName}</div><div className="text-xs text-slate-500 dark:text-slate-400">{p.team}</div></div>
                                            </div>
                                            <div className="text-right"><Badge variant="outline" className={`${p.rating >= 80 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' : 'text-slate-600 dark:text-slate-400'}`}>{p.rating} OVR</Badge></div>
                                        </div>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                );
            })}
        </div>

        {/* SIDEBAR */}
        <div className="w-full lg:w-80 space-y-6">
            <Card className="dark:bg-slate-900 dark:border-slate-800">
                <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><Settings2 size={16} /> Modulo Tattico</label>
                        <Select value={formation} onValueChange={(val) => { setFormation(val); setLineup({}); }}>
                            <SelectTrigger className="w-full bg-white dark:bg-slate-950 dark:border-slate-700 font-bold cursor-pointer"><SelectValue placeholder="Seleziona Modulo" /></SelectTrigger>
                            <SelectContent className="max-h-80">
                                <SelectGroup>
                                    <SelectLabel>Difesa a 4</SelectLabel>
                                    <SelectItem value="4-3-3">4-3-3 Classico</SelectItem>
                                    <SelectItem value="4-3-3-CAM">4-3-3 (Trequartista)</SelectItem>
                                    <SelectItem value="4-4-2">4-4-2 Classico</SelectItem>
                                    <SelectItem value="4-3-1-2">4-3-1-2 (Rombo)</SelectItem>
                                    <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                                    <SelectItem value="4-3-2-1">4-3-2-1 (Albero Natale)</SelectItem>
                                </SelectGroup>
                                <SelectGroup>
                                    <SelectLabel>Difesa a 3</SelectLabel>
                                    <SelectItem value="3-5-2">3-5-2</SelectItem>
                                    <SelectItem value="3-4-3">3-4-3</SelectItem>
                                    <SelectItem value="3-4-1-2">3-4-1-2</SelectItem>
                                    <SelectItem value="3-4-2-1">3-4-2-1</SelectItem>
                                </SelectGroup>
                                <SelectGroup>
                                    <SelectLabel>Difesa a 5</SelectLabel>
                                    <SelectItem value="5-3-2">5-3-2</SelectItem>
                                    <SelectItem value="5-4-1">5-4-1</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4 pt-4 border-t dark:border-slate-800">
                        <div className="text-center"><h2 className="text-2xl font-black text-slate-900 dark:text-white">{currentModule.label}</h2></div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border dark:border-slate-700"><span className="text-sm font-medium text-slate-600 dark:text-slate-300">Overall Medio</span><span className={`text-xl font-bold ${avgRating >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>{avgRating}</span></div>
                        <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-900"><span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1"><Banknote size={14}/> Valore 11</span><span className="text-xl font-black text-emerald-800 dark:text-emerald-300">€{totalValue.toFixed(1)}M</span></div>
                    </div>

                    {/* SALVA FORMAZIONE */}
                    <div className="pt-4 border-t dark:border-slate-800 space-y-3">
                        <Input placeholder="Nome formazione (es. Titolari)" value={lineupName} onChange={(e) => setLineupName(e.target.value)} className="bg-white dark:bg-slate-950 dark:border-slate-700" />
                        <Button onClick={handleSave} disabled={isPending || selectedPlayers.length === 0} className="w-full bg-white text-emerald-700 border-2 border-emerald-600 hover:bg-emerald-50 dark:bg-slate-800 dark:text-emerald-400 dark:border-emerald-500 dark:hover:bg-slate-700 font-bold cursor-pointer shadow-sm"><Save size={16} className="mr-2"/> Salva Formazione</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
        </div>

        {/* LISTA SALVATI */}
        {savedLineups.length > 0 && (
            <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Save className="text-primary" /> Formazioni Salvate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedLineups.map((saved) => {
                        const playersList = Object.values(saved.lineup).filter(Boolean) as ScoutReport[];
                        const savedTotalVal = playersList.reduce((acc, p) => acc + (p.marketValue || 0), 0);
                        const savedAvgRating = playersList.length > 0 ? Math.round(playersList.reduce((acc, p) => acc + p.rating, 0) / playersList.length) : 0;

                        return (
                            <Card key={saved.id} onClick={() => handleLoad(saved)} className="border-slate-200 dark:border-slate-800 dark:bg-slate-900 hover:shadow-lg transition-all cursor-pointer group hover:border-emerald-400 dark:hover:border-emerald-500">
                                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 pb-3 group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-950/20 transition-colors">
                                    <div className="flex justify-between items-center"><div><CardTitle className="text-lg font-bold group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors dark:text-white">{saved.name}</CardTitle><p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase mt-1">{saved.module}</p></div><Badge variant="outline" className="bg-white dark:bg-slate-800 dark:text-slate-300 group-hover:border-emerald-200">{playersList.length} / 11</Badge></div>
                                </CardHeader>
                                <CardContent className="pt-4 grid grid-cols-2 gap-4">
                                    <div className="text-center"><div className="text-xs text-slate-400 uppercase font-bold mb-1">Media OVR</div><div className="text-2xl font-black text-slate-800 dark:text-slate-100">{savedAvgRating}</div></div>
                                    <div className="text-center"><div className="text-xs text-slate-400 uppercase font-bold mb-1">Valore</div><div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">€{savedTotalVal.toFixed(0)}M</div></div>
                                    <div className="col-span-2 mt-2"><div className="flex -space-x-2 overflow-hidden justify-center py-2">{playersList.slice(0, 5).map((p) => ( <Avatar key={p.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800"><AvatarImage src={p.imageUrl || ""} className="object-cover" /><AvatarFallback className="text-[10px] bg-slate-200">{p.rating}</AvatarFallback></Avatar> ))}</div></div>
                                </CardContent>
                                <CardFooter className="bg-slate-50/50 dark:bg-slate-800/30 border-t dark:border-slate-800 pt-3 pb-3 flex justify-between items-center text-xs text-slate-400 group-hover:bg-emerald-50/30 dark:group-hover:bg-emerald-950/10 transition-colors">
                                    <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(saved.createdAt).toLocaleDateString()}</span>
                                    <Button variant="ghost" size="sm" onClick={(e) => handleDelete(saved.id, e)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 px-2 cursor-pointer z-10"><Trash2 size={16} /></Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
        )}
    </div>
  );
}