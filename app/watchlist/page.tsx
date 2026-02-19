import { getWatchlistReports } from "@/lib/actions";
import ReportCard from "@/components/ReportCard";
import { Star, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const reports = await getWatchlistReports();

  // Statistiche rapide sulla watchlist
  const buyCount = reports.filter(r => r.recommendation === "Acquistare").length;
  const monitorCount = reports.filter(r => r.recommendation === "Monitorare").length;

  const normalizedReports = reports.map(r => ({
    ...r,
    matchDate: r.matchDate.toISOString(),
    stats: {
        pace: r.pace, shooting: r.shooting, passing: r.passing,
        dribbling: r.dribbling, defending: r.defending, physical: r.physical,
        diving: r.diving, handling: r.handling, kicking: r.kicking, 
        reflexes: r.reflexes, gkPositioning: r.gkPositioning, gkSpeed: r.gkSpeed
    },
    customTags: r.customTags || [],
    imageUrl: r.imageUrl || null
  }));

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b dark:border-slate-800 pb-6">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    <Star className="text-yellow-400 fill-yellow-400" size={32} />
                    Watchlist
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                    I tuoi giocatori preferiti salvati manualmente.
                </p>
            </div>
            
            {/* BADGE RIEPILOGO */}
            <div className="flex gap-3">
                <Badge variant="outline" className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 size={14} className="mr-2"/> {buyCount} Target Primari
                </Badge>
                <Badge variant="outline" className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                    <AlertCircle size={14} className="mr-2"/> {monitorCount} Da Seguire
                </Badge>
            </div>
        </div>

        {normalizedReports.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {normalizedReports.map((report) => (
                    <ReportCard key={report.id} report={report} viewMode="grid" />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 border border-dashed dark:border-slate-800 rounded-xl">
                <Star className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Watchlist Vuota</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                    Non hai ancora salvato nessun giocatore. Clicca sulla stella presente nelle card dei giocatori per aggiungerli qui.
                </p>
            </div>
        )}
    </div>
  );
}