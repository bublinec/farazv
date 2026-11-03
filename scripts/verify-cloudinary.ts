import { v2 as cloudinary } from "cloudinary";
import { createUploadSignature, completeUpload } from "../src/server/uploads";
import { loadLocalEnvironment } from "./environment";

/** Explicit live provider check. Creates and deletes only its own generated test asset. */
async function main() {
  loadLocalEnvironment();
  if (process.argv[2] !== "--confirm-live-upload")
    throw new Error(
      "Use --confirm-live-upload to create and remove one temporary Cloudinary image."
    );
  const email = process.env.ADMIN_EMAIL_ALLOWLIST?.split(/[,\n]/)[0]?.trim();
  if (!email)
    throw new Error(
      "Configure an editor allowlist before the live upload check."
    );
  const pixel = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZxkAAAAASUVORK5CYII=",
    "base64"
  );
  const signed = createUploadSignature(
    {
      filename: "farazv-verification.png",
      mimeType: "image/png",
      size: pixel.byteLength
    },
    email
  );
  const publicId = signed.fields.public_id;
  if (!/^farazv-remake\/\d{4}\/\d{2}\/[a-f0-9-]{36}$/.test(publicId))
    throw new Error("Invalid temporary upload namespace.");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  try {
    const form = new FormData();
    for (const [key, value] of Object.entries(signed.fields))
      form.set(key, String(value));
    form.set(
      "file",
      new Blob([pixel], { type: "image/png" }),
      "farazv-verification.png"
    );
    const response = await fetch(signed.uploadUrl, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(30_000)
    });
    if (!response.ok)
      throw new Error("Cloudinary rejected the temporary upload.");
    const providerResponse = await response.json();
    const asset = await completeUpload(
      {
        ticket: signed.ticket,
        response: providerResponse,
        alt: "Dočasný test nahrávania"
      },
      email
    );
    if (asset.publicId !== publicId || asset.width !== 1 || asset.height !== 1)
      throw new Error(
        "The provider verification did not match the temporary image."
      );
    console.log(
      "Live Cloudinary signed upload and independent metadata verification passed."
    );
  } finally {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      type: "upload",
      invalidate: true
    });
    if (!["ok", "not found"].includes(result.result))
      throw new Error(
        "Temporary Cloudinary image cleanup needs owner attention."
      );
    console.log(
      "The temporary verification image was removed; existing media were not changed."
    );
  }
}
main().catch(() => {
  console.error(
    "Live Cloudinary verification failed; check provider access and the temporary namespace. No credentials were logged."
  );
  process.exitCode = 1;
});
