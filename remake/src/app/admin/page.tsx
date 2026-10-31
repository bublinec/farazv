import { requireEditorPage } from "@/server/auth";
import { RecordList } from "@/components/admin/RecordList";
export default async function AdminPage() {
  await requireEditorPage();
  return <RecordList />;
}
