"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

interface ComparisonRadarProps {
  player1Name: string;
  player2Name: string;
  stats1: any;
  stats2: any;
}

export default function ComparisonRadar({ player1Name, player2Name, stats1, stats2 }: ComparisonRadarProps) {
  const data = [
    { subject: "Velocità", A: stats1.pace, B: stats2.pace, fullMark: 100 },
    { subject: "Tiro", A: stats1.shooting, B: stats2.shooting, fullMark: 100 },
    { subject: "Passaggio", A: stats1.passing, B: stats2.passing, fullMark: 100 },
    { subject: "Dribbling", A: stats1.dribbling, B: stats2.dribbling, fullMark: 100 },
    { subject: "Difesa", A: stats1.defending, B: stats2.defending, fullMark: 100 },
    { subject: "Fisico", A: stats1.physical, B: stats2.physical, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          <Radar
            name={player1Name}
            dataKey="A"
            stroke="#2563eb" // Blu
            fill="#3b82f6"
            fillOpacity={0.4}
          />
          <Radar
            name={player2Name}
            dataKey="B"
            stroke="#db2777" // Rosa/Rosso
            fill="#ec4899"
            fillOpacity={0.4}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ fontWeight: 600 }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}