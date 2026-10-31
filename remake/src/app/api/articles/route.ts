import {
  getPublicEditorialPage,
  parsePublicCursor
} from "@/server/public-content";
import { InvalidEditorialCursor } from "@/lib/editorial";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    return Response.json(
      await getPublicEditorialPage(
        "article",
        parsePublicCursor(new URL(request.url).searchParams)
      ),
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof InvalidEditorialCursor)
      return Response.json({ error: error.message }, { status: 400 });
    return Response.json(
      { error: "Obsah je dočasne nedostupný. Skúste to znova." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
