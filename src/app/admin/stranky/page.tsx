import type { Metadata } from "next";
import { requireEditorPage } from "@/server/auth";
import { PageList } from "@/components/admin/PageList";

export const metadata: Metadata = { title: "Stránky" };
export const dynamic = "force-dynamic";

export default async function PagesAdminPage() {
  await requireEditorPage();
  return <PageList />;
}
