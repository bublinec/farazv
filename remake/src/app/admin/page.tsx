import { requireEditorPage } from "@/server/auth";
import { RecordList } from "@/components/admin/RecordList";
import { redirect } from "next/navigation";
import { BulletinDashboard } from "@/components/admin/BulletinDashboard";

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  await requireEditorPage();
  const { section } = await searchParams;
  if (section === "settings") redirect("/admin/nastavenia");
  if (section === "posts" || section === "article")
    return <RecordList key={section} section={section} />;
  if (section === "archive" || section === "bulletin")
    return <RecordList section="bulletin" />;
  return <BulletinDashboard />;
}
