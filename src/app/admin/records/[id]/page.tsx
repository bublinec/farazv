import { notFound, redirect } from "next/navigation";
import { requireEditorPage } from "@/server/auth";
import { getRecord } from "@/server/content-store";
import { RecordEditor } from "@/components/admin/RecordEditor";
import { isBuiltInEditablePage } from "@/server/page-seed";
export default async function RecordPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireEditorPage();
  const { id } = await params;
  if (id === "site-settings") redirect("/admin/nastavenia");
  const record = await getRecord(id);
  if (!record) notFound();
  return (
    <RecordEditor
      key={record.id}
      initialRecord={record}
      builtInPage={
        record.kind === "page" && isBuiltInEditablePage(record.draft.route)
      }
    />
  );
}
