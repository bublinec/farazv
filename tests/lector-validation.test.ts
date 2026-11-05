import assert from "node:assert/strict";
import { test } from "node:test";
import { lectorMonths, lectorMonthLabel } from "../src/lib/lector-schedules";
import {
  validateLectorPdf,
  validateLectorPassword,
  validateLectorMonth,
  validateLectorVersion,
  LECTOR_PDF_MAX_BYTES
} from "../src/server/lector-validation";
import {
  verifyLectorPasscode,
  hashLectorSessionToken
} from "../src/server/lector-crypto";

export const smallPdf = Buffer.from(
  "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n"
);

test("lector months use Bratislava midnight and roll December into the next year", () => {
  assert.deepEqual(lectorMonths(new Date("2026-12-31T23:30:00Z")), [
    "2027-01",
    "2027-02"
  ]);
  assert.deepEqual(lectorMonths(new Date("2026-12-31T21:30:00Z")), [
    "2026-12",
    "2027-01"
  ]);
  assert.deepEqual(lectorMonths(new Date("2026-03-31T22:30:00Z")), [
    "2026-04",
    "2026-05"
  ]);
  assert.equal(
    lectorMonths(new Date("2026-11-30T22:59:59.999Z"))[0],
    "2026-11"
  );
  assert.equal(
    lectorMonths(new Date("2026-11-30T23:00:00.000Z"))[0],
    "2026-12"
  );
  assert.equal(
    lectorMonths(new Date("2026-06-30T21:59:59.999Z"))[0],
    "2026-06"
  );
  assert.equal(
    lectorMonths(new Date("2026-06-30T22:00:00.000Z"))[0],
    "2026-07"
  );
  assert.equal(lectorMonthLabel("2026-11"), "november 2026");
  for (const value of ["2026-00", "2026-13", "2026-1", "../../secret", null])
    assert.throws(() => validateLectorMonth(value));
  assert.equal(validateLectorMonth("2026-12"), "2026-12");
  for (const value of [-1, 1.2, "1", NaN, undefined])
    assert.throws(() => validateLectorVersion(value));
  assert.equal(validateLectorVersion(0), 0);
});

test("PDF upload rejects disguised files, truncation and oversize without trusting MIME", () => {
  assert.deepEqual(validateLectorPdf(smallPdf), smallPdf);
  for (const value of [
    Buffer.from("<html>%PDF-1.4</html>"),
    Buffer.from("%PDF-1.7\ntruncated"),
    Buffer.alloc(LECTOR_PDF_MAX_BYTES + 1)
  ])
    assert.throws(() => validateLectorPdf(value));
});

test("single password accepts eight characters, preserves spaces and Unicode, and never trims", async () => {
  assert.equal(validateLectorPassword("abcdefgh"), "abcdefgh");
  assert.equal(validateLectorPassword(" lektori "), " lektori ");
  assert.equal(validateLectorPassword("čítanie8"), "čítanie8");
  for (const value of [
    "1234567",
    " ".repeat(8),
    "a".repeat(129),
    null,
    12345678
  ])
    assert.throws(() => validateLectorPassword(value));
  assert.equal(verifyLectorPasscode(" lektori ", " lektori "), true);
  assert.equal(verifyLectorPasscode("lektori", " lektori "), false);
  assert.equal(verifyLectorPasscode("wrongpwd", " lektori "), false);
  assert.equal(verifyLectorPasscode(null, "abcdefgh"), false);
  assert.equal(verifyLectorPasscode("čítanie8", "čítanie8"), true);
  const tokenHash = hashLectorSessionToken("opaque-token", "passcode1");
  assert.match(tokenHash, /^[a-f0-9]{64}$/);
  assert.notEqual(
    tokenHash,
    hashLectorSessionToken("other-token", "passcode1")
  );
  assert.notEqual(
    tokenHash,
    hashLectorSessionToken("opaque-token", "passcode2")
  );
});

test("PDF body limits count actual streamed bytes and ignore forged Content-Length", async () => {
  const { readLectorPdf } = await import("../src/server/lector-validation");
  const request = new Request("http://localhost/api/admin/lectors/2026-11", {
    method: "PUT",
    headers: { "content-type": "application/pdf", "content-length": "1" },
    body: new Uint8Array(smallPdf)
  });
  assert.deepEqual(await readLectorPdf(request), smallPdf);
  const oversized = new Request("http://localhost/api/admin/lectors/2026-11", {
    method: "PUT",
    headers: { "content-type": "application/pdf", "content-length": "1" },
    body: new Uint8Array(LECTOR_PDF_MAX_BYTES + 1)
  });
  await assert.rejects(readLectorPdf(oversized), /najviac 3 MB/);
});
