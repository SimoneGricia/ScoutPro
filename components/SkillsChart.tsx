"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts";
import { useTheme } from "next-themes";

interface SkillsChartProps {
  stats: any;
  compareStats?: any; // Opzionale, per il confronto
}

export default function SkillsChart({ stats, compareStats }: SkillsChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Mappatura dati per il grafico
  const data = [
    { subject: "VEL", A: stats.pace || stats.diving || 0, B: compareStats ? (compareStats.pace || compareStats.diving || 0) : 0, fullMark: 100 },
    { subject: "TIR", A: stats.shooting || stats.handling || 0, B: compareStats ? (compareStats.shooting || compareStats.handling || 0) : 0, fullMark: 100 },
    { subject: "PAS", A: stats.passing || stats.kicking || 0, B: compareStats ? (compareStats.passing || compareStats.kicking || 0) : 0, fullMark: 100 },
    { subject: "DRI", A: stats.dribbling || stats.reflexes || 0, B: compareStats ? (compareStats.dribbling || compareStats.reflexes || 0) : 0, fullMark: 100 },
    { subject: "DIF", A: stats.defending || stats.gkPositioning || 0, B: compareStats ? (compareStats.defending || compareStats.gkPositioning || 0) : 0, fullMark: 100 },
    { subject: "FIS", A: stats.physical || stats.gkSpeed || 0, B: compareStats ? (compareStats.physical || compareStats.gkSpeed || 0) : 0, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} />
        <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 10, fontWeight: "bold" }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        
        <Tooltip 
            contentStyle={{ 
                backgroundColor: isDark ? '#1e293b' : '#fff', 
                borderRadius: '8px', 
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                color: isDark ? '#f8fafc' : '#0f172a'
            }}
        />

        {/* Giocatore A (Viola) */}
        <Radar
          name="Giocatore A"
          dataKey="A"
          stroke="#8b5cf6"
          strokeWidth={3}
          fill="#8b5cf6"
          fillOpacity={compareStats ? 0.3 : 0.5}
        />

        {/* Giocatore B (Blu) - Renderizzato solo se esiste compareStats */}
        {compareStats && (
            <Radar
            name="Giocatore B"
            dataKey="B"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="#3b82f6"
            fillOpacity={0.3}
            />
        )}
        
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}