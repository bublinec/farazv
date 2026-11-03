import assert from "node:assert/strict";
import { test } from "node:test";
import { readJsonBody, JsonBodyError } from "../src/server/http";
import { readJson } from "../src/server/admin-http";
import { ContentError } from "../src/server/errors";
import { readUploadBody, UploadError } from "../src/server/uploads";

function request(body?: string, contentType = "application/json") {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body
  });
}

test("JSON reader counts streamed UTF-8 bytes and cancels an oversized body", async () => {
  const bytes = new TextEncoder().encode('{"text":"ž"}');
  let cursor = 0;
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      // Deliberately split the multibyte character across chunks.
      controller.enqueue(bytes.slice(cursor, ++cursor));
    },
    cancel() {
      cancelled = true;
    }
  });
  const streamed = new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": "1" },
    body: stream,
    duplex: "half"
  } as RequestInit);
  await assert.rejects(
    readJsonBody(streamed, bytes.byteLength - 1),
    (error) => error instanceof JsonBodyError && error.reason === "too-large"
  );
  assert.equal(cancelled, true);
  assert.deepEqual(
    await readJsonBody(request('{"text":"ž"}'), bytes.byteLength),
    { text: "ž" }
  );
});

test("JSON reader distinguishes type, absent body and invalid JSON", async () => {
  for (const [input, reason] of [
    [request("{}", "text/plain"), "unsupported-type"],
    [request("{}", "application/jsonp"), "unsupported-type"],
    [request("{}", "application/json-invalid"), "unsupported-type"],
    [request(), "missing"],
    [request(""), "invalid-json"],
    [request("{"), "invalid-json"]
  ] as const) {
    await assert.rejects(
      readJsonBody(input, 100),
      (error) => error instanceof JsonBodyError && error.reason === reason
    );
  }
  assert.deepEqual(
    await readJsonBody(request("[]", "Application/JSON; charset=UTF-8"), 2),
    []
  );
});

test("admin and upload readers retain their own shape rules, limits and errors", async () => {
  await assert.rejects(
    readJson(request("[]")),
    (error) =>
      error instanceof ContentError &&
      error.status === 400 &&
      error.code === "INVALID_BODY"
  );
  assert.equal(await readUploadBody(request("null")), null);
  assert.deepEqual(await readJson(request("{}")), {});
  await assert.rejects(
    readJson(request('"' + "a".repeat(2_100_000) + '"')),
    (error) =>
      error instanceof ContentError &&
      error.status === 413 &&
      error.code === "BODY_TOO_LARGE"
  );
  await assert.rejects(
    readUploadBody(request('"' + "a".repeat(32_000) + '"')),
    (error) => error instanceof UploadError && error.status === 413
  );
  for (const read of [readJson, readUploadBody]) {
    await assert.rejects(
      read(request("{}", "text/plain")),
      (error) =>
        (error instanceof ContentError || error instanceof UploadError) &&
        error.status === 415
    );
    await assert.rejects(
      read(request()),
      (error) =>
        (error instanceof ContentError || error instanceof UploadError) &&
        error.status === 400
    );
  }
});

test("JSON reader releases the stream lock after success and malformed input", async () => {
  const valid = request("{}");
  await readJsonBody(valid, 100);
  assert.equal(valid.body?.locked, false);
  const invalid = request("{");
  await assert.rejects(readJsonBody(invalid, 100), JsonBodyError);
  assert.equal(invalid.body?.locked, false);
});

test("a failed stream cancellation cannot replace the oversized-body error", async () => {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(10));
    },
    cancel() {
      throw new Error("Transport cancellation failed");
    }
  });
  const input = new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: stream,
    duplex: "half"
  } as RequestInit);
  await assert.rejects(
    readJsonBody(input, 5),
    (error) => error instanceof JsonBodyError && error.reason === "too-large"
  );
  assert.equal(input.body?.locked, false);
});
