export function logRun(event: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.info("chaos:run", event);
  }
}
