/** The provider and admin APIs use slightly different error envelopes. */
export async function readAdminJson(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : data.error?.message || "Požiadavka zlyhala. Skúste znova."
    );
  }

  return data;
}
