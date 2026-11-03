export const feedbackTopics = {
  website: "Webová stránka",
  parish: "Život farnosti"
} as const;

export const feedbackStatuses = {
  new: "Nové",
  reviewed: "Prečítané",
  archived: "Archív"
} as const;

export type FeedbackTopic = keyof typeof feedbackTopics;
export type FeedbackStatus = keyof typeof feedbackStatuses;
export type FeedbackAction = "read" | "archive" | "restore";

export type FeedbackDetails =
  | {
      topic: "website";
      problem: string;
      proposal: string;
      benefit: string;
      pageUrl: string;
    }
  | { topic: "parish"; message: string };

export interface FeedbackSubmission {
  id: string;
  subject: string;
  email: string;
  details: FeedbackDetails;
}

export interface FeedbackSummary {
  id: string;
  topic: FeedbackTopic;
  subject: string;
  preview: string;
  status: FeedbackStatus;
  createdAt: string;
}

export interface FeedbackEntry extends Omit<FeedbackSummary, "preview"> {
  email: string | null;
  details: FeedbackDetails;
  updatedAt: string;
}

export interface FeedbackPage {
  items: FeedbackSummary[];
  nextCursor: string | null;
  unreadCount: number;
}

export const feedbackLimits = {
  subject: 120,
  problem: 3000,
  proposal: 4000,
  benefit: 1000,
  pageUrl: 1000,
  message: 6000,
  email: 254
} as const;

export const feedbackWelcomeEndsOn = "2026-11-15";
