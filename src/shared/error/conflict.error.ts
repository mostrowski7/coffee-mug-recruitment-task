import { HttpError } from "./http.error.js";

export class ConflictError extends HttpError {
  constructor(message: string = "Conflict with the current state") {
    super(409, message);
  }
}
