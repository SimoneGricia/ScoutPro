"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";

interface HistoryChartProps { data: any[]; }

export default function HistoryChart({ data }: HistoryChartProps) {
  const { theme } = useTheme();
  
  const formattedData = data.map(d => ({
    ...d,
    dateStr: new Date(d.date).toLocaleDateString("it-IT", { day: '2-digit', month: '2-digit' })
  }));

  if (data.length < 2) return null;

  const isDark = theme === "dark";

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm dark:bg-slate-900">
      <CardHeader className="pb-2 border-b dark:border-slate-800">
        <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <TrendingUp size={18} className="text-blue-600 dark:text-blue-400"/> Evoluzione Storica
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                <XAxis dataKey="dateStr" stroke={isDark ? "#94a3b8" : "#64748b"} fontSize={12} />
                <YAxis yAxisId="left" stroke="#2563eb" fontSize={12} domain={['auto', 'auto']} />
                <YAxis yAxisId="right" orientation="right" stroke="#059669" fontSize={12} unit="M" />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: isDark ? '#1e293b' : '#fff', 
                        borderRadius: '8px', 
                        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                        color: isDark ? '#f8fafc' : '#0f172a'
                    }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="rating" name="Rating" stroke="#2563eb" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line yAxisId="right" type="monotone" dataKey="marketValue" name="Valore (€)" stroke="#059669" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
            </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}