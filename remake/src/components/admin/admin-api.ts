export class AdminRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code = "",
    readonly field = ""
  ) {
    super(message);
    this.name = "AdminRequestError";
  }
}

/** Keep provider messages and admin validation/conflict details in one parser. */
export async function readAdminJson(
  response: Response,
  fallbackMessage = "Požiadavka zlyhala. Skúste znova."
) {
  let data;
  try {
    data = await response.json();
  } catch {
    throw new AdminRequestError(
      "Služba neodpovedá správne. Skúste požiadavku zopakovať.",
      response.status
    );
  }
  if (!response.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : typeof data?.error?.message === "string"
        ? data.error.message
        : "";

    throw new AdminRequestError(
      message || fallbackMessage,
      response.status,
      typeof data?.code === "string" ? data.code : "",
      typeof data?.field === "string" ? data.field : ""
    );
  }

  return data;
}
