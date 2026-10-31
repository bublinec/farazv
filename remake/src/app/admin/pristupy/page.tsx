import type { Metadata } from "next";
import { requireAdministratorPage } from "@/server/auth";
import { listEditorAccess } from "@/server/editor-access";
import { EditorAccess } from "@/components/admin/EditorAccess";

export const metadata: Metadata = { title: "Prístupy" };

export default async function AccessPage() {
  await requireAdministratorPage();
  return <EditorAccess initialAccess={await listEditorAccess()} />;
}
