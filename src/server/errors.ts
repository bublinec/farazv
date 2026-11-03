export class ContentError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string,
    public field?: string
  ) {
    super(message);
  }
}
export class ContentUnavailableError extends ContentError {
  constructor() {
    super(
      503,
      "Obsah je dočasne nedostupný. Skúste to, prosím, neskôr.",
      "CONTENT_UNAVAILABLE"
    );
  }
}
