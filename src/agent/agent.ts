import {
  evaluateClearSignGate,
  formatVerdictForConsole,
  loadRegistryIndex,
  createFormatOptions,
} from "../gate/clearSignGate";
import {
  applyMiddleware,
  type MiddlewareMode,
} from "../attack/rpcMiddleware";
import {
  buildClearSignableTransfer,
  buildNativeTransfer,
  describeTransaction,
  serializeForLedger,
  toUnsignedTransaction,
} from "../tx/builders";
import { config } from "../config";
import type { EvmTransaction } from "../types/transaction";

export type AgentRunOptions = {
  /** When true, refuse txs that would require blind signing */
  useGate: boolean;
  /** Middleware simulating compromised transport */
  middleware: MiddlewareMode;
  /** Auto-approve on Speculos (for recorded demos) */
  autoApprove?: boolean;
  /** Allow blind signing on device when gate is off (naive demo) */
  allowBlindSign?: boolean;
  /** When false, stop after gate evaluation (no DMK connection) */
  signOnDevice?: boolean;
  /** Use native ETH transfer (better Speculos clear-sign without origin token) */
  useNativeTransfer?: boolean;
  recipient?: `0x${string}`;
  chainId?: number;
};

export type AgentRunResult = {
  intended: EvmTransaction;
  actual: EvmTransaction;
  gateApplied: boolean;
  gateVerdict?: Awaited<ReturnType<typeof evaluateClearSignGate>>;
  signed: boolean;
  blindSigningDetected?: boolean;
  signature?: { r: string; s: string; v: number };
  error?: string;
  /** True when outcome is inferred without a connected device */
  simulated?: boolean;
};

export async function runAgentTransfer(
  options: AgentRunOptions,
): Promise<AgentRunResult> {
  const chainId = options.chainId ?? config.chainId;
  const recipient = options.recipient ?? config.recipient;

  const intended = options.useNativeTransfer
    ? buildNativeTransfer(recipient, 1_000_000_000_000_000n, chainId)
    : buildClearSignableTransfer(recipient, chainId);
  const actual = applyMiddleware(intended, options.middleware);

  console.log("\n── Agent intent (what the agent believes it is sending) ──");
  console.log(describeTransaction(intended));

  if (options.middleware !== "none") {
    console.log("\n── After transport middleware (what actually gets signed) ──");
    console.log(describeTransaction(actual));
  }

  const index = await loadRegistryIndex();
  const formatOptions = createFormatOptions(index);

  if (options.useGate) {
    const verdict = await evaluateClearSignGate(actual, formatOptions);
    console.log("\n" + formatVerdictForConsole(verdict));

    if (verdict.decision === "refuse") {
      return {
        intended,
        actual,
        gateApplied: true,
        gateVerdict: verdict,
        signed: false,
        error: verdict.reason,
      };
    }

    if (options.signOnDevice === false) {
      console.log("\n(dry run — would proceed to device for clear signing)");
      return {
        intended,
        actual,
        gateApplied: true,
        gateVerdict: verdict,
        signed: false,
      };
    }

    return await signWithDevice({
      intended,
      actual,
      gateApplied: true,
      gateVerdict: verdict,
      autoApprove: options.autoApprove,
      allowBlindSign: false,
    });
  }

  const verdict = await evaluateClearSignGate(actual, formatOptions);
  console.log("\n── Gate bypassed (naive agent) ──");
  console.log(`  Would be: ${verdict.decision.toUpperCase()} — ${verdict.reason}`);

  if (options.signOnDevice === false) {
    console.log(
      "\n⚠ Naive agent sends to device anyway → user would blind-sign a blank check",
    );
    return {
      intended,
      actual,
      gateApplied: false,
      gateVerdict: verdict,
      signed: true,
      blindSigningDetected: true,
      simulated: true,
    };
  }

  return await signWithDevice({
    intended,
    actual,
    gateApplied: false,
    gateVerdict: verdict,
    autoApprove: options.autoApprove,
    allowBlindSign: options.allowBlindSign ?? true,
  });
}

async function signWithDevice(params: {
  intended: EvmTransaction;
  actual: EvmTransaction;
  gateApplied: boolean;
  gateVerdict: Awaited<ReturnType<typeof evaluateClearSignGate>>;
  autoApprove?: boolean;
  allowBlindSign: boolean;
}): Promise<AgentRunResult> {
  const { createDmk, connectFirstDevice, disconnectDevice } = await import(
    "../ledger/dmk"
  );
  const { signTransactionOnDevice } = await import("../ledger/sign");

  const dmk = createDmk();
  let sessionId;

  try {
    console.log(`\nConnecting via ${config.transport}…`);
    sessionId = await connectFirstDevice(dmk);
    const unsigned = toUnsignedTransaction(params.actual);
    const serialized = serializeForLedger(unsigned);

    console.log("Requesting signature on device…");
    const outcome = await signTransactionOnDevice(dmk, sessionId, serialized, {
      autoApprove: params.autoApprove,
      allowBlindSign: params.allowBlindSign,
    });

    if (outcome.error) {
      console.log(`\n✗ Signing failed: ${outcome.error}`);
      if (outcome.steps.length) {
        console.log(`  Steps: ${outcome.steps.join(" → ")}`);
      }
      return {
        intended: params.intended,
        actual: params.actual,
        gateApplied: params.gateApplied,
        gateVerdict: params.gateVerdict,
        signed: false,
        blindSigningDetected: outcome.blindSigningDetected,
        error: outcome.error,
      };
    }

    console.log("\n✓ Transaction signed on device");
    if (outcome.blindSigningDetected) {
      console.log("  ⚠ BLIND SIGNING was used — user approved opaque data");
    } else {
      console.log("  Clear signing path");
    }

    return {
      intended: params.intended,
      actual: params.actual,
      gateApplied: params.gateApplied,
      gateVerdict: params.gateVerdict,
      signed: true,
      blindSigningDetected: outcome.blindSigningDetected,
      signature: outcome.signature,
    };
  } catch (error) {
    return {
      intended: params.intended,
      actual: params.actual,
      gateApplied: params.gateApplied,
      gateVerdict: params.gateVerdict,
      signed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    if (sessionId) {
      await disconnectDevice(dmk, sessionId).catch(() => undefined);
    }
  }
}
