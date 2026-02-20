/**
 * Error class for known/expected errors that should be displayed to the user
 * without a stack trace.
 */
export class HandledError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "HandledError";
    }
}
