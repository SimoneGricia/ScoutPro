"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Ruler, Weight, Shield, Footprints, Eye, Banknote, Star } from "lucide-react";
import { ScoutReport } from "@/types";
import { toggleFavorite } from "@/lib/actions"; // Importa l'azione
import { useTransition } from "react";
import { cn } from "@/lib/utils";

interface ReportCardProps {
  report: ScoutReport;
  viewMode: "grid" | "list";
}

const getRatingColor = (rating: number) => {
    if (rating >= 80) return "bg-emerald-500 text-white";
    if (rating >= 60) return "bg-amber-500 text-white";
    return "bg-red-500 text-white";
};

export default function ReportCard({ report, viewMode }: ReportCardProps) {
  const [isPending, startTransition] = useTransition();
  
  const isGoalkeeper = report.mainRole === "Portiere";

  const statsToShow = isGoalkeeper ? [
      { label: "TUF", val: report.diving }, { label: "PRE", val: report.handling },
      { label: "RIN", val: report.kicking }, { label: "REA", val: report.reflexes },
      { label: "POS", val: report.gkPositioning }, { label: "VEL", val: report.gkSpeed },
  ] : [
      { label: "VEL", val: report.pace }, { label: "TIR", val: report.shooting },
      { label: "PAS", val: report.passing }, { label: "DRI", val: report.dribbling },
      { label: "DIF", val: report.defending }, { label: "FIS", val: report.physical },
  ];

  // Gestione Click Stella
  const handleStarClick = (e: React.MouseEvent) => {
      e.preventDefault(); // Evita navigazione Link
      e.stopPropagation(); // Evita navigazione Link
      startTransition(async () => {
          await toggleFavorite(report.id);
      });
  };

  // VISTA LISTA
  if (viewMode === "list") {
    return (
        <Link href={`/report/${report.id}`}>
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-all group cursor-pointer relative">
                
                {/* STELLA (LIST VIEW) */}
                <button 
                    onClick={handleStarClick}
                    disabled={isPending}
                    className="absolute top-4 right-4 z-20 p-1 hover:scale-110 transition-transform"
                >
                    <Star 
                        size={20} 
                        className={cn(
                            "transition-colors", 
                            report.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-300 hover:text-yellow-400"
                        )} 
                    />
                </button>

                <Avatar className="h-16 w-16 border-2 border-white dark:border-slate-700 shadow-sm">
                    {report.imageUrl && <AvatarImage src={report.imageUrl} className="object-cover" />}
                    <AvatarFallback className="text-lg font-bold dark:bg-slate-800 dark:text-slate-200">{report.rating}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 dark:text-slate-100 truncate text-lg pr-8">{report.playerName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span>{report.team}</span> • <span>{report.playerAge} anni</span>
                    </div>
                </div>
                
                <div className="hidden md:flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {statsToShow.slice(0, 3).map((s, i) => (
                        <div key={i} className="text-center">
                            <span className="block font-bold text-slate-700 dark:text-slate-300">{s.val}</span>
                            <span className="text-[9px] uppercase">{s.label}</span>
                        </div>
                    ))}
                </div>

                <div className="text-right px-4 hidden sm:block">
                    <div className="text-xs text-slate-400 uppercase font-bold">Valore</div>
                    <div className="font-bold text-emerald-700 dark:text-emerald-500">
                        {report.marketValue > 0 ? `€${report.marketValue}M` : "-"}
                    </div>
                </div>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${getRatingColor(report.rating)}`}>
                    {report.rating}
                </div>
            </div>
        </Link>
    );
  }

  // VISTA GRIGLIA
  return (
    <Link href={`/report/${report.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-slate-200 dark:border-slate-800 h-full flex flex-col cursor-pointer bg-white dark:bg-slate-900 relative">
        
        {/* STELLA (GRID VIEW) */}
        <div className="absolute top-3 left-3 z-20">
             <button 
                onClick={handleStarClick}
                disabled={isPending}
                className="p-1.5 bg-white/80 dark:bg-black/50 rounded-full hover:scale-110 transition-transform backdrop-blur-sm shadow-sm"
            >
                <Star 
                    size={18} 
                    className={cn(
                        "transition-colors", 
                        report.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-400 dark:text-slate-200 hover:text-yellow-400"
                    )} 
                />
            </button>
        </div>

        {/* PARTE SUPERIORE */}
        <div className="relative h-28 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm font-semibold">
                    {report.mainRole}
                </Badge>
            </div>
            <div className="absolute -bottom-10 left-4">
                <Avatar className="h-28 w-28 border-4 border-white dark:border-slate-900 shadow-md bg-white dark:bg-slate-800">
                    {report.imageUrl && <AvatarImage src={report.imageUrl} className="object-cover" />}
                    <AvatarFallback className="text-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-400">
                        {report.playerName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </div>
        </div>

        <CardHeader className="pt-12 pb-2">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{report.playerName}</h3>
                    <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                        <Shield size={14} /> {report.team}
                    </div>
                </div>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg font-black shadow-sm ${getRatingColor(report.rating)}`}>
                    {report.rating}
                </div>
            </div>
        </CardHeader>

        <CardContent className="py-2 flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700"><Calendar size={14} className="text-slate-400"/> {report.playerAge} Anni</div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700"><Ruler size={14} className="text-slate-400"/> {report.height} cm</div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700"><Weight size={14} className="text-slate-400"/> {report.weight} kg</div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700"><Footprints size={14} className="text-slate-400"/> {report.preferredFoot}</div>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-slate-50/50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                {statsToShow.map((stat, i) => (
                    <div key={i} className="flex flex-col items-center p-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{stat.label}</span>
                        <span className={`text-sm font-bold ${Number(stat.val) >= 80 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
                            {stat.val || 0}
                        </span>
                    </div>
                ))}
            </div>
            
            {report.marketValue > 0 && (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 p-2 rounded-lg">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1"><Banknote size={14}/> Valore</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-500">€{report.marketValue}M</span>
                </div>
            )}
        </CardContent>

        <CardFooter className="pt-0 pb-4">
            <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2 transition-colors border-2 border-slate-900 dark:border-slate-600 text-slate-900 dark:text-slate-200 font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
                <Eye size={16} /> Vedi Report
            </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}