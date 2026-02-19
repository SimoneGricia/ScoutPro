import { getReportById, getSimilarPlayers, getPlayerHistory } from "@/lib/actions";
import SkillsChart from "@/components/SkillsChart";
import HistoryChart from "@/components/HistoryChart";
import ReportActions from "@/components/ReportActions";
import MatchLogSection from "@/components/MatchLogSection"; // Assicurati che sia importato
import DownloadPdf from "@/components/DownloadPdf";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, Calendar, Shield, Ruler, Weight, Footprints, 
  AlertCircle, CheckCircle2, XCircle, ThumbsUp, ThumbsDown, 
  Check, X, Activity, User, Banknote, FileSignature, Wallet, CalendarDays, MonitorPlay 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ScoutReport } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

const getRatingColor = (rating: number) => {
    if (rating >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    if (rating >= 60) return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
    return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
};

const getRecBadge = (rec: string) => {
    switch(rec) {
        case "Acquistare": return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800 gap-1 px-3 py-1 hover:bg-emerald-200"><CheckCircle2 size={14}/> DA ACQUISTARE</Badge>;
        case "Monitorare": return <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800 gap-1 px-3 py-1 hover:bg-amber-200"><AlertCircle size={14}/> DA MONITORARE</Badge>;
        case "Scartare": return <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800 gap-1 px-3 py-1 hover:bg-red-200"><XCircle size={14}/> DA SCARTARE</Badge>;
        default: return null;
    }
}

// Helper per convertire link YouTube in Embed
const getEmbedUrl = (url: string) => {
    let videoId = "";
    if (url.includes("youtu.be")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/watch")) {
        videoId = url.split("v=")[1]?.split("&")[0];
    }
    
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    return url; 
};

export default async function ReportDetailPage(props: PageProps) {
  const params = await props.params;
  const { id } = params;
  
  const reportData = await getReportById(id);
  const similarPlayers = await getSimilarPlayers(id);
  const historyData = await getPlayerHistory(id);

  if (!reportData) {
    notFound();
  }

  // --- CALCOLO STATISTICHE DINAMICHE DAI LOG ---
  const logs = reportData.matchLogs || [];
  
  // Totali
  const calculatedStats = {
      apps: logs.length,
      minutes: logs.reduce((acc, log) => acc + log.minutesPlayed, 0),
      goals: logs.reduce((acc, log) => acc + log.goals, 0),
      assists: logs.reduce((acc, log) => acc + log.assists, 0),
      saves: logs.reduce((acc, log) => acc + log.saves, 0),
      cleanSheets: logs.filter(log => log.cleanSheet).length,
      yellows: logs.filter(log => log.yellowCard).length,
      reds: logs.filter(log => log.redCard).length,
      // Media Voto
      avgRating: logs.length > 0 
          ? (logs.reduce((acc, log) => acc + log.rating, 0) / logs.length).toFixed(1) 
          : "N/D"
  };

  const report: ScoutReport = {
      ...reportData,
      matchDate: reportData.matchDate.toISOString(),
      stats: {
          pace: reportData.pace, shooting: reportData.shooting, passing: reportData.passing,
          dribbling: reportData.dribbling, defending: reportData.defending, physical: reportData.physical,
          diving: reportData.diving, handling: reportData.handling, kicking: reportData.kicking,
          reflexes: reportData.reflexes, gkPositioning: reportData.gkPositioning, gkSpeed: reportData.gkSpeed
      },
      recommendation: reportData.recommendation as any,
      mainRole: reportData.mainRole as any,
      preferredFoot: reportData.preferredFoot as any,
      customTags: reportData.customTags || [],
      heatmapZones: reportData.heatmapZones || [],
      strengths: reportData.strengths || [],
      weaknesses: reportData.weaknesses || [],
      attributes: reportData.attributes || [],
      imageUrl: reportData.imageUrl || null,
      videoLinks: reportData.videoLinks || []
  };

  const isGoalkeeper = report.mainRole === "Portiere";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER NAVIGAZIONE */}
      <div className="flex justify-between items-center">
         <div className="flex items-center gap-4">
            <Link href="/">
                <Button variant="ghost" size="icon" className="hover:bg-slate-200 dark:hover:bg-slate-800 shrink-0">
                    <ArrowLeft size={24} className="text-slate-700 dark:text-slate-300" />
                </Button>
            </Link>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest hidden md:block">Scheda Tecnica</h2>
         </div>
         <div className="flex items-center gap-2">
             <DownloadPdf reportName={report.playerName} targetId="report-content" />
             <ReportActions id={id} />
         </div>
      </div>

      <Separator className="dark:bg-slate-800" />

      {/* CONTENITORE PRINCIPALE */}
      <div id="report-content" className="p-4 bg-white dark:bg-slate-950 rounded-xl">
        
        {/* HEADER GIOCATORE */}
        <div className="flex flex-col lg:flex-row gap-6 items-start mb-8">
            <div className="shrink-0 relative w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-lg bg-slate-50 dark:bg-slate-900">
                {report.imageUrl ? (
                    <Image src={report.imageUrl} alt={report.playerName} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-slate-400"><User size={64} /></div>
                )}
            </div>

            <div className="flex-1 space-y-3 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white truncate">{report.playerName}</h1>
                    {getRecBadge(report.recommendation)}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm md:text-base">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"><Shield size={16}/> {report.team}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar size={16}/> {report.playerAge} anni</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Ruler size={16}/> {report.height} cm</span>
                    <span className="flex items-center gap-1"><Weight size={16}/> {report.weight} kg</span>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                    {report.customTags && report.customTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 px-2 py-1">#{tag}</Badge>
                    ))}
                    {report.status && (
                        <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1">
                            Status: {report.status}
                        </Badge>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Overall</span>
                <div className={`px-5 py-2 rounded-xl border-2 text-4xl font-black ${getRatingColor(report.rating)}`}>
                    {report.rating}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLONNA SINISTRA */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* PROFILO TECNICO */}
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm dark:bg-slate-900">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2 dark:text-white"><Shield size={18} className="text-primary"/> Profilo Tecnico</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="mb-6 h-[250px]"><SkillsChart stats={report.stats} /></div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                                <span className="font-bold text-sm text-slate-600 dark:text-slate-300 uppercase">Ruolo</span>
                                <Badge variant="default" className="text-lg px-4 py-1 bg-blue-600 dark:bg-blue-600">{report.mainRole}</Badge>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border dark:border-slate-800">
                                <span className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase block mb-2">Ruoli Specifici</span>
                                <div className="flex flex-wrap gap-2">
                                    {report.specificRoles.map(r => <Badge key={r} variant="secondary" className="bg-white dark:bg-slate-700 border dark:border-slate-600 text-slate-700 dark:text-slate-200">{r}</Badge>)}
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border dark:border-slate-800">
                                <span className="font-bold text-sm text-slate-600 dark:text-slate-300 uppercase flex items-center gap-2"><Footprints size={16}/> Piede</span>
                                <div className="text-right">
                                    <div className="text-xl font-black text-slate-800 dark:text-slate-100">{report.preferredFoot}</div>
                                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Debole: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{report.weakFoot}/5</span></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* GRAFICO STORICO */}
                <div className="mt-6 mb-6">
                    <HistoryChart data={historyData} />
                </div>

                {/* DATI FINANZIARI */}
                <Card className="border-emerald-100 dark:border-emerald-900 bg-emerald-50/10 dark:bg-emerald-900/10 shadow-sm">
                    <CardHeader className="border-b border-emerald-100 dark:border-emerald-900 pb-3 bg-emerald-50/30 dark:bg-emerald-900/20">
                        <CardTitle className="text-lg flex items-center gap-2 text-emerald-800 dark:text-emerald-400"><Banknote size={18}/> Dati Economici</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 grid grid-cols-2 gap-4">
                        <div className="col-span-2 flex justify-between items-center p-3 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 rounded-lg shadow-sm">
                            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Valore Mercato</span>
                            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">€{report.marketValue}M</span>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg">
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1"><Wallet size={10}/> Stipendio</div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">€{report.salary}M <span className="text-[10px] text-slate-400 font-normal">netti</span></div>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg">
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1"><FileSignature size={10}/> Clausola</div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">{report.releaseClause > 0 ? `€${report.releaseClause}M` : "-"}</div>
                        </div>
                        <div className="col-span-2 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Scadenza</span>
                            <Badge variant="outline" className="text-sm font-mono dark:text-slate-200">{report.contractExpiry ? new Date(report.contractExpiry).toLocaleDateString('it-IT') : "-"}</Badge>
                        </div>
                        {report.agent && (
                            <div className="col-span-2 text-xs text-center text-slate-400 dark:text-slate-500">
                                Agente: <span className="font-semibold text-slate-600 dark:text-slate-300">{report.agent}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* STATS STAGIONALI (CALCOLATE DALLA CRONOLOGIA) */}
                <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-900/10 shadow-sm">
                    <CardHeader className="pb-3 border-b border-amber-100 dark:border-amber-900">
                        <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-500"><CalendarDays size={18}/> Rendimento Stagionale</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="text-center">
                                <div className="text-2xl font-black text-slate-800 dark:text-slate-200">{calculatedStats.apps}</div>
                                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Presenze</div>
                            </div>
                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                            <div className="text-center">
                                <div className="text-2xl font-black text-slate-800 dark:text-slate-200">{calculatedStats.avgRating}</div>
                                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Media Voto</div>
                            </div>
                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                            <div className="flex gap-2">
                                <div className="flex flex-col items-center"><div className="w-4 h-5 bg-yellow-400 rounded-sm shadow-sm mb-1"></div><span className="text-xs font-bold text-slate-700 dark:text-slate-300">{calculatedStats.yellows}</span></div>
                                <div className="flex flex-col items-center"><div className="w-4 h-5 bg-red-500 rounded-sm shadow-sm mb-1"></div><span className="text-xs font-bold text-slate-700 dark:text-slate-300">{calculatedStats.reds}</span></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {isGoalkeeper ? (
                                <>
                                    <div className="bg-white dark:bg-slate-900 p-2 rounded border border-amber-100 dark:border-amber-900 flex justify-between items-center"><span className="text-xs font-bold text-slate-500">Parate</span><span className="text-lg font-black text-orange-600 dark:text-orange-400">{calculatedStats.saves}</span></div>
                                    <div className="bg-white dark:bg-slate-900 p-2 rounded border border-amber-100 dark:border-amber-900 flex justify-between items-center"><span className="text-xs font-bold text-slate-500">Clean Sheets</span><span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{calculatedStats.cleanSheets}</span></div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-white dark:bg-slate-900 p-2 rounded border border-amber-100 dark:border-amber-900 flex justify-between items-center"><span className="text-xs font-bold text-slate-500">Gol</span><span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{calculatedStats.goals}</span></div>
                                    <div className="bg-white dark:bg-slate-900 p-2 rounded border border-amber-100 dark:border-amber-900 flex justify-between items-center"><span className="text-xs font-bold text-slate-500">Assist</span><span className="text-lg font-black text-blue-600 dark:text-blue-400">{calculatedStats.assists}</span></div>
                                </>
                            )}
                        </div>
                        <div className="mt-2 text-center text-[10px] text-slate-400 uppercase font-medium">Minuti Giocati: {calculatedStats.minutes}'</div>
                    </CardContent>
                </Card>
            </div>

            {/* COLONNA DESTRA */}
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-900/20">
                        <CardHeader className="pb-2 border-b border-emerald-100 dark:border-emerald-900"><CardTitle className="text-sm font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2"><ThumbsUp size={16}/> PUNTI DI FORZA</CardTitle></CardHeader>
                        <CardContent className="pt-4">{report.strengths.length > 0 ? <ul className="space-y-3">{report.strengths.map((s, i) => <li key={i} className="flex items-start gap-3 text-sm text-emerald-900 dark:text-emerald-300"><div className="mt-0.5 bg-emerald-200 dark:bg-emerald-800 rounded-full p-0.5"><Check size={12} className="text-emerald-700 dark:text-emerald-400"/></div><span>{s}</span></li>)}</ul> : <span className="text-xs text-muted-foreground italic">Nessun punto di forza.</span>}</CardContent>
                    </Card>
                    <Card className="border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-900/20">
                        <CardHeader className="pb-2 border-b border-red-100 dark:border-red-900"><CardTitle className="text-sm font-bold text-red-800 dark:text-red-400 flex items-center gap-2"><ThumbsDown size={16}/> PUNTI DI DEBOLEZZA</CardTitle></CardHeader>
                        <CardContent className="pt-4">{report.weaknesses.length > 0 ? <ul className="space-y-3">{report.weaknesses.map((w, i) => <li key={i} className="flex items-start gap-3 text-sm text-red-900 dark:text-red-300"><div className="mt-0.5 bg-red-200 dark:bg-red-800 rounded-full p-0.5"><X size={12} className="text-red-700 dark:text-red-400"/></div><span>{w}</span></li>)}</ul> : <span className="text-xs text-muted-foreground italic">Nessuna debolezza.</span>}</CardContent>
                    </Card>
                </div>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800"><CardTitle className="flex items-center gap-2 text-lg dark:text-white"><Calendar size={18} className="text-slate-500"/> Relazione Osservatore</CardTitle></CardHeader>
                    <CardContent className="pt-6"><div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-300 whitespace-pre-wrap">{report.notes}</div></CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm dark:bg-slate-900">
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2 dark:text-white"><Activity size={18} className="text-slate-500"/> Caratteristiche</CardTitle></CardHeader>
                    <CardContent><div className="flex flex-wrap gap-2">{report.attributes.map((attr, i) => <Badge key={i} variant="outline" className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">{attr}</Badge>)}</div></CardContent>
                </Card>

                {/* --- CRONOLOGIA PARTITE (SPOSTATA E AMPLIATA) --- */}
                <MatchLogSection 
                    reportId={report.id} 
                    matchLogs={reportData.matchLogs || []} 
                    isGoalkeeper={isGoalkeeper} 
                />

                {/* --- MEDIA GALLERY (VIDEO) --- */}
                {report.videoLinks && report.videoLinks.length > 0 && (
                    <Card className="border-sky-200 dark:border-sky-900 dark:bg-sky-950/10 shadow-sm mt-6">
                        <CardHeader className="bg-sky-50 dark:bg-sky-900/20 border-b border-sky-100 dark:border-sky-900 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2 dark:text-sky-400">
                                <MonitorPlay size={18} className="text-sky-600 dark:text-sky-400"/> Video Highlights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {report.videoLinks.map((link, i) => (
                                    <div key={i} className="rounded-xl overflow-hidden border-4 border-slate-100 dark:border-slate-800 bg-black shadow-lg aspect-video relative group">
                                        <iframe 
                                            src={getEmbedUrl(link)} 
                                            className="w-full h-full" 
                                            title={`Video ${i+1}`}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* --- MONEYBALL: GIOCATORI SIMILI --- */}
                {similarPlayers.length > 0 && (
                    <Card className="border-indigo-100 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-900/10 shadow-sm">
                        <CardHeader className="pb-3 border-b border-indigo-100 dark:border-indigo-900"><CardTitle className="text-lg flex items-center gap-2 text-indigo-800 dark:text-indigo-400"><Crosshair size={18}/> Alternative Simili (Moneyball)</CardTitle></CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            {similarPlayers.map(sim => (
                                <Link key={sim.id} href={`/report/${sim.id}`} className="flex items-center justify-between p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">{sim.playerName}</div>
                                        <Badge variant="secondary" className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">{sim.similarity.toFixed(0)}% Simile</Badge>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-400 uppercase">Valore</div>
                                        <div className="font-bold text-emerald-600 dark:text-emerald-400">€{sim.marketValue}M</div>
                                    </div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}