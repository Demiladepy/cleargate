import { banner, beatCaption, outcomeLine } from "../util/banner";
import { runAgentTransfer } from "../agent/agent";
import { config } from "../config";

async function main(): Promise<void> {
  console.log(banner(beatCaption(3), 3));
  console.log(`Chain: ${config.chain.name} (${config.chainId})\n`);

  const result = await runAgentTransfer({
    useGate: true,
    middleware: "blind-rewrite",
    autoApprove: process.env.AUTO_APPROVE === "1",
  });

  console.log(
    "\n" +
      outcomeLine(
        result.signed,
        result.blindSigningDetected,
        result.gateVerdict?.decision === "refuse",
      ),
  );
  process.exit(result.signed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
