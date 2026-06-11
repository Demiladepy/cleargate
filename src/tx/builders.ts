import {
  encodeFunctionData,
  erc20Abi,
  parseGwei,
  serializeTransaction,
} from "viem";
import { config } from "../config";
import { resolveChain } from "../chains/index";
import type { EvmTransaction, UnsignedEvmTransaction } from "../types/transaction";

const DEFAULT_GAS = 120_000n;
const DEFAULT_VALUE = 1_000_000n; // 1 USDC/USDT unit at 6 decimals

export function buildNativeTransfer(
  recipient: `0x${string}`,
  valueWei = 1_000_000_000_000_000n,
  chainId = config.chainId,
): EvmTransaction {
  return {
    chainId,
    to: recipient,
    value: valueWei,
    data: "0x",
  };
}

export function buildErc20Transfer(
  token: `0x${string}`,
  recipient: `0x${string}`,
  amount = DEFAULT_VALUE,
  chainId = config.chainId,
): EvmTransaction {
  return {
    chainId,
    to: token,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [recipient, amount],
    }),
    value: 0n,
  };
}

export function buildClearSignableTransfer(
  recipient: `0x${string}`,
  chainId = config.chainId,
): EvmTransaction {
  const profile = resolveChain(chainId);

  if (profile.demoToken) {
    return buildErc20Transfer(
      profile.demoToken.address,
      recipient,
      DEFAULT_VALUE,
      chainId,
    );
  }

  return buildNativeTransfer(recipient, 1_000_000_000_000_000n, chainId);
}

/** Opaque contract call — no ERC-7730 descriptor → blind signing on device */
export function buildBlindSignTransaction(
  chainId = config.chainId,
): EvmTransaction {
  return {
    chainId,
    to: config.blindDrainContract,
    data: ("0xdeadbeef" +
      "0000000000000000000000000000000000000000000000000000000000000001") as `0x${string}`,
    value: 0n,
  };
}

export function toUnsignedTransaction(
  tx: EvmTransaction,
  nonce = 0,
): UnsignedEvmTransaction {
  return {
    ...tx,
    nonce,
    gas: tx.data && tx.data !== "0x" ? DEFAULT_GAS : 21_000n,
    maxFeePerGas: parseGwei("30"),
    maxPriorityFeePerGas: parseGwei("2"),
    type: "eip1559",
  };
}

export function serializeForLedger(tx: UnsignedEvmTransaction): Uint8Array {
  const hex = serializeTransaction({
    chainId: tx.chainId,
    to: tx.to,
    data: tx.data,
    value: tx.value ?? 0n,
    nonce: tx.nonce,
    gas: tx.gas,
    maxFeePerGas: tx.maxFeePerGas,
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
    type: "eip1559",
  });

  return hexToBytes(hex);
}

function hexToBytes(hex: string): Uint8Array {
  const normalized = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function describeTransaction(tx: EvmTransaction): string {
  const value = tx.value?.toString() ?? "0";
  const dataPreview =
    !tx.data || tx.data === "0x"
      ? "(none — native transfer)"
      : `${tx.data.slice(0, 18)}… (${tx.data.length / 2 - 1} bytes)`;

  return [
    `chainId: ${tx.chainId}`,
    `to:      ${tx.to ?? "(contract creation)"}`,
    `value:   ${value} wei`,
    `data:    ${dataPreview}`,
  ].join("\n");
}
