export class BaseError extends Error {
  status: number;
  defaultMessage: string;
  constructor(status: number, defaultMessage: string, message?: string) {
    super(message);
    this.status = status;
    this.defaultMessage = defaultMessage;
    this.message = message ? `${defaultMessage} : ${message}` : defaultMessage;
  }
}

export class BadRequestError extends BaseError {
  constructor(message?: string) {
    super(400, 'Bad Request', message);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message?: string) {
    super(401, 'Unauthorized', message);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message?: string) {
    super(403, 'Forbidden', message);
  }
}

export class NotFoundError extends BaseError {
  constructor(message?: string) {
    super(404, 'Not Found', message);
  }
}

export class InternalServerError extends BaseError {
  constructor(message?: string) {
    super(500, 'Internal Server Error', message);
  }
}
