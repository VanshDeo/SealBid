import { z } from "zod";

const envSchema = z.object({
  // Client-side public environment variables
  NEXT_PUBLIC_MIDNIGHT_NETWORK_ID: z.string().default("undeployed-testnet"),
  NEXT_PUBLIC_MIDNIGHT_INDEXER_URL: z
    .string()
    .url()
    .default("https://indexer.testnet.midnight.network"),
  NEXT_PUBLIC_MIDNIGHT_NODE_URL: z.string().url().default("https://rpc.testnet.midnight.network"),
  NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER_URL: z.string().default("http://localhost:6300"),
  NEXT_PUBLIC_MIDNIGHT_SEALBID_CONTRACT_ADDRESS: z
    .string()
    .default("0x0000000000000000000000000000000000000000000000000000000000000000"),

  // Server-side private environment variables
  MIDNIGHT_RELAYER_PRIVATE_KEY: z.string().optional(),
  MIDNIGHT_PROOF_GENERATOR_SECRET: z.string().optional(),
});

/**
 * Validates and exposes type-safe application environment configuration.
 */
export function getEnv() {
  const env = {
    NEXT_PUBLIC_MIDNIGHT_NETWORK_ID: process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK_ID,
    NEXT_PUBLIC_MIDNIGHT_INDEXER_URL: process.env.NEXT_PUBLIC_MIDNIGHT_INDEXER_URL,
    NEXT_PUBLIC_MIDNIGHT_NODE_URL: process.env.NEXT_PUBLIC_MIDNIGHT_NODE_URL,
    NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER_URL: process.env.NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER_URL,
    NEXT_PUBLIC_MIDNIGHT_SEALBID_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_MIDNIGHT_SEALBID_CONTRACT_ADDRESS,
    MIDNIGHT_RELAYER_PRIVATE_KEY: process.env.MIDNIGHT_RELAYER_PRIVATE_KEY,
    MIDNIGHT_PROOF_GENERATOR_SECRET: process.env.MIDNIGHT_PROOF_GENERATOR_SECRET,
  };

  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.format());
    // Fallback to default safe values in development mode
    return envSchema.parse({});
  }

  return parsed.data;
}

export const env = getEnv();
