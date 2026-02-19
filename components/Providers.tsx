"use client";

import { ReportsProvider } from "@/context/ReportsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReportsProvider>
      {children}
    </ReportsProvider>
  );
}