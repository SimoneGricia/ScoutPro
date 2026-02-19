"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 px-0 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title="Cambia Tema"
    >
      {/* Icona SOLE: Visibile in Light Mode, ruota e sparisce in Dark Mode */}
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      
      {/* Icona LUNA: Invisibile in Light Mode, ruota e appare in Dark Mode */}
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      
      <span className="sr-only">Cambia tema</span>
    </Button>
  )
}