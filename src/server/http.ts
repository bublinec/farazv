import "server-only";

export const PRIVATE_RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow"
};

type BodyFailure =
  | "unsupported-type"
  | "missing"
  | "too-large"
  | "invalid-json";

export class JsonBodyError extends Error {
  constructor(readonly reason: BodyFailure) {
    super(reason);
  }
}

/** Count bytes while streaming; Content-Length is optional and untrusted. */
export async function readJsonBody(
  request: Request,
  maxBytes: number
): Promise<unknown> {
  const mediaType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (mediaType !== "application/json")
    throw new JsonBodyError("unsupported-type");

  const reader = request.body?.getReader();
  if (!reader) throw new JsonBodyError("missing");

  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        // A broken transport must not replace or delay the size-limit response.
        void reader.cancel().catch(() => {});
        throw new JsonBodyError("too-large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new JsonBodyError("invalid-json");
  }
}
