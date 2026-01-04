import { HttpError } from "./http.error.js";

export class ValidationError extends HttpError {
  constructor(message: string = "Validation failed") {
    super(400, message);
  }
}
