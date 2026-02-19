"use client";

import { useEffect, useState } from "react";
import { getReports } from "@/lib/actions";
import { ScoutReport } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Layers, Shield, User, Circle } from "lucide-react";
import Link from "next/link";

const ROLE_GROUPS = [
    { name: "Portieri", roles: ["Portiere"] },
    { name: "Difensori", roles: ["Difensore"] },
    { name: "Centrocampisti", roles: ["Centrocampista"] },
    { name: "Attaccanti", roles: ["Attaccante"] },
];

export default function DepthChartPage() {
  const [reports, setReports] = useState<ScoutReport[]>([]);

  useEffect(() => {
    getReports().then((data: any) => setReports(data));
  }, []);

  return (
    <div className="space-y-8 pb-20">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b dark:border-slate-800 pb-6">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
                    <Layers className="text-indigo-600 dark:text-indigo-400" size={32} />
                    Depth Chart
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                    Analisi della profondità della rosa e copertura dei ruoli.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {ROLE_GROUPS.map((group) => {
                const groupPlayers = reports.filter(r => group.roles.includes(r.mainRole)).sort((a, b) => b.rating - a.rating);

                return (
                    <Card key={group.name} className="border-slate-200 dark:border-slate-800 dark:bg-slate-900 h-fit">
                        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 pb-3">
                            <CardTitle className="text-lg flex justify-between items-center text-slate-900 dark:text-slate-100">
                                <span>{group.name}</span>
                                <Badge variant="secondary" className="bg-white dark:bg-slate-700 border dark:border-slate-600 text-slate-600 dark:text-slate-300">{groupPlayers.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {groupPlayers.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {groupPlayers.map((player, index) => (
                                        <Link key={player.id} href={`/report/${player.id}`} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group relative">
                                            <div className="w-1 absolute left-0 top-0 bottom-0 bg-transparent group-hover:bg-indigo-500 transition-colors" />
                                            <div className="flex flex-col items-center justify-center w-6 shrink-0">
                                                <span className={`text-xs font-bold ${index === 0 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-600"}`}>
                                                    {index === 0 ? "1°" : `${index + 1}°`}
                                                </span>
                                            </div>
                                            <Avatar className="h-10 w-10 border border-slate-100 dark:border-slate-700">
                                                <AvatarImage src={player.imageUrl || ""} className="object-cover" />
                                                <AvatarFallback>{player.rating}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm text-slate-900 dark:text-slate-200 truncate">{player.playerName}</div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                    <span>{player.playerAge} anni</span>
                                                    <span>•</span>
                                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">€{player.marketValue}M</span>
                                                </div>
                                            </div>
                                            <div className={`text-lg font-black ${player.rating >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`}>
                                                {player.rating}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-400 dark:text-slate-600 text-sm italic flex flex-col items-center gap-2">
                                    <Shield size={24} className="opacity-20"/> Nessun giocatore in questo ruolo.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    </div>
  );
}