import "server-only";
import { feedbackLimits, type FeedbackSubmission } from "@/content/feedback";
import { ContentError } from "./errors";

export const feedbackIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function field(value: unknown, name: keyof typeof feedbackLimits, minimum = 0) {
  if (typeof value !== "string")
    throw new ContentError(422, "Vyplňte toto pole.", "INVALID_FEEDBACK", name);
  const result = value.trim();
  if (result.length < minimum)
    throw new ContentError(
      422,
      minimum > 3
        ? `Opíšte podnet podrobnejšie (aspoň ${minimum} znakov).`
        : "Vyplňte názov podnetu.",
      "INVALID_FEEDBACK",
      name
    );
  if (
    result.length > feedbackLimits[name] ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(result)
  )
    throw new ContentError(
      422,
      "Text je príliš dlhý alebo obsahuje nepodporované znaky.",
      "INVALID_FEEDBACK",
      name
    );
  return result;
}

export function parseFeedback(input: unknown): FeedbackSubmission {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new ContentError(
      400,
      "Skontrolujte vyplnený formulár.",
      "INVALID_BODY"
    );
  const body = input as Record<string, unknown>;
  if (typeof body.id !== "string" || !feedbackIdPattern.test(body.id))
    throw new ContentError(
      400,
      "Obnovte stránku a skúste podnet odoslať znova.",
      "INVALID_ID"
    );

  const subject = field(body.subject, "subject", 3);
  const email = field(body.email ?? "", "email");
  if (email && !/^[^\s@*,;<>]+@[^\s@*,;<>]+\.[^\s@*,;<>]+$/.test(email))
    throw new ContentError(
      422,
      "Skontrolujte e-mailovú adresu.",
      "INVALID_FEEDBACK",
      "email"
    );

  if (body.topic === "website") {
    const pageUrl = field(body.pageUrl ?? "", "pageUrl");
    if (pageUrl) {
      try {
        const url = new URL(pageUrl, "https://farazv.sk");
        if (
          !/^https?:$/.test(url.protocol) ||
          url.username ||
          url.password ||
          /[\s\\]/.test(pageUrl) ||
          (!/^https?:\/\//i.test(pageUrl) && !/^\/(?!\/)/.test(pageUrl))
        )
          throw new Error();
      } catch {
        throw new ContentError(
          422,
          "Vložte odkaz https:// alebo cestu začínajúcu /.",
          "INVALID_FEEDBACK",
          "pageUrl"
        );
      }
    }
    return {
      id: body.id.toLowerCase(),
      subject,
      email,
      details: {
        topic: "website",
        problem: field(body.problem, "problem", 30),
        proposal: field(body.proposal, "proposal", 30),
        benefit: field(body.benefit ?? "", "benefit"),
        pageUrl
      }
    };
  }
  if (body.topic === "parish")
    return {
      id: body.id.toLowerCase(),
      subject,
      email,
      details: { topic: "parish", message: field(body.message, "message", 20) }
    };
  throw new ContentError(
    422,
    "Vyberte, čoho sa váš podnet týka.",
    "INVALID_FEEDBACK",
    "topic"
  );
}
