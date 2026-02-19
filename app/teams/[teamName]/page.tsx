import { getReports } from "@/lib/actions";
import ReportCard from "@/components/ReportCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { ScoutReport } from "@/types";

interface PageProps {
  params: Promise<{ teamName: string }>;
}

export const dynamic = "force-dynamic";

export default async function TeamDetailPage(props: PageProps) {
  const params = await props.params;
  // Decodifica l'URL (es. "Inter%20Milan" -> "Inter Milan")
  const teamName = decodeURIComponent(params.teamName);
  
  const allReports = await getReports();
  
  // Filtra solo i giocatori della squadra
  const teamReports = allReports.filter(r => r.team.trim() === teamName);

  // Adatta i dati per la UI
  const reports: ScoutReport[] = teamReports.map((r) => ({
    ...r,
    matchDate: r.matchDate.toISOString(),
    stats: {
        pace: r.pace,
        shooting: r.shooting,
        passing: r.passing,
        dribbling: r.dribbling,
        defending: r.defending,
        physical: r.physical
    },
    mainRole: r.mainRole as any,
    preferredFoot: r.preferredFoot as any,
    recommendation: r.recommendation as any
  }));

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/teams">
            <Button variant="ghost" size="icon"><ArrowLeft /></Button>
        </Link>
        <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                {teamName}
            </h1>
            <p className="text-slate-500 text-lg mt-1">
                Rosa monitorata: {reports.length} giocatori.
            </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
}