import { HttpError } from "./http.error.js";

export class ValidationError extends HttpError {
  constructor(details: Record<string, string[]>) {
    super(400, "Validation failed", details);
  }
}
