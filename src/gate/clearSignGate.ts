import {
  fetchPrebuiltRegistryIndex,
  format,
  type DisplayModel,
  type FormatOptions,
  type RegistryIndex,
} from "@ethereum-sourcify/clear-signing";
import type { EvmTransaction } from "../types/transaction";

export type GateDecision = "proceed" | "refuse";

export type GateVerdict = {
  decision: GateDecision;
  reason: string;
  mode: "native-transfer" | "erc7730" | "blind";
  display?: DisplayModel;
  chainId: number;
};

let cachedIndex: RegistryIndex | null = null;

export async function loadRegistryIndex(): Promise<RegistryIndex> {
  if (!cachedIndex) {
    cachedIndex = await fetchPrebuiltRegistryIndex();
  }
  return cachedIndex;
}

export function createFormatOptions(index: RegistryIndex): FormatOptions {
  return {
    descriptorResolverOptions: { type: "github", index },
  };
}

function isEmptyCalldata(data?: string): boolean {
  return !data || data === "0x" || data.length <= 2;
}

function isNativeTransfer(tx: EvmTransaction): boolean {
  return isEmptyCalldata(tx.data) && Boolean(tx.to);
}

function hasReadableIntent(display: DisplayModel): boolean {
  if (display.rawCalldataFallback) {
    return false;
  }

  const hasIntent =
    typeof display.intent === "string"
      ? display.intent.trim().length > 0
      : display.intent !== undefined &&
        Object.keys(display.intent).length > 0;

  const hasFields = (display.fields?.length ?? 0) > 0;
  const hasInterpolated = Boolean(display.interpolatedIntent?.trim());

  return hasIntent || hasFields || hasInterpolated;
}

export async function evaluateClearSignGate(
  tx: EvmTransaction,
  formatOptions?: FormatOptions,
): Promise<GateVerdict> {
  const chainId = tx.chainId;

  if (isNativeTransfer(tx)) {
    return {
      decision: "proceed",
      reason: "Native transfer — recipient and amount are in the transaction envelope",
      mode: "native-transfer",
      display: {
        intent: `Send ${tx.value?.toString() ?? "0"} wei to ${tx.to ?? "unknown"}`,
      },
      chainId,
    };
  }

  if (!tx.to) {
    return {
      decision: "refuse",
      reason: "Contract creation without a clear-sign descriptor",
      mode: "blind",
      chainId,
    };
  }

  const opts =
    formatOptions ??
    createFormatOptions(await loadRegistryIndex());

  const display = await format(
    {
      chainId,
      to: tx.to,
      data: tx.data ?? "0x",
      value: tx.value,
      from: tx.from,
    },
    opts,
  );

  if (display.rawCalldataFallback) {
    return {
      decision: "refuse",
      reason:
        "No ERC-7730 descriptor — device would fall back to blind signing (hashes / hex)",
      mode: "blind",
      display,
      chainId,
    };
  }

  if (!hasReadableIntent(display)) {
    return {
      decision: "refuse",
      reason: "Descriptor resolved but produced no human-readable intent or fields",
      mode: "blind",
      display,
      chainId,
    };
  }

  return {
    decision: "proceed",
    reason: "ERC-7730 descriptor resolved to human-readable fields",
    mode: "erc7730",
    display,
    chainId,
  };
}

export function formatVerdictForConsole(verdict: GateVerdict): string {
  const header =
    verdict.decision === "proceed"
      ? "✓ GATE: PROCEED"
      : "✗ GATE: REFUSED";

  const lines = [
    header,
    `  Chain: ${verdict.chainId}`,
    `  Mode:  ${verdict.mode}`,
    `  Why:   ${verdict.reason}`,
  ];

  if (verdict.display?.interpolatedIntent) {
    lines.push(`  Intent: ${verdict.display.interpolatedIntent}`);
  } else if (typeof verdict.display?.intent === "string") {
    lines.push(`  Intent: ${verdict.display.intent}`);
  }

  if (verdict.display?.fields?.length) {
    lines.push("  Fields:");
    for (const field of verdict.display.fields) {
      if ("label" in field && "value" in field) {
        lines.push(`    • ${field.label}: ${field.value}`);
      }
    }
  }

  if (verdict.display?.rawCalldataFallback) {
    lines.push("  ⚠ rawCalldataFallback — would blind-sign on device");
  }

  return lines.join("\n");
}
