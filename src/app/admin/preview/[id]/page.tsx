import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEditorPage } from "@/server/auth";
import { getRecord } from "@/server/content-store";
import { RecordPreview } from "@/components/admin/RecordPreview";
import { EditablePage } from "@/components/information/EditablePage";
import theme from "@/components/layout/ParishTheme.module.css";
import styles from "@/components/admin/Admin.module.css";
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

  // Pages render with the public layouts, which read office facts on the server.
  if (record.kind === "page")
    return (
      <div>
        <header className={styles.heading}>
          <h1>Súkromný náhľad stránky</h1>
          <Link href={`/admin/records/${encodeURIComponent(record.id)}`}>
            ← Späť na úpravu
          </Link>
        </header>
        <div className={theme.parish}>
          <EditablePage page={record.draft} />
        </div>
      </div>
    );

  return <RecordPreview record={record} />;
}
