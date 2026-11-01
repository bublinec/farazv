/** The provider and admin APIs use slightly different error envelopes. */
export async function readAdminJson(response: Response) {
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Služba neodpovedá správne. Skúste požiadavku zopakovať.");
  }
  if (!response.ok) {
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : data?.error?.message || "Požiadavka zlyhala. Skúste znova."
    );
  }

  return data;
}
