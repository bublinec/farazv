import type { EditorRole } from "@/content/editor-access";
import type { Metadata } from "next";
import { requireEditor } from "@/server/auth";
import { AdminShell } from "@/components/admin/AdminShell";
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin Farazv" },
  robots: { index: false, follow: false }
};
export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  let role: EditorRole | undefined;
  let authenticated = false;
  let canManageAccess = false;
  try {
    const editor = await requireEditor();
    role = editor.role;
    authenticated = true;
    canManageAccess = editor.role === "admin";
  } catch {
    /* Login remains available when OAuth is not configured. Protected pages/API guard themselves. */
  }
  return (
    <AdminShell
      authenticated={authenticated}
      canManageAccess={canManageAccess}
      role={role}
    >
      {children}
    </AdminShell>
  );
}
