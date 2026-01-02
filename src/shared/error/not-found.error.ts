import { HttpError } from "./http.error.js";

export class NotFoundError extends HttpError {
  constructor(message: string = "Resource not found") {
    super(404, message);
  }
}
