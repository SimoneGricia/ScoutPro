"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createReport, updateReport } from "@/lib/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Activity, Save, X, Plus, ThumbsUp, ThumbsDown, Loader2, Footprints, Trophy, Check, ChevronsUpDown, Map, Hash, Trash2, ImagePlus, Banknote, CalendarDays, MonitorPlay, Youtube } from "lucide-react";import { cn } from "@/lib/utils";
import Image from "next/image";

const SPECIFIC_ROLES = ["Portiere", "Terzino", "Difensore centrale", "Mediano", "Regista", "Esterno", "Mezz'Ala", "Trequartista", "Ala", "Centravanti", "Seconda punta", "Falso nove"];
const COMMON_ATTRIBUTES = ["Determinazione", "Leadership", "Impegno", "Gioco di Squadra", "Carisma", "Professionalità", "Resistenza", "Velocità", "Forza Fisica", "Agilità", "Infortunio Facile"];
const ROLE_ATTRIBUTES: Record<string, string[]> = {
  "Portiere": ["Riflessi", "Presa", "Uscite Alte", "Uscite Basse", "Uno contro Uno", "Rinvio con i piedi", "Rinvio con le mani", "Comando Difesa", "Piazzamento", "Reattività"],
  "Difensore": ["Marcatura", "Contrasti", "Colpo di Testa", "Anticipo", "Posizionamento", "Concentrazione", "Intercetto", "Scivolata", "Impostazione", "Fisicità"],
  "Centrocampista": ["Visione di Gioco", "Passaggio Corto", "Passaggio Lungo", "Controllo Palla", "Inserimento", "Dinamismo", "Tiro da fuori", "Dribbling", "Recupero Palla", "Geometrie"],
  "Attaccante": ["Finalizzazione", "Tiro al volo", "Freddezza", "Movimento senza palla", "Fiuto del gol", "Dribbling", "Tiro a giro", "Colpo di testa", "Protezione palla", "Attacco della profondità"]
};
const SCOUT_TAGS = ["U21", "HighPotential", "LowCost", "FreeAgent", "Scadenza2025", "EU", "Non-EU", "Homegrown", "Leader", "Capitano", "InfortunioFacile", "Utilità", "Prestito", "TopPlayer", "Sottovalutato", "Rivendibile", "InstantImpact"].sort();

const formSchema = z.object({
  playerName: z.string().min(2, "Inserire il nome"),
  team: z.string().min(2, "Inserire la squadra"),
  mainRole: z.string(),
  specificRoles: z.array(z.string()).min(1, "Seleziona almeno un ruolo"),
  playerAge: z.coerce.number().min(10),
  height: z.coerce.number(),
  weight: z.coerce.number(),
  preferredFoot: z.enum(["Destro", "Sinistro", "Ambidestro"]),
  weakFoot: z.coerce.number().min(1).max(5),
  attributes: z.array(z.string()).optional(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  heatmapZones: z.array(z.string()),
  customTags: z.array(z.string()),
  imageUrl: z.string().optional(),
  videoLinks: z.array(z.string().url("Inserisci un URL valido")).optional(),
  
  // Campi nascosti o rimossi dalla UI ma mantenuti per sicurezza DB
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),

  // Match Stats (Nascoste, default 0)
  goals: z.coerce.number().optional(),
  assists: z.coerce.number().optional(),
  shots: z.coerce.number().optional(),
  passesCompleted: z.coerce.number().optional(),
  tacklesWon: z.coerce.number().optional(),
  minutesPlayed: z.coerce.number().optional(),
  saves: z.coerce.number().optional(),
  cleanSheets: z.coerce.number().optional(),

  // Season Stats
  seasonApps: z.coerce.number().min(0),
  seasonGoals: z.coerce.number().min(0),
  seasonAssists: z.coerce.number().min(0),
  seasonCleanSheets: z.coerce.number().min(0),
  seasonYellows: z.coerce.number().min(0),
  seasonReds: z.coerce.number().min(0),
  seasonAvgRating: z.coerce.number().min(1).max(10),

  pace: z.coerce.number(), shooting: z.coerce.number(), passing: z.coerce.number(), dribbling: z.coerce.number(), defending: z.coerce.number(), physical: z.coerce.number(),
  diving: z.coerce.number().optional(), handling: z.coerce.number().optional(), kicking: z.coerce.number().optional(), reflexes: z.coerce.number().optional(), gkPositioning: z.coerce.number().optional(), gkSpeed: z.coerce.number().optional(),
  
  rating: z.coerce.number().min(1).max(100),
  recommendation: z.enum(["Scartare", "Monitorare", "Acquistare"]),
  notes: z.string().min(10, "Inserisci una nota"),
  marketValue: z.coerce.number().min(0),
  salary: z.coerce.number().min(0),
  contractExpiry: z.string().optional(),
  agent: z.string().optional(),
  releaseClause: z.coerce.number().min(0),
});

