"use client";

import { createAuthClient } from "better-auth/react";

// Same-origin endpoint; no server configuration or credentials enter this bundle.
export const authClient = createAuthClient();
