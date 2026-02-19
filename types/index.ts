export interface ScoutReportStats {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  }
  
  export interface ScoutReport {
    id: string;
    matchDate: string;
    playerName: string;
    team: string;
    
    // Anagrafica Base
    playerAge: number;
    height: number;
    weight: number;
    
    // Ruoli e Posizione
    mainRole: "Portiere" | "Difensore" | "Centrocampista" | "Attaccante";
    specificRoles: string[];
    
    // Caratteristiche Tecniche
    preferredFoot: "Destro" | "Sinistro" | "Ambidestro";
    weakFoot: number; // 1-5
    attributes: string[];
  
    // Valutazione
    stats: ScoutReportStats;
    rating: number; // Ora sarà 1-100
    recommendation: "Scartare" | "Monitorare" | "Acquistare"; // Nuovo campo
    
    notes: string;
    strengths: string[];
    weaknesses: string[];
  }