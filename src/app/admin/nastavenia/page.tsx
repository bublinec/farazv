import type { Metadata } from "next";
import { requireEditorPage } from "@/server/auth";
import { getRecord } from "@/server/content-store";
import { RecordEditor } from "@/components/admin/RecordEditor";
import { LectorPassword } from "@/components/admin/LectorPassword";
import { SettingsSetup } from "@/components/admin/SettingsSetup";
import layout from "@/components/admin/RecordEditor.module.css";

export const metadata: Metadata = { title: "Nastavenia farnosti" };

export default async function SettingsPage() {
  const identity = await requireEditorPage();
  const record = await getRecord("site-settings");

  return (
    <div className={layout.workspace}>
      {record?.kind === "settings" ? (
        <RecordEditor key={record.id} initialRecord={record} />
      ) : (
        <SettingsSetup />
      )}
      {identity.role === "admin" ? <LectorPassword /> : null}
    </div>
  );
}
