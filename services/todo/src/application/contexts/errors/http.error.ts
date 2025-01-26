export class HttpError extends Error {
  constructor(public code: number, public body: unknown) {
    super(
      JSON.stringify({
        message: body,
      })
    );
  }
}

export class HttpUnauthorizedError extends HttpError {
  constructor() {
    super(401, "Unauthorized");
  }
}

export class HttpNotFoundError extends HttpError {
  constructor(msg: string) {
    super(404, msg);
  }
}

export class HttpUnprocessableContentError extends HttpError {
  constructor(errors: unknown[]) {
    super(422, errors);
  }
}
