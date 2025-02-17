export class UserUnauthenticatedError extends Error {
  constructor() {
    super("User is not authenticated");
  }
}
