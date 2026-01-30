export enum ContextErrorCode {
  ContextNotAvailable = 'context-not-available',
}

export class ContextError extends Error {
  constructor(
    public code: ContextErrorCode,
    message: string,
    public originalError?: any,
  ) {
    super(message);
    this.name = 'ContextError';

    if (originalError) {
      this.cause = originalError.stack;
    }
  }
}
