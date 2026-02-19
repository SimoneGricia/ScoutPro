"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- CREATE ---
export async function createReport(data: any) {
  try {
    const report = await prisma.report.create({
      data: {
        playerName: data.playerName,
        team: data.team,
        imageUrl: data.imageUrl,
        mainRole: data.mainRole,
        specificRoles: data.specificRoles,
        playerAge: Number(data.playerAge),
        height: Number(data.height),
        weight: Number(data.weight),
        preferredFoot: data.preferredFoot,
        weakFoot: Number(data.weakFoot),
        matchDate: new Date(),
        status: null,
        isFavorite: false, // Default
        latitude: Number(data.latitude) || 41.9028,
        longitude: Number(data.longitude) || 12.4964,
        // Match Stats
        minutesPlayed: Number(data.minutesPlayed) || 0,
        goals: Number(data.goals) || 0,
        assists: Number(data.assists) || 0,
        shots: Number(data.shots) || 0,
        passesCompleted: Number(data.passesCompleted) || 0,
        tacklesWon: Number(data.tacklesWon) || 0,
        saves: Number(data.saves) || 0,
        cleanSheets: Number(data.cleanSheets) || 0,

        // Season Stats
        seasonApps: Number(data.seasonApps) || 0,
        seasonGoals: Number(data.seasonGoals) || 0,
        seasonAssists: Number(data.seasonAssists) || 0,
        seasonCleanSheets: Number(data.seasonCleanSheets) || 0,
        seasonYellows: Number(data.seasonYellows) || 0,
        seasonReds: Number(data.seasonReds) || 0,
        seasonAvgRating: Number(data.seasonAvgRating) || 6.0,
        
        attributes: data.attributes,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        heatmapZones: data.heatmapZones,
        customTags: data.customTags,
        
        // MEDIA (Nuovo)
        videoLinks: data.videoLinks || [],
        
        // Params
        pace: Number(data.pace) || 50,
        shooting: Number(data.shooting) || 50,
        passing: Number(data.passing) || 50,
        dribbling: Number(data.dribbling) || 50,
        defending: Number(data.defending) || 50,
        physical: Number(data.physical) || 50,
        diving: Number(data.diving) || 50,
        handling: Number(data.handling) || 50,
        kicking: Number(data.kicking) || 50,
        reflexes: Number(data.reflexes) || 50,
        gkPositioning: Number(data.gkPositioning) || 50,
        gkSpeed: Number(data.gkSpeed) || 50,
        
        rating: Number(data.rating),
        recommendation: data.recommendation,
        notes: data.notes,
        marketValue: Number(data.marketValue),
        salary: Number(data.salary),
        contractExpiry: data.contractExpiry ? new Date(data.contractExpiry) : null,
        agent: data.agent,
        releaseClause: Number(data.releaseClause),
      },
    });

    await prisma.playerHistory.create({
        data: { reportId: report.id, rating: report.rating, marketValue: report.marketValue }
    });

  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Errore durante la creazione.");
  }
  revalidatePath("/"); redirect("/");
}

// --- UPDATE ---
export async function updateReport(id: string, data: any) {
  try {
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        playerName: data.playerName,
        team: data.team,
        imageUrl: data.imageUrl,
        mainRole: data.mainRole,
        specificRoles: data.specificRoles,
        playerAge: Number(data.playerAge),
        height: Number(data.height),
        weight: Number(data.weight),
        preferredFoot: data.preferredFoot,
        weakFoot: Number(data.weakFoot),
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        // Match Stats
        minutesPlayed: Number(data.minutesPlayed) || 0,
        goals: Number(data.goals) || 0,
        assists: Number(data.assists) || 0,
        shots: Number(data.shots) || 0,
        passesCompleted: Number(data.passesCompleted) || 0,
        tacklesWon: Number(data.tacklesWon) || 0,
        saves: Number(data.saves) || 0,
        cleanSheets: Number(data.cleanSheets) || 0,

        // Season Stats
        seasonApps: Number(data.seasonApps) || 0,
        seasonGoals: Number(data.seasonGoals) || 0,
        seasonAssists: Number(data.seasonAssists) || 0,
        seasonCleanSheets: Number(data.seasonCleanSheets) || 0,
        seasonYellows: Number(data.seasonYellows) || 0,
        seasonReds: Number(data.seasonReds) || 0,
        seasonAvgRating: Number(data.seasonAvgRating) || 6.0,
        
        attributes: data.attributes,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        heatmapZones: data.heatmapZones,
        customTags: data.customTags,

        // MEDIA (Nuovo)
        videoLinks: data.videoLinks,
        
        pace: Number(data.pace), shooting: Number(data.shooting), passing: Number(data.passing),
        dribbling: Number(data.dribbling), defending: Number(data.defending), physical: Number(data.physical),
        diving: Number(data.diving), handling: Number(data.handling), kicking: Number(data.kicking),
        reflexes: Number(data.reflexes), gkPositioning: Number(data.gkPositioning), gkSpeed: Number(data.gkSpeed),
        
        rating: Number(data.rating),
        recommendation: data.recommendation,
        notes: data.notes,
        marketValue: Number(data.marketValue),
        salary: Number(data.salary),
        contractExpiry: data.contractExpiry ? new Date(data.contractExpiry) : null,
        agent: data.agent,
        releaseClause: Number(data.releaseClause),
      },
    });

    await prisma.playerHistory.create({
        data: { reportId: id, rating: updatedReport.rating, marketValue: updatedReport.marketValue }
    });

  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Errore aggiornamento.");
  }
  revalidatePath("/"); revalidatePath(`/report/${id}`); redirect(`/report/${id}`);
}

