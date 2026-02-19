"use client";

import { useState, useTransition, useEffect } from "react";
import { getReports, updatePlayerStatus } from "@/lib/actions";
import { ScoutReport } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Columns, CheckCircle2, XCircle, Search, Handshake, UserPlus, Plus, X } from "lucide-react";
import Link from "next/link";
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, useSensor, useSensors, PointerSensor, TouchSensor } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const COLUMNS_CONFIG = [
    { id: "Da Osservare", label: "Da Osservare", icon: Search, color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
    { id: "Trattativa", label: "Trattativa", icon: Handshake, color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900" },
    { id: "Acquistato", label: "Acquistato", icon: CheckCircle2, color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" },
    { id: "Scartato", label: "Scartato", icon: XCircle, color: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900" },
];

function DraggableCard({ report, overlay = false, onRemove }: { report: ScoutReport, overlay?: boolean, onRemove?: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: report.id,
        data: { report }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.3 : 1,
        cursor: overlay ? 'grabbing' : 'grab',
        touchAction: 'none',
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="relative group/card">
            <Card className={`shadow-sm transition-all bg-white dark:bg-slate-900 border-l-4 border-l-transparent hover:border-l-indigo-500 border-slate-200 dark:border-slate-800 ${overlay ? "shadow-xl rotate-2 scale-105 border-indigo-500" : ""}`}>
                <CardContent className="p-2.5 space-y-2">
                    
                    {!overlay && onRemove && (
                        <button 
                            className="absolute top-1 right-1 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-full transition-colors opacity-0 group-hover/card:opacity-100"
                            onClick={(e) => { e.stopPropagation(); onRemove(report.id); }}
                            onPointerDown={(e) => e.stopPropagation()}
                            title="Rimuovi dalla pipeline"
                        >
                            <X size={14} />
                        </button>
                    )}

                    <div className="flex items-center gap-3 pr-4">
                        <Avatar className="h-9 w-9 border border-slate-100 dark:border-slate-700 pointer-events-none">
                            <AvatarImage src={report.imageUrl || ""} className="object-cover" />
                            <AvatarFallback className="text-xs dark:bg-slate-800 dark:text-slate-300">{report.rating}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <div className="font-bold text-sm truncate leading-tight dark:text-slate-200">{report.playerName}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">{report.team}</div>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-1.5 rounded pointer-events-none">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{report.rating} OVR</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">€{report.marketValue}M</span>
                    </div>

                    <div className="pt-1">
                        <Link href={`/report/${report.id}`} onPointerDown={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="w-full text-[10px] h-6 border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">Vedi Scheda</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function DroppableColumn({ col, children }: { col: typeof COLUMNS_CONFIG[0], children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id: col.id });

    return (
        <div ref={setNodeRef} className={`min-w-[288px] w-72 flex flex-col h-full rounded-xl transition-colors ${isOver ? "bg-indigo-50/50 dark:bg-indigo-900/20 ring-2 ring-indigo-200 dark:ring-indigo-800" : ""}`}>
            <div className={`p-2.5 rounded-t-xl border-t border-x border-b-0 flex items-center justify-between font-bold ${col.color} sticky top-0 z-10`}>
                <div className="flex items-center gap-2 text-sm"><col.icon size={14} /> {col.label}</div>
                <Badge variant="secondary" className="bg-white/50 dark:bg-black/20 text-xs px-1.5 h-5">{Array.isArray(children) ? children.length : 0}</Badge>
            </div>
            <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/50 border dark:border-slate-800 rounded-b-xl p-2 space-y-2 overflow-y-auto">
                {children}
                {(!children || (Array.isArray(children) && children.length === 0)) && (
                    <div className="text-center py-10 text-slate-300 dark:text-slate-600 text-xs italic h-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg m-1">Trascina qui</div>
                )}
            </div>
        </div>
    );
}

export default function PipelinePage() {
  const [reports, setReports] = useState<ScoutReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState<ScoutReport | null>(null);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  useEffect(() => { getReports().then((data: any) => setReports(data)); }, []);

  const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragItem(null);
      if (!over) return;
      const reportId = active.id as string;
      const newStatus = over.id as string;
      const report = reports.find(r => r.id === reportId);
      if (report && report.status !== newStatus) {
          setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
          startTransition(async () => { await updatePlayerStatus(reportId, newStatus); });
      }
  };

  const handleDragStart = (event: any) => {
      const reportId = event.active.id;
      const report = reports.find(r => r.id === reportId);
      if (report) setActiveDragItem(report);
  };

  const addToPipeline = (id: string) => {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: "Da Osservare" } : r));
      startTransition(async () => { await updatePlayerStatus(id, "Da Osservare"); });
  };

  const removeFromPipeline = (id: string) => {
      if(!confirm("Rimuovere il giocatore dalla pipeline?")) return;
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: null } : r));
      startTransition(async () => { await updatePlayerStatus(id, null); });
  };

  const pipelineReports = reports.filter(r => r.status !== null && r.status !== undefined);
  const availableReports = reports.filter(r => (r.status === null || r.status === undefined) && r.playerName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col pb-4">
        <div className="flex justify-between items-center mb-6 px-1">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                    <Columns className="text-indigo-600 dark:text-indigo-400" /> Scouting Pipeline
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Trascina i giocatori per cambiare stato ({pipelineReports.length} attivi).</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:shadow-md transition-all cursor-pointer font-bold shadow-sm">
                        <UserPlus size={18} /> Aggiungi Giocatore
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] flex flex-col dark:bg-slate-900 dark:border-slate-800">
                    <DialogHeader><DialogTitle>Aggiungi alla Pipeline</DialogTitle></DialogHeader>
                    <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Cerca giocatore..." className="pl-9 dark:bg-slate-800 dark:border-slate-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                            {availableReports.length > 0 ? (
                                availableReports.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-3 border dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8"><AvatarImage src={p.imageUrl || ""} className="object-cover"/><AvatarFallback>{p.rating}</AvatarFallback></Avatar>
                                            <div><div className="font-bold text-sm dark:text-slate-200">{p.playerName}</div><div className="text-xs text-slate-500 dark:text-slate-400">{p.team}</div></div>
                                        </div>
                                        <Button size="sm" variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 cursor-pointer" onClick={() => { addToPipeline(p.id); setIsDialogOpen(false); setSearchTerm(""); }}>
                                            <Plus size={18} />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-400 text-sm">Nessun giocatore disponibile.</div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto flex-1 pb-4 items-start">
                {COLUMNS_CONFIG.map((col) => (
                    <DroppableColumn key={col.id} col={col}>
                        {pipelineReports.filter(r => r.status === col.id).map(report => (
                            <DraggableCard key={report.id} report={report} onRemove={removeFromPipeline} />
                        ))}
                    </DroppableColumn>
                ))}
            </div>
            <DragOverlay>{activeDragItem ? <DraggableCard report={activeDragItem} overlay /> : null}</DragOverlay>
        </DndContext>
    </div>
  );
}