import type { Metadata } from "next";
import { requireEditorPage } from "@/server/auth";
import { getRecord } from "@/server/content-store";
import { RecordEditor } from "@/components/admin/RecordEditor";
import { SettingsSetup } from "@/components/admin/SettingsSetup";

export const metadata: Metadata = { title: "Nastavenia farnosti" };

export default async function SettingsPage() {
  await requireEditorPage();
  const record = await getRecord("site-settings");

  return record?.kind === "settings" ? (
    <RecordEditor key={record.id} initialRecord={record} />
  ) : (
    <SettingsSetup />
  );
}
