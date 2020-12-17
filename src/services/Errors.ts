export class RateLimitExceeded extends Error {
  public httpCode: number

  constructor(message: string) {
    super(message)
    this.httpCode = 403
  }
}
