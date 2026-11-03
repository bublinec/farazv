"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import type { RecordKind } from "@/content/documents";

type AdminSection = "bulletin" | "posts" | "article" | "settings";

const AdminSectionContext = createContext<{
  section: AdminSection | null;
  setSection: (section: AdminSection | null) => void;
} | null>(null);

export function AdminSectionProvider({ children }: { children: ReactNode }) {
  const [section, setSection] = useState<AdminSection | null>(null);

  return (
    <AdminSectionContext value={{ section, setSection }}>
      {children}
    </AdminSectionContext>
  );
}

export function useActiveAdminSection() {
  return useContext(AdminSectionContext)?.section ?? null;
}

/** Record routes share one URL shape; the loaded record supplies its section. */
export function useAdminSection(kind: RecordKind) {
  const context = useContext(AdminSectionContext);
  const setSection = context?.setSection;

  useEffect(() => {
    const section =
      kind === "bulletin" || kind === "article" || kind === "settings"
        ? kind
        : "posts";
    setSection?.(section);
    return () => setSection?.(null);
  }, [kind, setSection]);
}
