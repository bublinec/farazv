import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import {
  createUploadSignature,
  completeUpload,
  verifyUploadTicket,
  UploadError
} from "../src/server/uploads";
import {
  isTrustedCloudinaryImage,
  UPLOAD_MAX_BYTES
} from "../src/lib/media-validation";

process.env.CLOUDINARY_CLOUD_NAME = "test-parish";
process.env.CLOUDINARY_API_KEY = "test-only-key";
process.env.CLOUDINARY_API_SECRET = "test-only-cloudinary-secret";
const email = "editor@example.test";
const file = { filename: "kostol.jpg", mimeType: "image/jpeg", size: 1000 };

test("signed upload fields are server-selected and reject unsupported or oversized files", () => {
  const upload = createUploadSignature(
    { ...file, public_id: "replace-old-photo", overwrite: true },
    email
  );
  assert.match(
    upload.fields.public_id,
    /^farazv-remake\/\d{4}\/\d{2}\/[a-f0-9-]+$/
  );
  assert.equal(upload.fields.overwrite, "false");
  assert.equal(
    upload.uploadUrl,
    "https://api.cloudinary.com/v1_1/test-parish/image/upload"
  );
  assert.equal(upload.fields.allowed_formats.includes("pdf"), false);
  assert.equal(
    JSON.stringify(upload).includes(process.env.CLOUDINARY_API_SECRET!),
    false
  );
  for (const input of [
    { ...file, mimeType: "application/pdf" },
    { ...file, mimeType: "image/svg+xml" },
    { ...file, size: UPLOAD_MAX_BYTES + 1 },
    { ...file, size: 0 }
  ]) {
    assert.throws(
      () => createUploadSignature(input, email),
      (error) => error instanceof UploadError && error.status === 400
    );
  }
});

test("application upload tickets reject another editor, forgery, expiry and another account", () => {
  const now = Date.now();
  const upload = createUploadSignature(file, email, now);
  assert.equal(
    verifyUploadTicket(upload.ticket, email, now).publicId,
    upload.fields.public_id
  );
  assert.throws(() =>
    verifyUploadTicket(upload.ticket, "other@example.test", now)
  );
  assert.throws(() => verifyUploadTicket(`${upload.ticket}x`, email, now));
  assert.throws(() => verifyUploadTicket(upload.ticket, email, now + 301000));
  process.env.CLOUDINARY_CLOUD_NAME = "different-account";
  try {
    assert.throws(() => verifyUploadTicket(upload.ticket, email, now));
  } finally {
    process.env.CLOUDINARY_CLOUD_NAME = "test-parish";
  }
});

test("upload completion trusts verified provider metadata rather than forged browser URL, dimensions or bytes", async () => {
  const upload = createUploadSignature(file, email);
  const version = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1")
    .update(
      `public_id=${upload.fields.public_id}&version=${version}${process.env.CLOUDINARY_API_SECRET}`
    )
    .digest("hex");
  const input = {
    ticket: upload.ticket,
    alt: "Interiér farského kostola",
    response: {
      public_id: upload.fields.public_id,
      version,
      signature,
      secure_url: "https://attacker.test/picture.jpg",
      width: 99999,
      bytes: 1
    }
  };
  const trusted = {
    public_id: upload.fields.public_id,
    version,
    resource_type: "image",
    type: "upload",
    format: "jpg",
    width: 1200,
    height: 800,
    bytes: 1000,
    created_at: new Date().toISOString()
  };
  let calls = 0;
  const provider = (async (
    url: string | URL | Request,
    options?: RequestInit
  ) => {
    calls++;
    assert.ok(
      String(url).startsWith(
        "https://api.cloudinary.com/v1_1/test-parish/resources/image/upload/"
      )
    );
    assert.equal(options?.cache, "no-store");
    return Response.json(trusted);
  }) as typeof fetch;
  const asset = await completeUpload(input, email, provider);
  assert.equal(asset.width, 1200);
  assert.equal(asset.bytes, 1000);
  assert.equal(isTrustedCloudinaryImage(asset.src, "test-parish"), true);
  assert.equal(asset.src.includes("attacker"), false);
  assert.equal(calls, 1);
  await assert.rejects(
    completeUpload(
      { ...input, response: { ...input.response, signature: "forged" } },
      email,
      provider
    ),
    (error) => error instanceof UploadError && error.status === 400
  );
  assert.equal(calls, 1);
  await assert.rejects(
    completeUpload(input, email, (async () =>
      Response.json({
        ...trusted,
        bytes: UPLOAD_MAX_BYTES + 1
      })) as typeof fetch),
    (error) => error instanceof UploadError && error.status === 400
  );
  await assert.rejects(
    completeUpload(input, email, (async () => {
      throw new Error("Offline");
    }) as typeof fetch),
    (error) => error instanceof UploadError && error.status === 502
  );
});
