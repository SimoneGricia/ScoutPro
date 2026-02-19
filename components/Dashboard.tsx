"use client";

import { useState } from "react";
import ReportCard from "@/components/ReportCard";
import ExcelImport from "@/components/ExcelImport";
import { PlusCircle, Search, LayoutGrid, List as ListIcon, X, SlidersHorizontal, ArrowUpDown, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ScoutReport } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardProps {
  initialReports: any[];
}

const SPECIFIC_ROLES = [
  "Portiere", "Terzino", "Difensore centrale", "Mediano", "Regista", "Esterno", 
  "Mezz'Ala", "Trequartista", "Ala", "Centravanti", "Seconda punta", "Falso nove"
];

const SCOUT_TAGS = [
  "U21", "HighPotential", "LowCost", "FreeAgent", "Scadenza2025", 
  "EU", "Non-EU", "Homegrown", "Leader", "Capitano", 
  "InfortunioFacile", "Utilità", "Prestito", "TopPlayer", 
  "Sottovalutato", "Rivendibile", "InstantImpact"
].sort();

export default function Dashboard({ initialReports }: DashboardProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date"); 

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [minAge, setMinAge] = useState<number | "">("");
  const [maxAge, setMaxAge] = useState<number | "">("");
  const [minRating, setMinRating] = useState<number | "">("");
  const [maxRating, setMaxRating] = useState<number | "">("");

  const reports: ScoutReport[] = initialReports.map((r) => ({
    ...r,
    matchDate: new Date(r.matchDate).toISOString(),
    stats: {
        pace: r.pace,
        shooting: r.shooting,
        passing: r.passing,
        dribbling: r.dribbling,
        defending: r.defending,
        physical: r.physical,
        // GK
        diving: r.diving, handling: r.handling, kicking: r.kicking, 
        reflexes: r.reflexes, gkPositioning: r.gkPositioning, gkSpeed: r.gkSpeed
    },
    customTags: r.customTags || [],
    imageUrl: r.imageUrl || null
  }));

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.playerName.toLowerCase().includes(search.toLowerCase()) || report.team.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || report.specificRoles.includes(roleFilter);
    const age = report.playerAge;
    const matchesMinAge = minAge === "" || age >= minAge;
    const matchesMaxAge = maxAge === "" || age <= maxAge;
    const rating = report.rating;
    const matchesMinRating = minRating === "" || rating >= minRating;
    const matchesMaxRating = maxRating === "" || rating <= maxRating;
    const matchesTag = tagFilter === "all" || (report.customTags && report.customTags.includes(tagFilter));

    return matchesSearch && matchesRole && matchesTag && matchesMinAge && matchesMaxAge && matchesMinRating && matchesMaxRating;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
        case "rating": return b.rating - a.rating;
        case "value": return (b.marketValue || 0) - (a.marketValue || 0);
        case "age": return a.playerAge - b.playerAge;
        case "role": return a.mainRole.localeCompare(b.mainRole);
        case "date": default:
            const dateA = new Date(a.createdAt || a.matchDate).getTime();
            const dateB = new Date(b.createdAt || b.matchDate).getTime();
            return dateB - dateA;
    }
  });

  const clearFilters = () => {
    setSearch(""); setRoleFilter("all"); setTagFilter("all"); 
    setMinAge(""); setMaxAge(""); setMinRating(""); setMaxRating("");
  };

  const hasActiveFilters = search || roleFilter !== "all" || tagFilter !== "all" || minAge !== "" || maxAge !== "" || minRating !== "" || maxRating !== "";

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Scouting<span className="text-primary">Hub</span></h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Database Talenti ({sortedReports.length} trovati)</p>
        </div>
        <div className="flex gap-2 items-center">
            <ExcelImport /> 
            <Link href="/new-report">
            <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95 cursor-pointer font-bold"><PlusCircle size={18} /> Nuovo Report</Button>
            </Link>
        </div>
      </motion.div>

      {/* TOOLBAR (NON PIÙ STICKY) */}
      <div className="space-y-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between backdrop-blur-xl bg-white/95 dark:bg-slate-900/95">
            
            <div className="relative w-full lg:max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <Input placeholder="Cerca nome o squadra..." className="pl-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="flex w-full lg:w-auto gap-2 items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 w-full lg:w-auto justify-between lg:justify-center hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all active:scale-95">
                            <span className="flex items-center gap-2"><ArrowUpDown size={16} /> <span className="hidden sm:inline">Ordina:</span></span>
                            <span className="font-semibold text-primary">
                                {sortBy === "date" && "Data"}
                                {sortBy === "value" && "Valore"}
                                {sortBy === "rating" && "Overall"}
                                {sortBy === "age" && "Età"}
                                {sortBy === "role" && "Ruolo"}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Ordina per</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                            <DropdownMenuRadioItem value="date" className="cursor-pointer">Data (Più recenti)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="value" className="cursor-pointer">Valore Mercato (€)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="rating" className="cursor-pointer">Overall (Più alti)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="age" className="cursor-pointer">Età (Più giovani)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="role" className="cursor-pointer">Ruolo (A-Z)</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button variant={showFilters ? "secondary" : "outline"} onClick={() => setShowFilters(!showFilters)} className="gap-2 border-slate-200 dark:border-slate-800 dark:bg-slate-950 lg:w-auto w-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95">
                    <SlidersHorizontal size={16} /> <span className="hidden sm:inline">Filtri</span>
                </Button>

                {hasActiveFilters && <Button variant="ghost" size="icon" onClick={clearFilters} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0 cursor-pointer hover:rotate-90 transition-transform"><X size={18} /></Button>}
                
                <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800 mx-1 hidden lg:block"></div>

                <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border dark:border-slate-700">
                    <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 cursor-pointer transition-all ${viewMode === "grid" ? "bg-white dark:bg-slate-600 shadow-sm scale-105" : "hover:bg-slate-200 dark:hover:bg-slate-700"}`} onClick={() => setViewMode("grid")}><LayoutGrid size={16} /></Button>
                    <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 cursor-pointer transition-all ${viewMode === "list" ? "bg-white dark:bg-slate-600 shadow-sm scale-105" : "hover:bg-slate-200 dark:hover:bg-slate-700"}`} onClick={() => setViewMode("list")}><ListIcon size={16} /></Button>
                </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {showFilters && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-6 shadow-inner mb-4">
                        <div className="space-y-2">
                            <Label>Ruolo Specifico</Label>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="bg-white dark:bg-slate-950 dark:border-slate-800 cursor-pointer hover:border-primary/50 transition-colors"><SelectValue placeholder="Tutti i ruoli" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="cursor-pointer">Tutti i ruoli</SelectItem>
                                    {SPECIFIC_ROLES.map(r => <SelectItem key={r} value={r} className="cursor-pointer">{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                         <div className="space-y-2">
                            <Label className="flex items-center gap-1"><Hash size={14}/> Filtra per Tag</Label>
                            <Select value={tagFilter} onValueChange={setTagFilter}>
                                <SelectTrigger className="bg-white dark:bg-slate-950 dark:border-slate-800 cursor-pointer hover:border-primary/50 transition-colors"><SelectValue placeholder="Tutti i tag" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="cursor-pointer">Tutti i tag</SelectItem>
                                    {SCOUT_TAGS.map(t => <SelectItem key={t} value={t} className="cursor-pointer">#{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Età</Label>
                            <div className="flex gap-2 items-center">
                                <Input type="number" placeholder="Min" className="bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 transition-all" value={minAge} onChange={e => setMinAge(e.target.value ? Number(e.target.value) : "")} />
                                <span>-</span>
                                <Input type="number" placeholder="Max" className="bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 transition-all" value={maxAge} onChange={e => setMaxAge(e.target.value ? Number(e.target.value) : "")} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Rating (1-100)</Label>
                            <div className="flex gap-2 items-center">
                                <Input type="number" placeholder="Min" className="bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 transition-all" value={minRating} onChange={e => setMinRating(e.target.value ? Number(e.target.value) : "")} />
                                <span>-</span>
                                <Input type="number" placeholder="Max" className="bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 transition-all" value={maxRating} onChange={e => setMaxRating(e.target.value ? Number(e.target.value) : "")} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
      </div>

      <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}>
        <AnimatePresence mode="popLayout">
            {sortedReports.map((report) => (
                <ReportCard key={report.id} report={report} viewMode={viewMode} />
            ))}
        </AnimatePresence>
        
        {sortedReports.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-50 dark:bg-slate-900/50 border border-dashed dark:border-slate-800 rounded-xl">
                <div className="text-slate-500 mb-2">Nessun giocatore trovato</div>
                <p className="text-sm text-slate-400">Database vuoto o filtri troppo restrittivi.</p>
                {hasActiveFilters && <Button variant="link" onClick={clearFilters} className="mt-2 text-primary cursor-pointer hover:underline">Rimuovi filtri</Button>}
            </div>
        )}
      </div>
    </div>
  );
}