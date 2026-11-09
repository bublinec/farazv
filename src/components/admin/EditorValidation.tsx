"use client";

import { createContext, useContext, type ReactNode } from "react";

const ValidationContext = createContext<{
  field: string;
  message: string;
} | null>(null);

export function EditorValidation({
  field,
  message,
  children
}: {
  field: string;
  message: string;
  children: ReactNode;
}) {
  return (
    <ValidationContext.Provider value={field ? { field, message } : null}>
      {children}
    </ValidationContext.Provider>
  );
}

export function useFieldError(path?: string) {
  const error = useContext(ValidationContext);
  return path &&
    error &&
    (error.field === path || error.field.startsWith(`${path}.`))
    ? error.message
    : undefined;
}

/** The field path of the current server validation error, if any. */
export function useInvalidField() {
  return useContext(ValidationContext)?.field ?? "";
}
