import { getReports } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const reports = await getReports();

  // Raggruppa i giocatori per squadra
  const teamsMap = reports.reduce((acc, report) => {
    const teamName = report.team;
    if (!acc[teamName]) {
      acc[teamName] = { name: teamName, players: [] };
    }
    acc[teamName].players.push(report);
    return acc;
  }, {} as Record<string, { name: string; players: typeof reports }>);

  const teams = Object.values(teamsMap);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b dark:border-slate-800 pb-6">
            <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <Users className="text-blue-600 dark:text-blue-400" size={32} />
                Squadre Monitorate
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                Panoramica dei club e dei giocatori osservati per ciascuno.
            </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
                <Card key={team.name} className="border-slate-200 dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition-shadow">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 pb-4">
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                                <Shield className="text-slate-400 dark:text-slate-500" size={24} />
                                {team.name}
                            </CardTitle>
                            <Badge variant="secondary" className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-600">
                                {team.players.length} Giocatori
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-3">
                            {team.players.slice(0, 5).map(player => (
                                <Link key={player.id} href={`/report/${player.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                    <Avatar className="h-8 w-8 border border-slate-100 dark:border-slate-700">
                                        <AvatarImage src={player.imageUrl || ""} className="object-cover" />
                                        <AvatarFallback className="text-xs dark:bg-slate-700 dark:text-slate-300">{player.rating}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {player.playerName}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            {player.mainRole} • <span className="text-emerald-600 dark:text-emerald-400 font-medium">€{player.marketValue}M</span>
                                        </div>
                                    </div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300`}>
                                        {player.rating}
                                    </div>
                                </Link>
                            ))}
                            {team.players.length > 5 && (
                                <div className="text-center pt-2">
                                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 italic">
                                        + altri {team.players.length - 5} giocatori
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}