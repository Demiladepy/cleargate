import "dotenv/config";
import { resolveChain, getRpcUrl } from "./chains/index";

const chainId = Number(process.env.CHAIN_ID ?? "11155111");

export const config = {
  chainId,
  chain: resolveChain(chainId),
  rpcUrl: getRpcUrl(chainId, process.env.RPC_URL || undefined),
  transport: (process.env.TRANSPORT ?? "speculos") as "speculos" | "hid",
  speculosUrl: process.env.SPECULOS_URL ?? "http://127.0.0.1:5000",
  speculosControllerUrl:
    process.env.SPECULOS_CONTROLLER_URL ?? "http://127.0.0.1:5000",
  speculosModel: process.env.SPECULOS_MODEL ?? "nanox",
  derivationPath: process.env.DERIVATION_PATH ?? "44'/60'/0'/0/0",
  originToken: process.env.LEDGER_ORIGIN_TOKEN,
  recipient: (process.env.RECIPIENT ??
    "0x000000000000000000000000000000000000dEaD") as `0x${string}`,
  attacker: (process.env.ATTACKER ??
    "0x000000000000000000000000000000000000bEEF") as `0x${string}`,
  /** Placeholder drain contract — opaque calldata, no ERC-7730 descriptor */
  blindDrainContract: "0x000000000000000000000000000000000000c0de" as `0x${string}`,
};
