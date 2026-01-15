/**
 * Error class for known/expected errors that should be displayed to the user
 * without a stack trace.
 */
export class HandledError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "HandledError";
    }
}
