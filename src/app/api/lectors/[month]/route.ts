import { lectorResponse, lectorPdfResponse } from "@/server/lector-http";
import { getPublicLectorPdf } from "@/server/lector-store";
import { validateLectorMonth } from "@/server/lector-validation";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export function GET(
  request: Request,
  context: { params: Promise<{ month: string }> }
) {
  return lectorResponse(async () => {
    const month = validateLectorMonth((await context.params).month);
    return lectorPdfResponse(await getPublicLectorPdf(request, month), month);
  });
}
