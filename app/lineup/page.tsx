import { getReports, getSavedLineups } from "@/lib/actions";
import LineupBuilder from "@/components/LineupBuilder";
import { RectangleVertical } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LineupPage() {
  const reportsData = await getReports();
  const savedLineupsData = await getSavedLineups();

  const reports = reportsData.map(r => ({
    ...r,
    matchDate: r.matchDate.toISOString(),
    stats: {
        pace: r.pace, shooting: r.shooting, passing: r.passing,
        dribbling: r.dribbling, defending: r.defending, physical: r.physical
    },
    customTags: r.customTags || [],
    imageUrl: r.imageUrl || null
  }));

  const savedLineups = savedLineupsData.map(l => ({
      ...l,
      lineup: JSON.parse(l.lineup)
  }));

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b dark:border-slate-800 pb-6">
            <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <RectangleVertical className="text-emerald-600 dark:text-emerald-500" size={32} />
                Gli 11 Titolari
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                Simula la tua squadra titolare, analizza le statistiche e salva le tue idee.
            </p>
            </div>
        </div>

        {/* BUILDER */}
        <LineupBuilder reports={reports} savedLineups={savedLineups} />
    </div>
  );
}