interface ReportFormProps { initialData?: any; reportId?: string; }

export default function ReportForm({ initialData, reportId }: ReportFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openRoles, setOpenRoles] = useState(false);
  const [tempStrength, setTempStrength] = useState("");
  const [tempWeakness, setTempWeakness] = useState("");
  const [tempVideo, setTempVideo] = useState("");

  const defaultValues = initialData ? {
    ...initialData,
    contractExpiry: initialData.contractExpiry ? new Date(initialData.contractExpiry).toISOString().split('T')[0] : "",
    strengths: initialData.strengths || [], weaknesses: initialData.weaknesses || [], heatmapZones: initialData.heatmapZones || [], specificRoles: initialData.specificRoles || [], attributes: initialData.attributes || [], customTags: initialData.customTags || [], imageUrl: initialData.imageUrl || "", 
    videoLinks: initialData.videoLinks || [],
    marketValue: initialData.marketValue || 0, salary: initialData.salary || 0, releaseClause: initialData.releaseClause || 0,
    diving: initialData.diving || 50, handling: initialData.handling || 50, kicking: initialData.kicking || 50, reflexes: initialData.reflexes || 50, gkPositioning: initialData.gkPositioning || 50, gkSpeed: initialData.gkSpeed || 50,
    seasonApps: initialData.seasonApps || 0, seasonGoals: initialData.seasonGoals || 0, seasonAssists: initialData.seasonAssists || 0, seasonCleanSheets: initialData.seasonCleanSheets || 0, seasonYellows: initialData.seasonYellows || 0, seasonReds: initialData.seasonReds || 0, seasonAvgRating: initialData.seasonAvgRating || 6.0,
  } : {
    playerName: "", team: "", mainRole: "Centrocampista", specificRoles: [], attributes: [], strengths: [], weaknesses: [], heatmapZones: [], customTags: [], imageUrl: "", 
    videoLinks: [], 
    goals: 0, assists: 0, shots: 0, passesCompleted: 0, tacklesWon: 0, minutesPlayed: 0, saves: 0, cleanSheets: 0,
    seasonApps: 0, seasonGoals: 0, seasonAssists: 0, seasonCleanSheets: 0, seasonYellows: 0, seasonReds: 0, seasonAvgRating: 6.0,
    playerAge: 18, height: 180, weight: 75, preferredFoot: "Destro", weakFoot: 3,
    pace: 60, shooting: 60, passing: 60, dribbling: 60, defending: 60, physical: 60,
    diving: 60, handling: 60, kicking: 60, reflexes: 60, gkPositioning: 60, gkSpeed: 60,
    rating: 60, recommendation: "Monitorare", notes: "", marketValue: 0, salary: 0, contractExpiry: "", agent: "", releaseClause: 0,
  };

  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues });
  const selectedMainRole = form.watch("mainRole");
  const isGoalkeeper = selectedMainRole === "Portiere";
  const currentAttributes = [ ...(ROLE_ATTRIBUTES[selectedMainRole] || []), ...COMMON_ATTRIBUTES ].sort();

  const truncate = (str: string, n: number) => str.length > n ? str.slice(0, n) + "..." : str;
  const addItem = (field: "strengths" | "weaknesses" | "videoLinks", value: string, setTemp: any) => { if (!value.trim()) return; const current = form.getValues(field) || []; if (!current.includes(value)) { form.setValue(field, [...current, value], { shouldValidate: true, shouldDirty: true }); } setTemp(""); };
  const removeItem = (field: "strengths" | "weaknesses", value: string) => { const current = form.getValues(field) || []; form.setValue(field, current.filter((i) => i !== value), { shouldValidate: true, shouldDirty: true }); };
  const toggleArrayItem = (field: any, item: string) => { const current = field.value || []; current.includes(item) ? field.onChange(current.filter((val: string) => val !== item)) : field.onChange([...current, item]); };
  const toggleZone = (zoneId: string) => { const current = form.getValues("heatmapZones") || []; if (current.includes(zoneId)) { form.setValue("heatmapZones", current.filter(z => z !== zoneId), { shouldValidate: true, shouldDirty: true }); } else { form.setValue("heatmapZones", [...current, zoneId], { shouldValidate: true, shouldDirty: true }); } form.trigger("heatmapZones"); };
  const toggleTag = (tag: string) => { const current = form.getValues("customTags") || []; if (current.includes(tag)) { form.setValue("customTags", current.filter((t) => t !== tag), { shouldDirty: true }); } else { form.setValue("customTags", [...current, tag], { shouldDirty: true }); } };
  async function onSubmit(values: z.infer<typeof formSchema>) { startTransition(async () => { try { if (initialData && reportId) await updateReport(reportId, values); else await createReport(values); } catch (error) { console.error(error); } }); }
  const ZONES = Array.from({ length: 12 }, (_, i) => `zone_${i + 1}`);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{initialData ? "Modifica Report" : "Nuovo Report"}</h1>
            <p className="text-muted-foreground">{initialData ? "Aggiorna i dati del giocatore." : "Crea una nuova scheda tecnica."}</p>
        </div>
        <Button variant="outline" onClick={() => router.back()} className="hover:bg-slate-100 dark:hover:bg-slate-800 dark:border-slate-700 cursor-pointer"><X size={16} className="mr-2"/> Annulla</Button>
      </div>
      <Separator className="dark:bg-slate-800" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-7 space-y-6">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                    <CardHeader className="border-b dark:border-slate-800 pb-2"><CardTitle className="text-sm uppercase text-slate-500 dark:text-slate-400">Foto Profilo</CardTitle></CardHeader>
                    <CardContent className="p-4 flex justify-center"><FormField control={form.control} name="imageUrl" render={({ field }) => (<FormItem className="w-full">{field.value ? (<div className="relative w-full aspect-video md:w-64 md:h-64 mx-auto rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 group"><Image src={field.value} alt="Foto" fill className="object-cover"/><Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 shadow-md z-10 cursor-pointer hover:scale-110 transition-transform" onClick={() => field.onChange("")}><Trash2 size={16} /></Button></div>) : (<div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center group cursor-pointer"><div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300"><ImagePlus size={28} className="text-primary/70" /></div><div className="space-y-1 mb-5"><p className="text-sm font-bold text-slate-700 dark:text-slate-300">Carica foto giocatore</p><p className="text-xs text-slate-500">Trascina o clicca</p></div><UploadButton endpoint="imageUploader" onClientUploadComplete={(res) => { if (res && res[0]) field.onChange(res[0].url); }} onUploadError={(error: Error) => alert(`ERRORE: ${error.message}`)} appearance={{ button: "bg-white dark:bg-slate-800 !text-slate-900 dark:!text-white !border-2 !border-slate-900 dark:!border-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider shadow-sm transition-all duration-300 !cursor-pointer hover:scale-105", allowedContent: "hidden" }} content={{ button: "SCEGLI FILE" }} /></div>)}</FormItem>)}/></CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm dark:bg-slate-900">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-4"><CardTitle className="text-lg">Profilo</CardTitle></CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="playerName" render={({ field }) => ( <FormItem className="col-span-2 md:col-span-1"><FormLabel>Nome</FormLabel><FormControl><Input {...field} className="dark:bg-slate-950 dark:border-slate-700" /></FormControl><FormMessage/></FormItem> )}/>
                         <FormField control={form.control} name="team" render={({ field }) => ( <FormItem className="col-span-2 md:col-span-1"><FormLabel>Squadra</FormLabel><FormControl><Input {...field} className="dark:bg-slate-950 dark:border-slate-700" /></FormControl><FormMessage/></FormItem> )}/>
                        <div className="col-span-2 grid grid-cols-3 gap-4">
                            <FormField control={form.control} name="playerAge" render={({ field }) => <FormItem><FormLabel>Età</FormLabel><FormControl><Input type="number" {...field} className="dark:bg-slate-950 dark:border-slate-700" /></FormControl></FormItem>}/>
                            <FormField control={form.control} name="height" render={({ field }) => <FormItem><FormLabel>Altezza (cm)</FormLabel><FormControl><Input type="number" {...field} className="dark:bg-slate-950 dark:border-slate-700" /></FormControl></FormItem>}/>
                            <FormField control={form.control} name="weight" render={({ field }) => <FormItem><FormLabel>Peso (kg)</FormLabel><FormControl><Input type="number" {...field} className="dark:bg-slate-950 dark:border-slate-700" /></FormControl></FormItem>}/>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm dark:bg-slate-900">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-4"><CardTitle className="text-lg">Ruoli</CardTitle></CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <FormField control={form.control} name="mainRole" render={({ field }) => (<FormItem><FormLabel>Ruolo Principale</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="cursor-pointer dark:bg-slate-950 dark:border-slate-700"><SelectValue/></SelectTrigger></FormControl><SelectContent>{Object.keys(ROLE_ATTRIBUTES).map(r => <SelectItem key={r} value={r} className="cursor-pointer">{r}</SelectItem>)}</SelectContent></Select></FormItem>)}/>
                         <FormField control={form.control} name="specificRoles" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Ruoli Specifici</FormLabel><Popover open={openRoles} onOpenChange={setOpenRoles}><PopoverTrigger asChild><FormControl><Button variant="outline" role="combobox" className={cn("w-full justify-between cursor-pointer dark:bg-slate-950 dark:border-slate-700", !field.value && "text-muted-foreground")}>{field.value?.length > 0 ? `${field.value.length} selezionati` : "Seleziona..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-[300px] p-0" align="start"><Command><CommandInput placeholder="Cerca..." /><CommandList><CommandEmpty>Nessun ruolo.</CommandEmpty><CommandGroup>{SPECIFIC_ROLES.map((role) => (<CommandItem key={role} value={role} onSelect={() => toggleArrayItem(field, role)} className="cursor-pointer"><Check className={cn("mr-2 h-4 w-4", field.value?.includes(role) ? "opacity-100" : "opacity-0")} />{role}</CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent></Popover><div className="flex flex-wrap gap-2 mt-2">{(field.value || []).map((role: string) => (<Badge key={role} variant="secondary" className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-800 transition-colors" onClick={() => toggleArrayItem(field, role)}>{role} <X size={14} className="ml-1 text-slate-400 hover:text-red-600" /></Badge>))}</div><FormMessage/></FormItem>)}/>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm dark:bg-slate-900">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-4"><div className="flex items-center gap-2 text-green-700 dark:text-green-500"><Map size={20} /> <CardTitle className="text-lg">Heatmap & Zone</CardTitle></div></CardHeader>
                    <CardContent className="pt-6"><FormField control={form.control} name="heatmapZones" render={({ field }) => (<FormItem><FormLabel className="block mb-2 text-center text-slate-500 dark:text-slate-400 text-xs uppercase">Clicca sulle zone occupate (Attacco in alto)</FormLabel><div className="relative w-full max-w-[200px] mx-auto aspect-[2/3] bg-green-100 dark:bg-green-950/30 border-2 border-green-800 dark:border-green-600 rounded-lg overflow-hidden select-none shadow-sm"><div className="absolute top-1/2 left-0 w-full h-0.5 bg-green-800/20 dark:bg-green-400/20" /><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-green-800/20 dark:border-green-400/20 rounded-full" /><div className="grid grid-cols-3 grid-rows-4 h-full w-full relative z-10">{ZONES.map((zone) => (<div key={zone} onClick={() => toggleZone(zone)} className={cn("border border-green-800/10 dark:border-green-400/10 flex items-center justify-center transition-all duration-200 cursor-pointer hover:bg-green-600/20 active:scale-95", (field.value || []).includes(zone) ? "bg-red-500/60 hover:bg-red-500/70" : "")}>{(field.value || []).includes(zone) && <div className="w-2 h-2 bg-red-200 rounded-full blur-[2px]" />}</div>))}</div></div></FormItem>)}/></CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm dark:bg-slate-900">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500"><CalendarDays size={20} /> <CardTitle className="text-lg">Rendimento Stagionale</CardTitle></div>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField control={form.control} name="seasonApps" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-slate-500">Presenze</FormLabel><FormControl><Input type="number" {...field} className="dark:bg-slate-950 dark:border-slate-700" /></FormControl></FormItem>)}/>
                        <FormField control={form.control} name="seasonAvgRating" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-slate-500">Media Voto</FormLabel><FormControl><Input type="number" step="0.1" {...field} className="dark:bg-slate-950 dark:border-slate-700" /></FormControl></FormItem>)}/>
                        {isGoalkeeper ? (<FormField control={form.control} name="seasonCleanSheets" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-slate-500">Clean Sheets</FormLabel><FormControl><Input type="number" {...field} className="dark:bg-slate-950 dark:border-slate-700" /></FormControl></FormItem>)} />) : (<><FormField control={form.control} name="seasonGoals" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-slate-500">Gol Totali</FormLabel><FormControl><Input type="number" {...field} className="dark:bg-slate-950 dark:border-slate-700" /></FormControl></FormItem>)}/><FormField control={form.control} name="seasonAssists" render={({ field }) => (<FormItem><FormLabel className="text-[10px] font-bold uppercase text-slate-500">Assist Totali</FormLabel><FormControl><Input type="number" {...field} className="dark:bg-slate-950 dark:border-slate-700" /></FormControl></FormItem>)}/></>)}
                        <div className="flex gap-2 col-span-2 md:col-span-1"><FormField control={form.control} name="seasonYellows" render={({ field }) => (<FormItem className="w-full"><FormLabel className="text-[10px] font-bold uppercase text-slate-500">Gialli</FormLabel><FormControl><div className="relative"><Input type="number" {...field} className="dark:bg-slate-950 dark:border-slate-700 pl-7" /><div className="absolute left-2 top-2.5 w-3 h-4 bg-yellow-400 rounded-sm"></div></div></FormControl></FormItem>)}/><FormField control={form.control} name="seasonReds" render={({ field }) => (<FormItem className="w-full"><FormLabel className="text-[10px] font-bold uppercase text-slate-500">Rossi</FormLabel><FormControl><div className="relative"><Input type="number" {...field} className="dark:bg-slate-950 dark:border-slate-700 pl-7" /><div className="absolute left-2 top-2.5 w-3 h-4 bg-red-500 rounded-sm"></div></div></FormControl></FormItem>)}/></div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm dark:bg-slate-900">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-4 flex justify-between items-center"><CardTitle className="text-lg">Attributi</CardTitle><Badge variant="outline" className="text-[10px] bg-white dark:bg-slate-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">Template: {selectedMainRole}</Badge></CardHeader>
                    <CardContent className="pt-6"><FormField control={form.control} name="attributes" render={({ field }) => (<FormItem><div className="flex flex-wrap gap-2 h-64 overflow-y-auto p-2 border rounded-md bg-slate-50 dark:bg-slate-950 dark:border-slate-800">{currentAttributes.map((attr) => (<Badge key={attr} variant={(field.value || []).includes(attr) ? "default" : "outline"} className={`px-2 py-1 text-xs cursor-pointer transition-all duration-200 select-none hover:scale-105 active:scale-95 ${(field.value || []).includes(attr) ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`} onClick={() => toggleArrayItem(field, attr)}>{(field.value || []).includes(attr) ? "✓ " : <Plus size={10} className="mr-1 inline"/>}{attr}</Badge>))}</div></FormItem>)}/></CardContent>
                </Card>
                
                 <Card className="border-slate-200 dark:border-slate-800 shadow-sm dark:bg-slate-900">
                    <CardContent className="pt-6"><FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Note Osservatore</FormLabel><FormControl><Textarea rows={5} {...field} className="dark:bg-slate-950 dark:border-slate-700" /></FormControl><FormMessage/></FormItem>)}/></CardContent>
                </Card>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-5 space-y-6">
                
                <Card className="border-indigo-100 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-900/10 overflow-visible z-20 relative"><CardHeader className="pb-2"><div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400"><Hash size={18} /> <span className="font-bold text-sm uppercase">Smart Tags</span></div></CardHeader><CardContent><FormField control={form.control} name="customTags" render={({ field }) => (<FormItem><div className="flex flex-wrap gap-2">{SCOUT_TAGS.map((tag) => { const isSelected = (field.value || []).includes(tag); return ( <Badge key={tag} variant={isSelected ? "default" : "outline"} className={`transition-all duration-200 cursor-pointer select-none hover:scale-105 active:scale-95 ${isSelected ? "bg-indigo-600 hover:bg-indigo-700 border-indigo-600" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"}`} onClick={() => toggleTag(tag)}>#{tag}</Badge> ); })}</div></FormItem>)}/></CardContent></Card>

                {/* MEDIA GALLERY (VIDEO) */}
                <Card className="border-sky-200 dark:border-sky-900 bg-sky-50/30 dark:bg-sky-900/10 overflow-visible z-20 relative">
                    <CardHeader className="pb-2 border-b border-sky-100 dark:border-sky-900"><div className="flex items-center gap-2 text-sky-700 dark:text-sky-400"><MonitorPlay size={18} /> <span className="font-bold text-sm uppercase">Video Highlights</span></div></CardHeader>
                    <CardContent className="pt-4">
                        <FormField control={form.control} name="videoLinks" render={({ field }) => (
                            <FormItem>
                                <div className="flex gap-2">
                                    <Input placeholder="Incolla link YouTube/Vimeo..." value={tempVideo} onChange={(e) => setTempVideo(e.target.value)} onKeyDown={(e) => {if(e.key === 'Enter') {e.preventDefault(); addItem("videoLinks", tempVideo, setTempVideo);}}} className="bg-white dark:bg-slate-950 dark:border-sky-900/50" />
                                    <Button type="button" onClick={() => addItem("videoLinks", tempVideo, setTempVideo)} className="bg-sky-600 hover:bg-sky-700 cursor-pointer text-white"><Plus size={16}/></Button>
                                </div>
                                <div className="flex flex-col gap-2 mt-3">
                                    {(field.value || []).map((link, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300">
                                            <div className="flex items-center gap-2 overflow-hidden"><div className="bg-red-500 text-white p-1 rounded"><Youtube size={12}/></div><span className="truncate max-w-[200px]">{link}</span></div>
                                            <button type="button" onClick={() => {const current = form.getValues("videoLinks") || []; form.setValue("videoLinks", current.filter((l) => l !== link), { shouldDirty: true });}} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                                        </div>
                                    ))}
                                    {(field.value || []).length === 0 && (<p className="text-xs text-slate-400 italic text-center py-2">Nessun video aggiunto.</p>)}
                                </div>
                            </FormItem>
                        )}/>
                    </CardContent>
                </Card>

                <Card className="border-emerald-100 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-900/10 overflow-visible z-20 relative">
                    <CardHeader className="pb-2 border-b border-emerald-100 dark:border-emerald-900"><div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400"><Banknote size={18} /> <span className="font-bold text-sm uppercase">Dati Economici</span></div></CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4"><FormField control={form.control} name="marketValue" render={({ field }) => (<FormItem><FormLabel className="text-xs">Valore (Mln €)</FormLabel><FormControl><Input type="number" step="0.1" {...field} className="bg-white dark:bg-slate-950 dark:border-emerald-900/50" /></FormControl></FormItem>)}/><FormField control={form.control} name="salary" render={({ field }) => (<FormItem><FormLabel className="text-xs">Ingaggio (Mln €)</FormLabel><FormControl><Input type="number" step="0.1" {...field} className="bg-white dark:bg-slate-950 dark:border-emerald-900/50" /></FormControl></FormItem>)}/></div><FormField control={form.control} name="contractExpiry" render={({ field }) => (<FormItem><FormLabel className="text-xs">Scadenza Contratto</FormLabel><div className="relative"><CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><FormControl><Input type="date" {...field} className="pl-9 bg-white dark:bg-slate-950 dark:border-emerald-900/50 cursor-pointer" /></FormControl></div></FormItem>)}/><div className="grid grid-cols-2 gap-4"><FormField control={form.control} name="releaseClause" render={({ field }) => (<FormItem><FormLabel className="text-xs">Clausola (Mln €)</FormLabel><FormControl><Input type="number" step="0.1" {...field} className="bg-white dark:bg-slate-950 dark:border-emerald-900/50" /></FormControl></FormItem>)}/><FormField control={form.control} name="agent" render={({ field }) => (<FormItem><FormLabel className="text-xs">Agente/Agenzia</FormLabel><FormControl><Input {...field} className="bg-white dark:bg-slate-950 dark:border-emerald-900/50" placeholder="Es. Raiola" /></FormControl></FormItem>)}/></div>
                    </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 gap-4"><Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-900/20"><CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2"><ThumbsUp size={16}/> PUNTI DI FORZA</CardTitle></CardHeader><CardContent><FormField control={form.control} name="strengths" render={({ field }) => (<FormItem><div className="flex gap-2"><Input placeholder="Es. Colpo di testa" value={tempStrength} onChange={(e) => setTempStrength(e.target.value)} onKeyDown={(e) => {if(e.key === 'Enter') {e.preventDefault(); addItem("strengths", tempStrength, setTempStrength);}}} className="bg-white dark:bg-slate-950 dark:border-emerald-900" /><Button type="button" onClick={() => addItem("strengths", tempStrength, setTempStrength)} className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"><Plus size={16}/></Button></div><div className="flex flex-col gap-2 mt-3">{(field.value || []).map((item, i) => (<Badge key={i} title={item} className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-900 border-emerald-200 dark:border-emerald-800 pl-3 pr-2 py-2 text-sm justify-between w-full h-auto whitespace-normal text-left break-words leading-tight group cursor-default"><span className="truncate pr-2">{truncate(item, 60)}</span><button type="button" className="ml-auto hover:bg-emerald-300 dark:hover:bg-emerald-700 rounded-full p-1 shrink-0 cursor-pointer transition-colors" onClick={() => removeItem("strengths", item)}><X size={14} /></button></Badge>))}</div></FormItem>)}/></CardContent></Card><Card className="border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-900/20"><CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2"><ThumbsDown size={16}/> PUNTI DI DEBOLEZZA</CardTitle></CardHeader><CardContent><FormField control={form.control} name="weaknesses" render={({ field }) => (<FormItem><div className="flex gap-2"><Input placeholder="Es. Piede debole" value={tempWeakness} onChange={(e) => setTempWeakness(e.target.value)} onKeyDown={(e) => {if(e.key === 'Enter') {e.preventDefault(); addItem("weaknesses", tempWeakness, setTempWeakness);}}} className="bg-white dark:bg-slate-950 dark:border-red-900" /><Button type="button" onClick={() => addItem("weaknesses", tempWeakness, setTempWeakness)} className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"><Plus size={16}/></Button></div><div className="flex flex-col gap-2 mt-3">{(field.value || []).map((item, i) => (<Badge key={i} title={item} className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900 border-red-200 dark:border-red-800 pl-3 pr-2 py-2 text-sm justify-between w-full h-auto whitespace-normal text-left break-words leading-tight group cursor-default"><span className="truncate pr-2">{truncate(item, 60)}</span><button type="button" className="ml-auto hover:bg-red-300 dark:hover:bg-red-700 rounded-full p-1 shrink-0 cursor-pointer transition-colors" onClick={() => removeItem("weaknesses", item)}><X size={14} /></button></Badge>))}</div></FormItem>)}/></CardContent></Card></div>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-visible z-30 relative dark:bg-slate-900"><CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-4"><div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500"><Footprints size={20} /> <CardTitle className="text-lg">Tecnica</CardTitle></div></CardHeader><CardContent className="pt-6 space-y-6"><FormField control={form.control} name="preferredFoot" render={({ field }) => (<FormItem><FormLabel>Piede Preferito</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="bg-white dark:bg-slate-950 dark:border-slate-700 cursor-pointer"><SelectValue /></SelectTrigger></FormControl><SelectContent position="popper"><SelectItem value="Destro" className="cursor-pointer">Destro</SelectItem><SelectItem value="Sinistro" className="cursor-pointer">Sinistro</SelectItem><SelectItem value="Ambidestro" className="cursor-pointer">Ambidestro</SelectItem></SelectContent></Select></FormItem>)}/><FormField control={form.control} name="weakFoot" render={({ field }) => (<FormItem><FormLabel>Piede Debole ({field.value}/5)</FormLabel><div className="flex gap-2">{[1, 2, 3, 4, 5].map((star) => (<button type="button" key={star} onClick={() => field.onChange(star)} className={`w-8 h-8 rounded-md border transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 flex items-center justify-center ${field.value >= star ? 'bg-emerald-500 border-emerald-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 dark:border-slate-700'}`}>★</button>))}</div></FormItem>)}/></CardContent></Card>

                <Card className="border-indigo-100 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-900/10 overflow-visible z-20 relative"><CardHeader className="pb-2"><div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400"><Trophy size={18} /> <span className="font-bold text-sm uppercase">Valutazione</span></div></CardHeader><CardContent className="space-y-6"><FormField control={form.control} name="rating" render={({ field }) => (<FormItem><FormLabel>Rating (1-100)</FormLabel><div className="flex items-center gap-4"><FormControl><Input type="number" min={1} max={100} {...field} className="text-4xl font-bold h-20 w-32 text-center bg-white dark:bg-slate-950 border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-300 shadow-sm" /></FormControl><div className={`h-4 rounded-full flex-1 transition-all ${field.value >= 80 ? 'bg-emerald-500' : field.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} /></div><FormMessage/></FormItem>)}/><FormField control={form.control} name="recommendation" render={({ field }) => (<FormItem><FormLabel>Verdetto Scout</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className={cn("font-bold transition-colors cursor-pointer", field.value === "Acquistare" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800" : field.value === "Monitorare" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800" : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800")}><SelectValue /></SelectTrigger></FormControl><SelectContent position="popper"><SelectItem value="Acquistare" className="text-emerald-700 dark:text-emerald-400 font-bold cursor-pointer">★ ACQUISTARE</SelectItem><SelectItem value="Monitorare" className="text-amber-700 dark:text-amber-400 font-bold cursor-pointer">● MONITORARE</SelectItem><SelectItem value="Scartare" className="text-red-700 dark:text-red-400 font-bold cursor-pointer">✖ SCARTARE</SelectItem></SelectContent></Select></FormItem>)}/></CardContent></Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm z-10 relative dark:bg-slate-900"><CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-4"><div className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><Activity size={20} /> <CardTitle className="text-lg">{isGoalkeeper ? "Parametri Portiere" : "Parametri Giocatore"}</CardTitle></div></CardHeader><CardContent className="pt-6 grid grid-cols-2 gap-3">{(isGoalkeeper ? ["diving", "handling", "kicking", "reflexes", "gkPositioning", "gkSpeed"] : ["pace", "shooting", "passing", "dribbling", "defending", "physical"]).map((stat) => (<FormField key={stat} control={form.control} name={stat as any} render={({ field }) => (<FormItem><FormLabel className="capitalize text-[10px] font-bold text-slate-500 dark:text-slate-400">{stat === "pace" && "Velocità"} {stat === "shooting" && "Tiro"} {stat === "passing" && "Passaggio"} {stat === "dribbling" && "Dribbling"} {stat === "defending" && "Difesa"} {stat === "physical" && "Fisico"} {stat === "diving" && "Tuffo"} {stat === "handling" && "Presa"} {stat === "kicking" && "Rinvio"} {stat === "reflexes" && "Reattività"} {stat === "gkPositioning" && "Posizionamento"} {stat === "gkSpeed" && "Velocità"}</FormLabel><FormControl><div className="relative"><Input type="number" {...field} className="h-8 text-sm dark:bg-slate-950 dark:border-slate-700" /><div className="absolute bottom-0 left-0 h-0.5 bg-slate-800/20 dark:bg-slate-500/50" style={{ width: `${Math.min(Number(field.value), 100)}%` }} /></div></FormControl></FormItem>)}/>))}</CardContent></Card>

                <Button disabled={isPending} type="submit" size="lg" className="w-full h-14 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 mt-8 mb-8 cursor-pointer hover:scale-[1.01] transition-transform">
                    {isPending ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2" size={20} />}
                    {initialData ? "Aggiorna Report" : "Salva Report"}
                </Button>

            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}