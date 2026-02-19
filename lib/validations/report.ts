import * as z from "zod";

export const reportSchema = z.object({
  playerName: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  playerAge: z.coerce.number().min(15).max(45),
  team: z.string().min(2, "Inserisci una squadra valida"),
  role: z.enum(["Portiere", "Difensore", "Centrocampista", "Attaccante"]),
  rating: z.coerce.number().min(1).max(10),
  notes: z.string().min(10, "La relazione deve essere più dettagliata"),
  // Per ora gestiamo le stats come numeri semplici
  pace: z.coerce.number().min(0).max(100),
  shooting: z.coerce.number().min(0).max(100),
  passing: z.coerce.number().min(0).max(100),
  dribbling: z.coerce.number().min(0).max(100),
  defending: z.coerce.number().min(0).max(100),
  physical: z.coerce.number().min(0).max(100),
});