"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { createBulkReports } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Loader2, FileSpreadsheet } from "lucide-react";

export default function ExcelImport() {
  const [loading, setLoading] = useState(false);

  // Funzione helper per pulire e convertire i numeri (gestisce virgole e punti)
  const parseNumber = (val: any, defaultVal: number = 0) => {
    if (val === null || val === undefined || val === "") return defaultVal;
    if (typeof val === "number") return val;
    // Sostituisce virgola con punto e converte
    const stringVal = String(val).replace(",", ".");
    const num = parseFloat(stringVal);
    return isNaN(num) ? defaultVal : num;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Mappa i dati Excel (Colonne Italiane) -> DB (Campi Inglesi)
        const formattedData = data.map((row: any) => ({
            playerName: row.Nome,
            team: row.Squadra,
            mainRole: row.Ruolo,
            specificRoles: row.Ruoli_Specifici ? String(row.Ruoli_Specifici).split(",") : [row.Ruolo],
            
            playerAge: parseNumber(row.Eta, 18),
            height: parseNumber(row.Altezza, 180),
            weight: parseNumber(row.Peso, 75),
            preferredFoot: row.Piede || "Destro",
            weakFoot: parseNumber(row.Piede_Debole, 3), // Usa parseNumber qui
            
            rating: parseNumber(row.Rating, 60),
            marketValue: parseNumber(row.Valore, 0),
            salary: parseNumber(row.Ingaggio, 0), // E qui per i decimali
            releaseClause: parseNumber(row.Clausola, 0),
            contractExpiry: row.Scadenza ? new Date(row.Scadenza) : null,
            agent: row.Agente || "",
            
            recommendation: row.Verdetto || "Monitorare",
            notes: row.Note || "Importato da Excel",

            // Stats Movimento
            pace: parseNumber(row.Velocita, 50),
            shooting: parseNumber(row.Tiro, 50),
            passing: parseNumber(row.Passaggio, 50),
            dribbling: parseNumber(row.Dribbling, 50),
            defending: parseNumber(row.Difesa, 50),
            physical: parseNumber(row.Fisico, 50),

            // Stats Portiere
            diving: parseNumber(row.Tuffo, 50),
            handling: parseNumber(row.Presa, 50),
            kicking: parseNumber(row.Rinvio, 50),
            reflexes: parseNumber(row.Riflessi, 50),
            gkPositioning: parseNumber(row.Posiz_GK, 50),
            gkSpeed: parseNumber(row.Velocita_GK, 50),
        }));

        await createBulkReports(formattedData);
        alert(`Importazione completata: ${formattedData.length} giocatori aggiunti.`);
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Errore durante l'importazione. Controlla che il file Excel non sia corrotto.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="relative inline-block">
        <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileUpload} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            disabled={loading}
        />
        <Button size="icon" variant="outline" disabled={loading} className="w-10 h-10 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
            {loading ? <Loader2 className="animate-spin" size={18}/> : <FileSpreadsheet size={18} />}
        </Button>
    </div>
  );
}