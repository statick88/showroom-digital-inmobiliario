export function rethrow(error: unknown, message: string): never {
  console.error(`[${message}]`, error);
  throw new Error(message);
}

export function rethrowIfPresent(error: unknown, message: string): void {
  if (error) rethrow(error, message);
}
