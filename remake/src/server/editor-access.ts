import "server-only";
import { and, asc, eq, isNull, isNotNull, sql } from "drizzle-orm";
import type { EditorAccessList, EditorRole } from "@/content/editor-access";
import {
  AccessError,
  isAdministratorEmail,
  normalizeEditorEmail,
  parseEditorAllowlist
} from "@/lib/auth-policy";
import { getDb } from "./db";
import { editorAccess } from "./db/schema";
import { ContentError } from "./errors";

/** Deliberately uncached: revocation also denies an already signed-in editor. */
export async function getEditorRole(email: string): Promise<EditorRole | null> {
  if (isAdministratorEmail(email)) return "admin";
  if (!process.env.DATABASE_URL) return null;

  try {
    const [grant] = await getDb()
      .select({ email: editorAccess.email })
      .from(editorAccess)
      .where(and(eq(editorAccess.email, email), isNull(editorAccess.revokedAt)))
      .limit(1);
    return grant ? "editor" : null;
  } catch {
    throw new AccessError(
      503,
      "Prístupy do adminu sú dočasne nedostupné. Skúste to znova.",
      "ACCESS_UNAVAILABLE"
    );
  }
}

export async function listEditorAccess(): Promise<EditorAccessList> {
  const administrators = [
    ...parseEditorAllowlist(process.env.ADMIN_EMAIL_ALLOWLIST)
  ].sort();
  const editors = await getDb()
    .select({
      email: editorAccess.email,
      grantedBy: editorAccess.grantedBy,
      grantedAt: editorAccess.grantedAt
    })
    .from(editorAccess)
    .where(isNull(editorAccess.revokedAt))
    .orderBy(asc(editorAccess.email));

  return {
    administrators,
    editors: editors.filter((editor) => !administrators.includes(editor.email))
  };
}

function editableEmail(value: unknown) {
  const email = normalizeEditorEmail(value);
  if (!email)
    throw new ContentError(
      422,
      "Zadajte platnú e-mailovú adresu Google účtu.",
      "INVALID_EMAIL"
    );
  if (isAdministratorEmail(email))
    throw new ContentError(
      409,
      "Tento účet je správca. Správcovia sa nastavujú v konfigurácii a nedajú sa odobrať z tejto stránky.",
      "ADMIN_PROTECTED"
    );
  return email;
}

export async function grantEditorAccess(value: unknown, actor: string) {
  const email = editableEmail(value);
  await getDb()
    .insert(editorAccess)
    .values({ email, grantedBy: actor })
    .onConflictDoUpdate({
      target: editorAccess.email,
      set: {
        grantedBy: actor,
        grantedAt: sql`now()`,
        revokedBy: null,
        revokedAt: null
      },
      setWhere: isNotNull(editorAccess.revokedAt)
    });
  return email;
}

export async function revokeEditorAccess(value: unknown, actor: string) {
  const email = editableEmail(value);
  await getDb()
    .update(editorAccess)
    .set({ revokedAt: sql`now()`, revokedBy: actor })
    .where(and(eq(editorAccess.email, email), isNull(editorAccess.revokedAt)));
  return email;
}
