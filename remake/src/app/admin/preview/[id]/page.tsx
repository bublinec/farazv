import { notFound } from "next/navigation";
import { requireEditorPage } from "@/server/auth";
import { getRecord } from "@/server/content-store";
import { RecordPreview } from "@/components/admin/RecordPreview";
export const dynamic = "force-dynamic";
export default async function PreviewPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireEditorPage();
  const { id } = await params;
  const record = await getRecord(id);
  if (!record) notFound();
  return <RecordPreview record={record} />;
}
