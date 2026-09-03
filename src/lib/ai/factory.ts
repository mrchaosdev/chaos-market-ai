import type { AIProvider } from "./provider";
import { LocalProvider } from "./providers/local";

export function createAIProvider(): AIProvider {
  return new LocalProvider();
}
