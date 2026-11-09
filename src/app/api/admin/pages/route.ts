import { adminResponse, readJson } from "@/server/admin-http";
import { createPage, listPages, openBuiltInPage } from "@/server/page-store";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return adminResponse(request, () => listPages());
}

/** `{ route }` opens a built-in page; `{ group, title, slug? }` adds a new one. */
export function POST(request: Request) {
  return adminResponse(
    request,
    async (identity) => {
      const body = await readJson(request);

      if (typeof body.route === "string")
        return openBuiltInPage(body.route, identity.email);
      return createPage(body.group, body.title, body.slug, identity.email);
    },
    201
  );
}
