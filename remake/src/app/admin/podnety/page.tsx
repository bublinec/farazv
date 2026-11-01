import type { Metadata } from "next";
import { feedbackStatuses, type FeedbackStatus } from "@/content/feedback";
import { FeedbackInbox } from "@/components/admin/FeedbackInbox";
import { requireAdministratorPage } from "@/server/auth";
import { listFeedback } from "@/server/feedback-store";

export const metadata: Metadata = { title: "Podnety" };

export default async function FeedbackInboxPage({
  searchParams
}: {
  searchParams: Promise<{ stav?: string }>;
}) {
  await requireAdministratorPage();
  const { stav } = await searchParams;
  const status =
    stav && Object.hasOwn(feedbackStatuses, stav)
      ? (stav as FeedbackStatus)
      : "new";
  return (
    <FeedbackInbox
      key={status}
      status={status}
      initialPage={await listFeedback(status)}
    />
  );
}
