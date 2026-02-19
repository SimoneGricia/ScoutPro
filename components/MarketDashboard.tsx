"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Calculator, TrendingUp, TrendingDown, DollarSign, ArrowUpDown, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MarketDashboardProps {
  players: any[];
}

const SPECIFIC_ROLES = ["Portiere", "Difensore", "Centrocampista", "Attaccante"]; // Ruoli Macro per semplicità nel mercato

export default function MarketDashboard({ players }: MarketDashboardProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("valHigh"); // Default: Valore più alto
  const [roleFilter, setRoleFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // STATO SIMULATORE
  const [simPrice, setSimPrice] = useState<number>(0);
  const [simGrowth, setSimGrowth] = useState<number>(20); // Default 20%
  const [selectedPlayerName, setSelectedPlayerName] = useState("");

  // CALCOLI SIMULATORE
  const futureValue = simPrice + (simPrice * (simGrowth / 100));
  const profit = futureValue - simPrice;

  // 1. FILTRO
  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.playerName.toLowerCase().includes(search.toLowerCase()) || p.team.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || p.role === roleFilter || (p.role === "Difensore centrale" || p.role === "Terzino" ? roleFilter === "Difensore" : false); // Logica base
    return matchesSearch && matchesRole;
  });

  // 2. ORDINAMENTO
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
      switch (sortBy) {
          case "valHigh": return b.marketValue - a.marketValue;
          case "valLow": return a.marketValue - b.marketValue;
          case "ageYoung": return a.age - b.age;
          case "rating": return b.rating - a.rating;
          default: return 0;
      }
  });

  // Helper per selezionare giocatore nel simulatore
  const loadIntoSimulator = (player: any) => {
      setSimPrice(player.marketValue);
      setSelectedPlayerName(player.playerName);
  };

  const formatMoneyShort = (val: number) => {
      return val > 0 ? `€${val}M` : "-";
  };

  const formatMoney = (val: number) => {
      return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 1 }).format(val * 1000000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* COLONNA SX: TABELLA GIOCATORI */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* TOOLBAR */}
        <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-x-0 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Cerca per nome, squadra..." 
                    className="pl-9 bg-white" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            <div className="flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 bg-white cursor-pointer">
                            <ArrowUpDown size={16} /> <span className="hidden sm:inline">Ordina</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ordina per</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                            <DropdownMenuRadioItem value="valHigh" className="cursor-pointer">Valore (Alto-Basso)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="valLow" className="cursor-pointer">Valore (Basso-Alto)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="rating" className="cursor-pointer">Overall</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="ageYoung" className="cursor-pointer">Età (Più Giovani)</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button variant={showFilters ? "secondary" : "outline"} onClick={() => setShowFilters(!showFilters)} className="gap-2 bg-white cursor-pointer">
                    <SlidersHorizontal size={16} /> <span className="hidden sm:inline">Filtra</span>
                </Button>
            </div>
        </div>

        {/* FILTRI ESPANDIBILI */}
        {showFilters && (
            <div className="bg-slate-50 p-4 rounded-lg border flex gap-4 items-end animate-in slide-in-from-top-2">
                <div className="space-y-2 w-full sm:w-64">
                    <label className="text-xs font-bold uppercase text-slate-500">Ruolo</label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="bg-white cursor-pointer"><SelectValue placeholder="Tutti" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="cursor-pointer">Tutti i ruoli</SelectItem>
                            {SPECIFIC_ROLES.map(r => <SelectItem key={r} value={r} className="cursor-pointer">{r}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                {roleFilter !== "all" && (
                    <Button variant="ghost" size="icon" onClick={() => setRoleFilter("all")} className="text-red-500 hover:bg-red-50 cursor-pointer">
                        <X size={18} />
                    </Button>
                )}
            </div>
        )}

        <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead>Giocatore</TableHead>
                        <TableHead>Valore</TableHead>
                        <TableHead>Stipendio</TableHead>
                        <TableHead>Scadenza</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedPlayers.map((player) => (
                        <TableRow key={player.id} className="cursor-pointer hover:bg-slate-50" onClick={() => loadIntoSimulator(player)}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        {player.imageUrl && <AvatarImage src={player.imageUrl} className="object-cover"/>}
                                        <AvatarFallback>{player.rating}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold text-sm text-slate-900">{player.playerName}</div>
                                        <div className="text-xs text-slate-500">{player.team} • {player.age} anni</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="font-bold text-emerald-700">{formatMoneyShort(player.marketValue)}</TableCell>
                            <TableCell className="text-slate-600">{formatMoneyShort(player.salary)}</TableCell>
                            <TableCell>
                                {player.contractExpiry ? (
                                    <Badge variant="outline" className={
                                        new Date(player.contractExpiry) < new Date('2025-06-30') ? "border-red-200 text-red-600 bg-red-50" : "border-slate-200 text-slate-600"
                                    }>
                                        {new Date(player.contractExpiry).getFullYear()}
                                    </Badge>
                                ) : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link href={`/report/${player.id}`} onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs cursor-pointer">Vedi</Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </div>

      {/* COLONNA DX: SIMULATORE */}
      <div className="space-y-6">
        <Card className="border-indigo-100 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
                <Calculator size={100} className="text-indigo-600" />
            </div>
            
            <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 pb-4">
                <CardTitle className="text-indigo-800 flex items-center gap-2">
                    <TrendingUp size={20}/> Simulatore ROI
                </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6">
                
                {selectedPlayerName ? (
                    <div className="text-sm font-medium text-slate-500 text-center bg-slate-50 p-2 rounded border border-slate-100">
                        Analisi per: <span className="font-bold text-slate-900">{selectedPlayerName}</span>
                    </div>
                ) : (
                    <div className="text-sm text-slate-400 text-center italic p-2">Clicca su un giocatore in lista per caricarlo.</div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Prezzo Acquisto (Mln €)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input 
                                type="number" 
                                className="pl-9 font-bold text-lg" 
                                value={simPrice} 
                                onChange={(e) => setSimPrice(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Crescita Stimata (%)</label>
                        <div className="flex items-center gap-4">
                            <Input 
                                type="number" 
                                className="font-bold text-lg" 
                                value={simGrowth} 
                                onChange={(e) => setSimGrowth(Number(e.target.value))}
                            />
                            {simGrowth >= 0 ? <TrendingUp className="text-emerald-500"/> : <TrendingDown className="text-red-500"/>}
                        </div>
                        <input 
                            type="range" min="-50" max="200" 
                            value={simGrowth} 
                            onChange={(e) => setSimGrowth(Number(e.target.value))}
                            className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                <div className="bg-slate-900 text-white rounded-xl p-6 space-y-4 shadow-xl">
                    <div className="flex justify-between items-end border-b border-slate-700 pb-4">
                        <span className="text-sm text-slate-400">Valore Futuro</span>
                        <span className="text-2xl font-black text-emerald-400">
                            {formatMoney(futureValue / 1000000)}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Plusvalenza Potenziale</span>
                        <Badge variant="outline" className={`text-lg px-3 py-1 ${profit >= 0 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-red-500/20 text-red-300 border-red-500/50'}`}>
                            {profit > 0 ? "+" : ""}{formatMoney(profit / 1000000)}
                        </Badge>
                    </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center leading-tight">
                    * Simulazione basata su stime di crescita. Non costituisce garanzia finanziaria.
                </p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}