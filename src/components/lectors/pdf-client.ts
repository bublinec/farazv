import { readAdminJson } from "@/components/admin/admin-api";

/** Open a window in the click handler, before async fetch can trigger popup blocking. */
export async function fetchLectorPdf(
  url: string,
  options: { download?: boolean; headers?: HeadersInit; signal: AbortSignal }
): Promise<string> {
  const viewer = options.download ? null : window.open("about:blank", "_blank");
  if (viewer) {
    viewer.opener = null;
    viewer.document.title = "Pripravujeme rozpis";
    viewer.document.body.textContent = "Pripravujeme PDF rozpis…";
  }
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: options.signal,
      headers: options.headers
    });
    if (!response.ok) await readAdminJson(response);
    if (
      response.headers.get("content-type")?.split(";")[0] !== "application/pdf"
    )
      throw new Error("Služba nevrátila PDF. Skúste rozpis otvoriť znova.");
    const blob = await response.blob();
    if (options.signal.aborted) throw new DOMException("Aborted", "AbortError");
    const blobUrl = URL.createObjectURL(blob);
    const filename =
      /filename="([a-z0-9.-]+)"/.exec(
        response.headers.get("content-disposition") ?? ""
      )?.[1] ?? "rozpis-lektorov.pdf";
    if (viewer && !viewer.closed) viewer.location.href = blobUrl;
    else {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
    }
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    return blobUrl;
  } catch (error) {
    viewer?.close();
    throw error;
  }
}
