import "server-only";
import { JsonBodyError, PRIVATE_RESPONSE_HEADERS, readJsonBody } from "./http";
import {
  createHash,
  createHmac,
  randomUUID,
  timingSafeEqual
} from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { AccessError } from "@/lib/auth-policy";
import {
  canonicalCloudinaryImage,
  UPLOAD_FORMATS,
  UPLOAD_MAX_BYTES
} from "@/lib/media-validation";

const UPLOAD_TICKET_AGE = 5 * 60;
const IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif"
]);

export class UploadError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "UploadError";
  }
}

function uploadConfiguration() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (
    !cloudName ||
    !/^[a-zA-Z0-9_-]+$/.test(cloudName) ||
    !apiKey ||
    !apiSecret
  ) {
    throw new AccessError(
      503,
      "Nahrávanie obrázkov ešte nie je nastavené.",
      "UPLOAD_NOT_CONFIGURED"
    );
  }
  return { cloudName, apiKey, apiSecret };
}

interface UploadTicket {
  publicId: string;
  cloudName: string;
  email: string;
  issuedAt: number;
  expiresAt: number;
  maxBytes: number;
}

function ticketSignature(payload: string, secret: string) {
  return createHmac("sha256", secret)
    .update(`farazv-upload-v1.${payload}`)
    .digest("base64url");
}

function signTicket(ticket: UploadTicket, secret: string) {
  const payload = Buffer.from(JSON.stringify(ticket)).toString("base64url");
  return `${payload}.${ticketSignature(payload, secret)}`;
}

function equal(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyUploadTicket(
  value: unknown,
  email: string,
  now = Date.now()
): UploadTicket {
  const { cloudName, apiSecret } = uploadConfiguration();
  if (typeof value !== "string" || value.length > 2000)
    throw new UploadError(400, "Chýba platné potvrdenie nahrávania.");
  const parts = value.split(".");
  if (
    parts.length !== 2 ||
    !equal(parts[1], ticketSignature(parts[0], apiSecret))
  )
    throw new UploadError(400, "Potvrdenie nahrávania nie je platné.");
  try {
    const ticket = JSON.parse(
      Buffer.from(parts[0], "base64url").toString()
    ) as UploadTicket;
    if (
      ticket.cloudName !== cloudName ||
      ticket.email !== email ||
      !/^farazv-remake\/\d{4}\/\d{2}\/[a-f0-9-]{36}$/.test(ticket.publicId) ||
      ticket.maxBytes !== UPLOAD_MAX_BYTES ||
      !Number.isSafeInteger(ticket.issuedAt) ||
      !Number.isSafeInteger(ticket.expiresAt) ||
      ticket.issuedAt > Math.floor(now / 1000) + 30 ||
      ticket.expiresAt !== ticket.issuedAt + UPLOAD_TICKET_AGE ||
      ticket.expiresAt <= Math.floor(now / 1000)
    ) {
      throw new Error("Invalid ticket");
    }
    return ticket;
  } catch {
    throw new UploadError(
      400,
      "Platnosť nahrávania vypršala. Vyberte obrázok znova."
    );
  }
}

export function createUploadSignature(
  input: unknown,
  email: string,
  now = Date.now()
) {
  if (!input || typeof input !== "object")
    throw new UploadError(400, "Vyberte obrázok na nahranie.");
  const file = input as Record<string, unknown>;
  if (
    typeof file.filename !== "string" ||
    !file.filename.trim() ||
    file.filename.length > 240 ||
    typeof file.mimeType !== "string" ||
    !IMAGE_MIMES.has(file.mimeType) ||
    typeof file.size !== "number" ||
    !Number.isSafeInteger(file.size) ||
    file.size <= 0 ||
    file.size > UPLOAD_MAX_BYTES
  ) {
    throw new UploadError(
      400,
      "Vyberte obrázok JPG, PNG, WebP, AVIF alebo GIF do 10 MB. PDF sa tu nenahrávajú."
    );
  }
  const config = uploadConfiguration();
  const issuedAt = Math.floor(now / 1000);
  const date = new Date(now);
  const publicId = `farazv-remake/${date.getUTCFullYear()}/${String(
    date.getUTCMonth() + 1
  ).padStart(2, "0")}/${randomUUID()}`;
  const parameters = {
    timestamp: String(issuedAt),
    public_id: publicId,
    overwrite: "false",
    allowed_formats: UPLOAD_FORMATS.join(","),
    type: "upload"
  };
  // The browser receives only these fixed fields, never the API secret.
  const signature = cloudinary.utils.api_sign_request(
    parameters,
    config.apiSecret
  );
  const expiresAt = issuedAt + UPLOAD_TICKET_AGE;
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    fields: { ...parameters, api_key: config.apiKey, signature },
    ticket: signTicket(
      {
        publicId,
        cloudName: config.cloudName,
        email,
        issuedAt,
        expiresAt,
        maxBytes: UPLOAD_MAX_BYTES
      },
      config.apiSecret
    ),
    maxBytes: UPLOAD_MAX_BYTES,
    expiresAt: new Date(expiresAt * 1000).toISOString()
  };
}

