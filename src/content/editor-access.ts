/** Only these roles can be granted or changed through CMS. */
export const EDITOR_ROLES = ["editor", "lektorka"] as const;
export type EditorGrantRole = (typeof EDITOR_ROLES)[number];
/** Administrator identity continues to come exclusively from environment configuration. */
export type EditorRole = "admin" | EditorGrantRole;

export function isEditorGrantRole(value: unknown): value is EditorGrantRole {
  return (
    typeof value === "string" && EDITOR_ROLES.includes(value as EditorGrantRole)
  );
}
export const EDITOR_ROLE_LABELS: Record<EditorGrantRole, string> = {
  editor: "Redaktor",
  lektorka: "Lektor / lektorka"
};
export interface EditorAccessGrant {
  email: string;
  role: EditorGrantRole;
  grantedBy: string;
  grantedAt: string;
}
export interface EditorAccessList {
  administrators: string[];
  editors: EditorAccessGrant[];
}
