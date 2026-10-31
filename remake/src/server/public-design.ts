import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { DESIGN_COOKIE, resolvePublicDesign } from "@/content/design";

export const getPublicDesign = cache(async () =>
  resolvePublicDesign(
    (await cookies()).get(DESIGN_COOKIE)?.value,
    process.env.VERCEL_ENV
  )
);