export interface VerifiedUploadAsset {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  publicId: string;
  format: string;
  bytes: number;
}

export async function completeUpload(
  input: unknown,
  email: string,
  fetchResource: typeof fetch = fetch
): Promise<VerifiedUploadAsset> {
  if (!input || typeof input !== "object")
    throw new UploadError(400, "Nahraný obrázok sa nepodarilo overiť.");
  const body = input as Record<string, unknown>;
  const ticket = verifyUploadTicket(body.ticket, email);
  if (
    typeof body.alt !== "string" ||
    !body.alt.trim() ||
    body.alt.length > 500 ||
    (body.caption !== undefined &&
      (typeof body.caption !== "string" || body.caption.length > 2000))
  ) {
    throw new UploadError(
      400,
      "Doplňte stručný alternatívny text obrázka (najviac 500 znakov)."
    );
  }
  const response = body.response as Record<string, unknown> | undefined;
  const { cloudName, apiKey, apiSecret } = uploadConfiguration();
  if (
    !response ||
    response.public_id !== ticket.publicId ||
    !Number.isSafeInteger(response.version) ||
    (response.version as number) < 1 ||
    typeof response.signature !== "string"
  )
    throw new UploadError(400, "Odpoveď nahrávania nepatrí k tomuto obrázku.");
  // Cloudinary response signatures cover public_id/version, not dimensions or bytes.
  const expected = createHash("sha1")
    .update(
      `public_id=${ticket.publicId}&version=${response.version}${apiSecret}`
    )
    .digest("hex");
  if (!equal(response.signature, expected))
    throw new UploadError(400, "Podpis nahraného obrázka nie je platný.");
  let resource: Record<string, unknown>;
  try {
    const result = await fetchResource(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload/${encodeURIComponent(
        ticket.publicId
      )}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${apiKey}:${apiSecret}`
          ).toString("base64")}`
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000)
      }
    );
    if (!result.ok) throw new Error("Cloudinary resource lookup failed");
    resource = await result.json();
  } catch {
    throw new UploadError(
      502,
      "Cloudinary teraz neodpovedá. Obrázok sa nestratil; skúste overenie znova."
    );
  }
  if (
    resource.public_id !== ticket.publicId ||
    resource.version !== response.version ||
    resource.resource_type !== "image" ||
    resource.type !== "upload" ||
    typeof resource.format !== "string" ||
    !UPLOAD_FORMATS.includes(
      resource.format as (typeof UPLOAD_FORMATS)[number]
    ) ||
    typeof resource.bytes !== "number" ||
    !Number.isSafeInteger(resource.bytes) ||
    resource.bytes <= 0 ||
    resource.bytes > UPLOAD_MAX_BYTES ||
    typeof resource.width !== "number" ||
    !Number.isSafeInteger(resource.width) ||
    resource.width < 1 ||
    resource.width > 20000 ||
    typeof resource.height !== "number" ||
    !Number.isSafeInteger(resource.height) ||
    resource.height < 1 ||
    resource.height > 20000 ||
    typeof resource.created_at !== "string" ||
    new Date(resource.created_at).getTime() < ticket.issuedAt * 1000 - 30000 ||
    new Date(resource.created_at).getTime() > Date.now() + 30000 ||
    !Number.isFinite(new Date(resource.created_at).getTime())
  ) {
    throw new UploadError(
      400,
      "Obrázok nespĺňa pravidlá nahrávania (typ, rozmery alebo veľkosť do 10 MB)."
    );
  }
  return {
    src: canonicalCloudinaryImage(
      cloudName,
      ticket.publicId,
      resource.version as number,
      resource.format
    ),
    width: resource.width,
    height: resource.height,
    alt: body.alt.trim(),
    ...(typeof body.caption === "string" && body.caption.trim()
      ? { caption: body.caption.trim() }
      : {}),
    publicId: ticket.publicId,
    format: resource.format,
    bytes: resource.bytes
  };
}

export async function readUploadBody(request: Request): Promise<unknown> {
  try {
    return await readJsonBody(request, 32000);
  } catch (error) {
    if (!(error instanceof JsonBodyError)) throw error;
    if (error.reason === "unsupported-type")
      throw new UploadError(415, "Očakávame JSON požiadavku.");
    if (error.reason === "too-large")
      throw new UploadError(413, "Požiadavka je príliš veľká.");
    throw new UploadError(400, "Požiadavka nemá platný formát.");
  }
}

export function uploadErrorResponse(error: UploadError) {
  return Response.json(
    { error: error.message },
    {
      status: error.status,
      headers: PRIVATE_RESPONSE_HEADERS
    }
  );
}
