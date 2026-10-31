import type { Metadata } from "next";
import { requireEditor } from "@/server/auth";
import { AdminShell } from "@/components/admin/AdminShell";
export const metadata: Metadata = {
  title: { default: "Redakcia", template: "%s | Redakcia Farazv" },
  robots: { index: false, follow: false }
};
export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  let authenticated = false;
  try {
    await requireEditor();
    authenticated = true;
  } catch {
    /* Login remains available when OAuth is not configured. Protected pages/API guard themselves. */
  }
  return <AdminShell authenticated={authenticated}>{children}</AdminShell>;
}