// --- FAVORITES ---
export async function toggleFavorite(id: string) {
  try {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) return;

    await prisma.report.update({
      where: { id },
      data: { isFavorite: !report.isFavorite }
    });
    
    revalidatePath("/");
    revalidatePath("/watchlist");
    revalidatePath("/teams");
    revalidatePath("/report/[id]", "page");
  } catch (error) {
    console.error("Errore toggle favorite:", error);
  }
}

// --- DELETE ---
export async function deleteReport(id: string) { await prisma.report.delete({ where: { id } }); revalidatePath("/"); redirect("/"); }

// --- GETTERS ---
export async function getReports() { 
  return await prisma.report.findMany({ 
    orderBy: { createdAt: 'desc' },
    include: { 
      matchLogs: true // <--- AGGIUNTA FONDAMENTALE
    } 
  }); 
}export async function getReportById(id: string) { 
  return await prisma.report.findUnique({ 
    where: { id },
    include: { 
      history: { orderBy: { date: 'asc' } },
      matchLogs: { orderBy: { date: 'desc' } } // <--- AGGIUNTO QUESTO
    }
  }); 
}export async function getWatchlistReports() { return await prisma.report.findMany({ where: { isFavorite: true }, orderBy: { createdAt: 'desc' } }); }
export async function getPlayerHistory(id: string) { return await prisma.playerHistory.findMany({ where: { reportId: id }, orderBy: { date: 'asc' } }); }
export async function updatePlayerStatus(id: string, n: string | null) { await prisma.report.update({ where: { id }, data: { status: n } }); revalidatePath("/pipeline"); }
export async function saveLineup(n: string, m: string, l: any) { await prisma.savedLineup.create({ data: { name: n, module: m, lineup: JSON.stringify(l) } }); revalidatePath("/lineup"); }
export async function getSavedLineups() { return await prisma.savedLineup.findMany({ orderBy: { createdAt: 'desc' } }); }
export async function deleteSavedLineup(id: string) { await prisma.savedLineup.delete({ where: { id } }); revalidatePath("/lineup"); }
export async function getSimilarPlayers(targetId: string) { /* Logic omitted for brevity */ return []; }
export async function addMatchLog(reportId: string, data: any) {
  try {
    await prisma.matchLog.create({
      data: {
        reportId,
        date: new Date(data.date),
        opponent: data.opponent,
        competition: data.competition || "Campionato",
        minutesPlayed: Number(data.minutesPlayed) || 0,
        rating: Number(data.rating) || 6.0,
        goals: Number(data.goals) || 0,
        assists: Number(data.assists) || 0,
        saves: Number(data.saves) || 0,
        yellowCard: Boolean(data.yellowCard),
        redCard: Boolean(data.redCard),
        cleanSheet: Boolean(data.cleanSheet),
        notes: data.notes || "",
      }
    });
    revalidatePath(`/report/${reportId}`);
  } catch (error) {
    console.error("Error adding match log:", error);
  }
}

export async function deleteMatchLog(logId: string, reportId: string) {
  try {
    await prisma.matchLog.delete({ where: { id: logId } });
    revalidatePath(`/report/${reportId}`);
  } catch (error) {
    console.error("Error deleting match log:", error);
  }
}
// --- BULK IMPORT ---
export async function createBulkReports(reports: any[]) {
  try {
    await prisma.report.createMany({
      data: reports.map(r => ({
        playerName: r.playerName, team: r.team, imageUrl: r.imageUrl || "", mainRole: r.mainRole || "Centrocampista", specificRoles: r.specificRoles || [],
        playerAge: Number(r.playerAge) || 18, height: Number(r.height) || 180, weight: Number(r.weight) || 75, preferredFoot: r.preferredFoot || "Destro", weakFoot: Number(r.weakFoot) || 3,
        matchDate: new Date(), createdAt: new Date(), status: null, isFavorite: false,
        minutesPlayed: 0, goals: 0, assists: 0, shots: 0, passesCompleted: 0, tacklesWon: 0, saves: 0, cleanSheets: 0,
        seasonApps: 0, seasonGoals: 0, seasonAssists: 0, seasonCleanSheets: 0, seasonYellows: 0, seasonReds: 0, seasonAvgRating: 6.0,
        attributes: [], strengths: [], weaknesses: [], heatmapZones: [], customTags: [], videoLinks: [],
        pace: Number(r.pace) || 50, shooting: Number(r.shooting) || 50, passing: Number(r.passing) || 50, dribbling: Number(r.dribbling) || 50, defending: Number(r.defending) || 50, physical: Number(r.physical) || 50,
        diving: Number(r.diving) || 50, handling: Number(r.handling) || 50, kicking: Number(r.kicking) || 50, reflexes: Number(r.reflexes) || 50, gkPositioning: Number(r.gkPositioning) || 50, gkSpeed: Number(r.gkSpeed) || 50,
        rating: Number(r.rating) || 60, recommendation: r.recommendation || "Monitorare", notes: r.notes || "Importato da Excel",
        marketValue: Number(r.marketValue) || 0, salary: Number(r.salary) || 0, contractExpiry: r.contractExpiry ? new Date(r.contractExpiry) : null, agent: r.agent || "", releaseClause: Number(r.releaseClause) || 0,
      }))
    });
  } catch (error) { console.error(error); throw new Error("Errore importazione."); }
  revalidatePath("/"); revalidatePath("/teams"); revalidatePath("/market");
}