import { banner, beatCaption, outcomeLine, recordingHint } from "../util/banner";
import { runAgentTransfer } from "../agent/agent";
import { config } from "../config";
import { waitForSpeculos } from "./wait-speculos";

const withDevice = process.argv.includes("--device");

async function runBeat(
  title: string,
  fn: () => Promise<{
    signed: boolean;
    blindSigningDetected?: boolean;
    gateRefused?: boolean;
  }>,
): Promise<void> {
  console.log(banner(title));
  const result = await fn();
  console.log(
    "\n" +
      outcomeLine(result.signed, result.blindSigningDetected, result.gateRefused),
  );
  console.log("");
}

async function main(): Promise<void> {
  console.log("ClearGate — full demo sequence");
  console.log(`Chain: ${config.chain.name} (${config.chainId})`);
  console.log(withDevice ? "Mode: device (Speculos)" : "Mode: dry run (no device)");
  console.log(recordingHint());

  if (withDevice) {
    await waitForSpeculos();
  }

  const signOnDevice = withDevice;
  const autoApprove = withDevice && process.env.AUTO_APPROVE === "1";

  await runBeat(beatCaption(1), async () => {
    const r = await runAgentTransfer({
      useGate: true,
      middleware: "none",
      signOnDevice,
      autoApprove,
    });
    return { signed: r.signed, blindSigningDetected: r.blindSigningDetected };
  });

  await runBeat(beatCaption(2), async () => {
    const r = await runAgentTransfer({
      useGate: false,
      middleware: "blind-rewrite",
      signOnDevice,
      autoApprove,
      allowBlindSign: true,
    });
    return { signed: r.signed, blindSigningDetected: r.blindSigningDetected };
  });

  await runBeat(beatCaption(3), async () => {
    const r = await runAgentTransfer({
      useGate: true,
      middleware: "blind-rewrite",
      signOnDevice,
      autoApprove,
    });
    return {
      signed: r.signed,
      gateRefused: r.gateVerdict?.decision === "refuse",
    };
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
