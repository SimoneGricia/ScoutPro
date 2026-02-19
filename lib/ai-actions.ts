"use server";

import { ScoutReport } from "@/types";

export interface AiVerdict {
  winnerId: string | null; // Null se il confronto è impossibile
  title: string;
  reasoning: string;
  scoreA: number; // 1-10
  scoreB: number; // 1-10
}

export async function generateAiComparison(p1: ScoutReport, p2: ScoutReport): Promise<AiVerdict> {
  
  // Simula tempo di elaborazione per effetto "AI Thinking"
  await new Promise(resolve => setTimeout(resolve, 1500));

  // --- 1. CHECK RUOLI INCOMPATIBILI (Portiere vs Movimento) ---
  const isGK1 = p1.mainRole === "Portiere";
  const isGK2 = p2.mainRole === "Portiere";

  if (isGK1 !== isGK2) {
    return {
      winnerId: null,
      title: "Confronto Impossibile",
      reasoning: `Non ha senso tattico né economico confrontare un Portiere (${isGK1 ? p1.playerName : p2.playerName}) con un giocatore di movimento. I parametri di valutazione sono completamente opposti. Si consiglia di confrontare giocatori dello stesso reparto.`,
      scoreA: 0,
      scoreB: 0
    };
  }

  // --- 2. CALCOLO PUNTEGGIO AVANZATO ---
  const calculateScore = (p: ScoutReport) => {
    let score = 0;
    
    // A. Base Overall (Peso 40%)
    score += p.rating * 0.4;

    // B. Fattore Età (Peso 15%) - Premia i giovani
    score += (40 - p.playerAge) * 0.15;

    // C. Efficienza Economica (Peso 20%) - Stipendio basso rispetto al valore è meglio
    // Se stipendio è basso (es. 1M) da più punti. Se è alto (es. 10M) ne da meno.
    const salaryFactor = p.salary > 0 ? (10 / Math.max(1, p.salary)) : 5; 
    score += Math.min(10, salaryFactor) * 2; 

    // D. Performance Stats (Peso 25%)
    // Calcola media delle stats principali
    const stats = p.mainRole === "Portiere" 
      ? [p.diving, p.handling, p.reflexes, p.gkPositioning]
      : [p.pace, p.shooting, p.passing, p.dribbling, p.defending, p.physical];
    
    // Filtra undefined/null e calcola media
    const validStats = stats.map(Number).filter(n => !isNaN(n));
    const avgStats = validStats.reduce((a, b) => a + b, 0) / (validStats.length || 1);
    
    score += (avgStats / 10) * 0.25;

    return score;
  };

  const rawScoreA = calculateScore(p1);
  const rawScoreB = calculateScore(p2);

  // Normalizza su scala 1-10
  // Assumiamo che un punteggio "grezzo" massimo sia circa 80-90.
  const scoreA = Math.min(10, Math.max(1, Math.round((rawScoreA / 8) * 10) / 10));
  const scoreB = Math.min(10, Math.max(1, Math.round((rawScoreB / 8) * 10) / 10));

  const winner = scoreA >= scoreB ? p1 : p2;
  const loser = scoreA >= scoreB ? p2 : p1;

  // --- 3. GENERAZIONE MOTIVAZIONI (Dinamiche) ---
  let title = "";
  let reasoning = "";

  const diffRating = winner.rating - loser.rating;
  const diffAge = loser.playerAge - winner.playerAge; // Positivo se winner è più giovane
  const diffCost = loser.marketValue - winner.marketValue; // Positivo se winner costa meno

  // Logica differenziatori
  if (diffRating >= 3) {
    title = `Dominio Tecnico: ${winner.playerName}`;
    reasoning = `${winner.playerName} è attualmente superiore (+${diffRating} OVR). Anche se i costi potrebbero essere più alti, garantisce un impatto immediato sulla squadra che ${loser.playerName} non può offrire.`;
  } else if (diffAge > 3) {
    title = `Prospettiva Futura: ${winner.playerName}`;
    reasoning = `Sebbene i livelli attuali siano simili, ${winner.playerName} è più giovane di ${diffAge} anni. Rappresenta un asset patrimoniale migliore con margini di crescita tecnica e plusvalenza futura.`;
  } else if (diffCost > 5) {
    title = `Affare Low Cost: ${winner.playerName}`;
    reasoning = `A parità di rendimento tecnico, ${winner.playerName} costa €${diffCost.toFixed(1)}M in meno. L'efficienza economica lo rende preferibile per non appesantire il bilancio.`;
  } else {
    // Confronto attributi specifici se è un pareggio tecnico
    const keyStatWinner = winner.mainRole === "Portiere" ? winner.reflexes : winner.pace;
    const keyStatLabel = winner.mainRole === "Portiere" ? "nei Riflessi" : "nella Velocità";
    
    title = `Vittoria ai Punti: ${winner.playerName}`;
    reasoning = `Duello molto equilibrato. L'algoritmo premia ${winner.playerName} per una leggera superiorità ${keyStatLabel} e un pacchetto ingaggio/età più sostenibile nel lungo periodo.`;
  }

  return {
    winnerId: winner.id,
    title,
    reasoning,
    scoreA,
    scoreB
  };
}