"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface DownloadPdfProps {
  reportName: string;
  targetId: string;
}

export default function DownloadPdf({ reportName, targetId }: DownloadPdfProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    setIsGenerating(true);

    try {
      // Attendi che le immagini siano caricate
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2, // Migliora qualità
        useCORS: true, // Permette immagini esterne
        backgroundColor: "#ffffff", // Forza sfondo bianco nel PDF
        ignoreElements: (element) => element.id === "no-print", // Ignora elementi non voluti
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      // Se l'immagine è troppo lunga, gestisci multipagina (semplificato qui a una pagina fit)
      const finalWidth = 190; // A4 width minus margins
      const finalHeight = (imgHeight * finalWidth) / imgWidth;

      pdf.addImage(imgData, "PNG", 10, 10, finalWidth, finalHeight);
      pdf.save(`${reportName.replace(/\s+/g, "_")}_Report.pdf`);
    } catch (error) {
      console.error("Errore generazione PDF:", error);
      alert("Errore durante la generazione del PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
        variant="outline" 
        onClick={handleDownload} 
        disabled={isGenerating}
        className="gap-2 bg-white text-slate-900 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700 transition-colors shadow-sm"
    >
      {isGenerating ? <Loader2 size={16} className="animate-spin"/> : <FileDown size={16} />}
      {isGenerating ? "Generazione..." : "PDF"}
    </Button>
  );
}