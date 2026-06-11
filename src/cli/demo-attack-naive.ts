import { banner, beatCaption, outcomeLine } from "../util/banner";
import { runAgentTransfer } from "../agent/agent";
import { config } from "../config";

async function main(): Promise<void> {
  console.log(banner(beatCaption(2), 2));
  console.log("Attack: tampered transport middleware rewrites tx in flight.");
  console.log(`Chain: ${config.chain.name} (${config.chainId})\n`);

  const result = await runAgentTransfer({
    useGate: false,
    middleware: "blind-rewrite",
    autoApprove: process.env.AUTO_APPROVE === "1",
    allowBlindSign: true,
  });

  console.log("\n" + outcomeLine(result.signed, result.blindSigningDetected));
  process.exit(result.signed ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
