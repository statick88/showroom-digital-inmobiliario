export function rethrow(error: unknown, message: string): never {
  throw new Error(message);
}

export function rethrowIfPresent(error: unknown, message: string): void {
  if (error) rethrow(error, message);
}
