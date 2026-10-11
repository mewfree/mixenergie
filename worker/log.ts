export function logError(message: string, error: unknown): void {
  console.error(
    JSON.stringify({
      message,
      error: error instanceof Error ? error.message : String(error),
    }),
  );
}
