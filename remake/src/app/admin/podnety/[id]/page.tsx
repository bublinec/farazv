import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeedbackDetail } from "@/components/admin/FeedbackDetail";
import { requireAdministratorPage } from "@/server/auth";
import { getFeedback } from "@/server/feedback-store";

export const metadata: Metadata = { title: "Podnet" };

export default async function FeedbackDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdministratorPage();
  const entry = await getFeedback((await params).id);
  if (!entry) notFound();
  return <FeedbackDetail key={entry.id} initialEntry={entry} />;
}
