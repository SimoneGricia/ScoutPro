"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteReport } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportActionsProps {
  id: string;
}

export default function ReportActions({ id }: ReportActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Sei sicuro di voler eliminare questo report? L'azione è irreversibile.")) {
      startTransition(async () => {
        await deleteReport(id);
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* PULSANTE MODIFICA VISIBILE */}
      <Button 
        variant="outline" 
        onClick={() => router.push(`/report/${id}/edit`)}
        className="hidden md:flex gap-2 bg-white text-slate-900 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700 transition-colors shadow-sm"
      >
        <Edit size={16} /> Modifica
      </Button>

      {/* MENU DROPDOWN PER MOBILE O AZIONI EXTRA */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 data-[state=open]:bg-muted hover:bg-slate-100 dark:hover:bg-slate-800">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Apri menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px] dark:bg-slate-900 dark:border-slate-800">
          <DropdownMenuItem onClick={() => router.push(`/report/${id}/edit`)} className="cursor-pointer dark:focus:bg-slate-800 dark:text-slate-200 md:hidden">
            <Edit className="mr-2 h-4 w-4" /> Modifica
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDelete} 
            disabled={isPending}
            className="text-red-600 dark:text-red-400 cursor-pointer dark:focus:bg-red-950/20"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Elimina
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}