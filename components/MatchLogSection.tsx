"use client";

import { useState, useTransition } from "react";
import { addMatchLog, deleteMatchLog } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Swords, Trash2, Plus, StickyNote, ShieldAlert } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface MatchLogSectionProps {
  reportId: string;
  matchLogs: any[];
  isGoalkeeper: boolean;
}

export default function MatchLogSection({ reportId, matchLogs, isGoalkeeper }: MatchLogSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    opponent: "",
    competition: "Serie A",
    minutesPlayed: 90,
    rating: 6.0,
    goals: 0,
    assists: 0,
    saves: 0,
    yellowCard: false,
    redCard: false,
    cleanSheet: false,
    notes: ""
  });

  const handleSubmit = () => {
    if (!formData.opponent) return alert("Inserisci l'avversario");
    startTransition(async () => {
      await addMatchLog(reportId, formData);
      setIsOpen(false);
      // Reset parziale form
      setFormData({ ...formData, opponent: "", notes: "", rating: 6.0, goals: 0, assists: 0, saves: 0, yellowCard: false, redCard: false, cleanSheet: false });
    });
  };

  const handleDelete = (logId: string) => {
    if (confirm("Eliminare questo report partita?")) {
      startTransition(async () => await deleteMatchLog(logId, reportId));
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 7.5) return "bg-emerald-500 text-white";
    if (rating >= 6.0) return "bg-sky-500 text-white";
    if (rating >= 5.0) return "bg-amber-500 text-white";
    return "bg-red-500 text-white";
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm dark:bg-slate-900 mt-8">
      <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
          <Swords size={20} className="text-indigo-600 dark:text-indigo-400" /> Cronologia Partite
        </CardTitle>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
              <Plus size={16} /> Aggiungi Partita
            </Button>
          </DialogTrigger>
          
          {/* MODIFICA QUI: Aggiunto bg-white per sfondo bianco esplicito */}
          <DialogContent className="bg-white dark:bg-slate-900 dark:border-slate-800 max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-slate-900 dark:text-white">Nuovo Report Partita</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Data</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="bg-white dark:bg-slate-950"/></div>
                <div className="space-y-2"><Label>Competizione</Label><Input placeholder="Serie A" value={formData.competition} onChange={(e) => setFormData({...formData, competition: e.target.value})} className="bg-white dark:bg-slate-950"/></div>
              </div>
              <div className="space-y-2"><Label>Avversario</Label><Input placeholder="Es. Inter" value={formData.opponent} onChange={(e) => setFormData({...formData, opponent: e.target.value})} className="bg-white dark:bg-slate-950 font-bold"/></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Minuti</Label><Input type="number" value={formData.minutesPlayed} onChange={(e) => setFormData({...formData, minutesPlayed: Number(e.target.value)})} className="bg-white dark:bg-slate-950"/></div>
                <div className="space-y-2"><Label>Voto (1-10)</Label><Input type="number" step="0.5" value={formData.rating} onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})} className="bg-white dark:bg-slate-950 border-indigo-200 focus:ring-indigo-500 font-bold text-center"/></div>
              </div>

              {/* Stats Specifiche */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 space-y-4">
                {isGoalkeeper ? (
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Parate</Label><Input type="number" value={formData.saves} onChange={(e) => setFormData({...formData, saves: Number(e.target.value)})} className="bg-white dark:bg-slate-950"/></div>
                      <div className="flex items-center justify-between mt-8"><Label>Clean Sheet</Label><Switch checked={formData.cleanSheet} onCheckedChange={(v) => setFormData({...formData, cleanSheet: v})} /></div>
                   </div>
                ) : (
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Gol</Label><Input type="number" value={formData.goals} onChange={(e) => setFormData({...formData, goals: Number(e.target.value)})} className="bg-white dark:bg-slate-950"/></div>
                      <div className="space-y-2"><Label>Assist</Label><Input type="number" value={formData.assists} onChange={(e) => setFormData({...formData, assists: Number(e.target.value)})} className="bg-white dark:bg-slate-950"/></div>
                   </div>
                )}
                
                {/* MODIFICA QUI: Switch più scuri e visibili */}
                <div className="flex justify-around pt-2">
                    <div className="flex items-center gap-2">
                        <Label className="text-xs uppercase font-bold text-yellow-700 dark:text-yellow-600">Giallo</Label>
                        <Switch 
                            checked={formData.yellowCard} 
                            onCheckedChange={(v) => setFormData({...formData, yellowCard: v})} 
                            className="data-[state=checked]:bg-yellow-600 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-700 border border-slate-300 dark:border-slate-600"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label className="text-xs uppercase font-bold text-red-700 dark:text-red-600">Rosso</Label>
                        <Switch 
                            checked={formData.redCard} 
                            onCheckedChange={(v) => setFormData({...formData, redCard: v})} 
                            className="data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-700 border border-slate-300 dark:border-slate-600"
                        />
                    </div>
                </div>
              </div>

              <div className="space-y-2"><Label>Note Partita</Label><Textarea placeholder="Prestazione solida, bravo nei duelli..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="bg-white dark:bg-slate-950"/></div>
              
              <Button onClick={handleSubmit} disabled={isPending} className="w-full font-bold">{isPending ? "Salvataggio..." : "Salva Partita"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="pt-6">
        {matchLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 italic">Nessuna partita registrata. Inizia il monitoraggio.</div>
        ) : (
            <div className="space-y-4">
                {matchLogs.map((log) => (
                    <div key={log.id} className="relative flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 hover:shadow-md transition-all group">
                        
                        {/* Voto e Data */}
                        <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-2 min-w-[80px]">
                            <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-black text-lg shadow-sm ${getRatingColor(log.rating)}`}>
                                {log.rating}
                            </div>
                            <div className="text-[10px] font-medium text-slate-400 text-center flex flex-col">
                                <span>{new Date(log.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</span>
                                <span className="hidden md:inline">{new Date(log.date).getFullYear()}</span>
                            </div>
                        </div>

                        {/* Info Partita */}
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">vs {log.opponent}</h4>
                                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{log.competition} • {log.minutesPlayed}' min</div>
                                </div>
                                {/* Badge Eventi */}
                                <div className="flex gap-1">
                                    {log.goals > 0 && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">{log.goals} G</Badge>}
                                    {log.assists > 0 && <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">{log.assists} A</Badge>}
                                    {log.saves > 0 && <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200">{log.saves} P</Badge>}
                                    {log.cleanSheet && <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"><ShieldAlert size={12} className="mr-1"/> CS</Badge>}
                                    {log.yellowCard && <div className="w-4 h-5 bg-yellow-500 rounded-sm shadow-sm" title="Ammonito"/>}
                                    {log.redCard && <div className="w-4 h-5 bg-red-600 rounded-sm shadow-sm" title="Espulso"/>}
                                </div>
                            </div>
                            
                            {/* Note */}
                            {log.notes && (
                                <div className="flex gap-2 items-start bg-slate-50 dark:bg-slate-900 p-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                                    <StickyNote size={14} className="mt-0.5 text-slate-400 shrink-0"/>
                                    <p className="line-clamp-2 group-hover:line-clamp-none transition-all">{log.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Azioni */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => handleDelete(log.id)}>
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
}