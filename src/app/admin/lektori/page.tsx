import type { Metadata } from "next";
import { requireLectorPage } from "@/server/auth";
import { listAdminLectorSchedules } from "@/server/lector-store";
import { LectorSchedules } from "@/components/admin/LectorSchedules";
export const metadata: Metadata = { title: "Rozpisy lektorov" };
export default async function LectorPage() {
  await requireLectorPage();
  return <LectorSchedules initialList={await listAdminLectorSchedules()} />;
}
