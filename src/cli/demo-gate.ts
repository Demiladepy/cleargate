import { banner, beatCaption } from "../util/banner";
import { config } from "../config";
import { listSupportedChains } from "../chains/index";
import {
  evaluateClearSignGate,
  formatVerdictForConsole,
  loadRegistryIndex,
  createFormatOptions,
} from "../gate/clearSignGate";
import {
  buildBlindSignTransaction,
  buildClearSignableTransfer,
  buildNativeTransfer,
  describeTransaction,
} from "../tx/builders";

async function main(): Promise<void> {
  const chainId = config.chainId;
  const index = await loadRegistryIndex();
  const formatOptions = createFormatOptions(index);

  console.log(banner(beatCaption("gate"), "gate"));
  console.log(`Chain: ${config.chain.name} (${chainId})`);
  console.log(
    `Built-in chains: ${listSupportedChains()
      .map((c) => `${c.name}=${c.id}`)
      .join(", ")}`,
  );
  console.log("Set CHAIN_ID + RPC_URL for any other EVM chain.\n");

  const cases = [
    {
      label: "1. Clear-signable ERC-20 / native transfer",
      tx: buildClearSignableTransfer(config.recipient, chainId),
    },
    {
      label: "2. Native ETH transfer (always readable envelope)",
      tx: buildNativeTransfer(config.recipient, 1_000_000_000_000_000n, chainId),
    },
    {
      label: "3. Blind-sign fallback (opaque contract call)",
      tx: buildBlindSignTransaction(chainId),
    },
  ];

  for (const { label, tx } of cases) {
    console.log(`\n${"═".repeat(60)}`);
    console.log(label);
    console.log("─".repeat(60));
    console.log(describeTransaction(tx));
    const verdict = await evaluateClearSignGate(tx, formatOptions);
    console.log("\n" + formatVerdictForConsole(verdict));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
