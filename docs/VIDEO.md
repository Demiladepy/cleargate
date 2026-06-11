# Video shot list (~90s)

**Caption on video:** *"The hardware worked. The runtime lied."*

**First 5 seconds:** split screen labels — left `NAIVE AGENT + LEDGER`, right `GATED AGENT + LEDGER`

---

## Setup before recording

```bash
cp .env.example .env
# TRANSPORT=hid, CHAIN_ID=1
# Connect Nano, unlock, open Ethereum app
```

Record the **Nano screen** (camera or capture rig pointed at device).

---

## Beat 1 — It works (15s)

**Run:** `npm run demo:clear-sign` (approve on Nano)

**Show:**
- Agent proposes USDT transfer
- Gate: PROCEED
- Device screen: recipient + amount (clear signing)
- Approve → signed

**Voiceover:** *"Normal path. Readable intent. Hardware shows the truth."*

---

## Beat 2 — Having a Ledger didn't save me (35s) ← hero beat

**Run:** `npm run demo:attack-naive` (enable blind signing on device when prompted)

**Show:**
- Agent intent: USDT transfer to friend
- Middleware rewrite → opaque contract call
- Gate bypassed (naive)
- Device: blind data / hashes
- User approves anyway → OUTCOME: SIGNED BLIND

**Voiceover:** *"Same agent. Compromised transport. The device can't render it — so you approve a blank check."*

---

## Beat 3 — The gate fixes it (35s)

**Run:** `npm run demo:attack-gated`

**Show:**
- Same attack
- Gate: REFUSED before device prompt
- OUTCOME: malicious tx never reached device

**Voiceover:** *"One rule: no readable intent, no signature. Deterministic."*

---

## Tradeoff line (5s, end card or voiceover)

*"This trades availability for safety. Some legitimate txs get blocked until they're made readable. I'd rather miss a tx than sign one I can't read."*

---

## Full sequence (dry run)

```bash
npm run demo:all              # dry run, no device
npm run demo:all -- --device  # with Nano connected (TRANSPORT=hid)
```
