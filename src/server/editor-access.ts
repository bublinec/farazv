import "server-only";
import { randomUUID } from "node:crypto";
import { and, asc, eq, isNull, isNotNull, sql } from "drizzle-orm";
import {
  isEditorGrantRole,
  type EditorGrantRole,
  type EditorAccessList,
  type EditorRole
} from "@/content/editor-access";
import {
  AccessError,
  isAdministratorEmail,
  normalizeEditorEmail,
  parseEditorAllowlist
} from "@/lib/auth-policy";
import { getDb } from "./db";
import { editorAccess, editorAccessAudit } from "./db/schema";
import { ContentError } from "./errors";

/** Deliberately uncached: role changes also affect an existing Google session. */
export async function getEditorRole(email: string): Promise<EditorRole | null> {
  if (isAdministratorEmail(email)) return "admin";
  if (!process.env.DATABASE_URL) return null;

  try {
    const [grant] = await getDb()
      .select({ role: editorAccess.role })
      .from(editorAccess)
      .where(and(eq(editorAccess.email, email), isNull(editorAccess.revokedAt)))
      .limit(1);
    return grant && isEditorGrantRole(grant.role) ? grant.role : null;
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
      role: editorAccess.role,
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
      "Tento účet je chránený správca. Jeho prístup ani rolu nemožno meniť cez CMS.",
      "ADMIN_PROTECTED"
    );
  return email;
}

function validRole(value: unknown): EditorGrantRole {
  if (!isEditorGrantRole(value))
    throw new ContentError(
      422,
      "Vyberte platnú rolu používateľa.",
      "INVALID_ROLE"
    );
  return value;
}

export async function grantEditorAccess(
  value: unknown,
  actor: string,
  roleValue: unknown = "editor"
) {
  const email = editableEmail(value);
  const role = validRole(roleValue);
  await getDb().transaction(async (tx) => {
    const rows = await tx
      .insert(editorAccess)
      .values({ email, role, grantedBy: actor })
      .onConflictDoUpdate({
        target: editorAccess.email,
        set: {
          role,
          grantedBy: actor,
          grantedAt: sql`now()`,
          revokedBy: null,
          revokedAt: null
        },
        setWhere: isNotNull(editorAccess.revokedAt)
      })
      .returning({ email: editorAccess.email });
    if (rows.length)
      await tx
        .insert(editorAccessAudit)
        .values({ id: randomUUID(), email, actor, nextRole: role });
  });
  return email;
}

export async function changeEditorRole(
  value: unknown,
  roleValue: unknown,
  previousValue: unknown,
  actor: string
) {
  const email = editableEmail(value);
  const role = validRole(roleValue);
  const previousRole = validRole(previousValue);
  await getDb().transaction(async (tx) => {
    const rows = await tx
      .update(editorAccess)
      .set({ role })
      .where(
        and(
          eq(editorAccess.email, email),
          eq(editorAccess.role, previousRole),
          isNull(editorAccess.revokedAt)
        )
      )
      .returning({ email: editorAccess.email });
    if (!rows.length)
      throw new ContentError(
        409,
        "Prístup sa medzičasom zmenil. Obnovte zoznam a skúste znova.",
        "ACCESS_CONFLICT"
      );
    if (role !== previousRole)
      await tx.insert(editorAccessAudit).values({
        id: randomUUID(),
        email,
        actor,
        previousRole,
        nextRole: role
      });
  });
  return email;
}

export async function revokeEditorAccess(value: unknown, actor: string) {
  const email = editableEmail(value);
  await getDb().transaction(async (tx) => {
    const [grant] = await tx
      .select({ role: editorAccess.role })
      .from(editorAccess)
      .where(and(eq(editorAccess.email, email), isNull(editorAccess.revokedAt)))
      .for("update");
    if (!grant) return;
    await tx
      .update(editorAccess)
      .set({ revokedAt: sql`now()`, revokedBy: actor })
      .where(eq(editorAccess.email, email));
    await tx
      .insert(editorAccessAudit)
      .values({ id: randomUUID(), email, actor, previousRole: grant.role });
  });
  return email;
}
