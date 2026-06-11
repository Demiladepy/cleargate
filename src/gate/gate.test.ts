import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluateClearSignGate,
  createFormatOptions,
  loadRegistryIndex,
} from "./clearSignGate";
import {
  buildBlindSignTransaction,
  buildClearSignableTransfer,
  buildNativeTransfer,
} from "../tx/builders";

describe("clearSignGate", () => {
  it("proceeds on native ETH transfer (readable envelope)", async () => {
    const tx = buildNativeTransfer("0x000000000000000000000000000000000000dEaD", 1n, 1);
    const verdict = await evaluateClearSignGate(tx);
    assert.equal(verdict.decision, "proceed");
    assert.equal(verdict.mode, "native-transfer");
  });

  it("proceeds on mainnet USDT transfer (ERC-7730)", async () => {
    const index = await loadRegistryIndex();
    const opts = createFormatOptions(index);
    const tx = buildClearSignableTransfer(
      "0x000000000000000000000000000000000000dEaD",
      1,
    );
    const verdict = await evaluateClearSignGate(tx, opts);
    assert.equal(verdict.decision, "proceed");
    assert.equal(verdict.mode, "erc7730");
    assert.equal(verdict.display?.rawCalldataFallback, undefined);
  });

  it("refuses opaque contract call (blind fallback)", async () => {
    const index = await loadRegistryIndex();
    const opts = createFormatOptions(index);
    const tx = buildBlindSignTransaction(1);
    const verdict = await evaluateClearSignGate(tx, opts);
    assert.equal(verdict.decision, "refuse");
    assert.equal(verdict.mode, "blind");
    assert.ok(verdict.display?.rawCalldataFallback);
  });
});
