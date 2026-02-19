import { getReportById } from "@/lib/actions";
import ReportForm from "@/components/ReportForm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditReportPage(props: PageProps) {
  const params = await props.params;
  const report = await getReportById(params.id);

  if (!report) return notFound();

  return <ReportForm initialData={report} reportId={params.id} />;
}