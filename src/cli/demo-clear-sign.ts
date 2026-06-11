import { banner, beatCaption, outcomeLine } from "../util/banner";
import { runAgentTransfer } from "../agent/agent";
import { config } from "../config";

async function main(): Promise<void> {
  console.log(banner(beatCaption(1), 1));
  console.log(`Chain: ${config.chain.name} (${config.chainId})`);
  console.log(`Transport: ${config.transport}\n`);

  const result = await runAgentTransfer({
    useGate: true,
    middleware: "none",
    autoApprove: process.env.AUTO_APPROVE === "1",
    // Native ETH clears on Speculos without Ledger origin token / plugin contexts
    useNativeTransfer: config.transport === "speculos",
  });

  console.log("\n" + outcomeLine(result.signed, result.blindSigningDetected));
  process.exit(result.signed ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
