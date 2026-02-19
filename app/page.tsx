import { getReports } from "@/lib/actions";
import Dashboard from "@/components/Dashboard";

// Questa riga è fondamentale: dice a Next.js di non usare la cache vecchia
// ma di ricaricare i dati dal DB ogni volta che apri la pagina.
export const dynamic = "force-dynamic"; 

export default async function Home() {
  // 1. Chiediamo i dati a Prisma (Database)
  const reports = await getReports();
  
  // 2. Passiamo i dati veri alla Dashboard
  return (
    <main>
      <Dashboard initialReports={reports} />
    </main>
  );
}