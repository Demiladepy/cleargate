export type Beat = 1 | 2 | 3 | "gate";

const WIDTH = 62;

export function banner(title: string, beat?: Beat): string {
  const label = beat !== undefined ? `BEAT ${beat}` : "CLEARGATE";
  const line = "═".repeat(WIDTH);
  return [
    "",
    line,
    `  ${label} — ${title}`,
    line,
  ].join("\n");
}

export function beatCaption(beat: Beat): string {
  switch (beat) {
    case 1:
      return "It works — clear-signable transfer, device shows recipient + amount.";
    case 2:
      return "Having a Ledger didn't save me — middleware rewrote the tx to blind data.";
    case 3:
      return "The gate fixes it — same attack, refused before the device prompt.";
    case "gate":
      return "ERC-7730 contrast — readable intent proceeds, blind data refused.";
  }
}

export function splitLabel(side: "naive" | "gated"): string {
  return side === "naive"
    ? "NAIVE AGENT + LEDGER"
    : "GATED AGENT + LEDGER";
}

export function outcomeLine(
  signed: boolean,
  blind?: boolean,
  refused?: boolean,
): string {
  if (refused) {
    return "OUTCOME: REFUSED — malicious tx never reached device";
  }
  if (signed && blind) {
    return "OUTCOME: SIGNED BLIND — user approved a blank check on hardware";
  }
  if (signed) {
    return "OUTCOME: SIGNED CLEAR — recipient and amount were readable";
  }
  return "OUTCOME: NOT SIGNED";
}

export function recordingHint(): string {
  return [
    "",
    "Recording tip: use CHAIN_ID=1 for USDT clear-sign on device.",
    "VNC: http://127.0.0.1:41000 (when Speculos is running with compose).",
    "",
  ].join("\n");
}
