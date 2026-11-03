export type EditorRole = "admin" | "editor";

export interface EditorAccessGrant {
  email: string;
  grantedBy: string;
  grantedAt: string;
}

export interface EditorAccessList {
  administrators: string[];
  editors: EditorAccessGrant[];
}
