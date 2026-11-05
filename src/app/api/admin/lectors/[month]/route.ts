import { lectorAdminResponse, lectorPdfResponse } from "@/server/lector-http";
import {
  getAdminLectorPdf,
  saveLectorSchedule,
  deleteLectorSchedule
} from "@/server/lector-store";
import {
  readLectorPdf,
  lectorRequestVersion,
  validateLectorMonth
} from "@/server/lector-validation";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ month: string }> };
export function GET(request: Request, context: Context) {
  return lectorAdminResponse(request, async () => {
    const month = validateLectorMonth((await context.params).month);
    return lectorPdfResponse(await getAdminLectorPdf(month), month);
  });
}
export function PUT(request: Request, context: Context) {
  return lectorAdminResponse(request, async (identity) => {
    const month = (await context.params).month;
    const version = lectorRequestVersion(request);
    return saveLectorSchedule(
      month,
      version,
      await readLectorPdf(request),
      identity.email
    );
  });
}
export function DELETE(request: Request, context: Context) {
  return lectorAdminResponse(request, async (identity) =>
    deleteLectorSchedule(
      (await context.params).month,
      lectorRequestVersion(request),
      identity.email
    )
  );
}
