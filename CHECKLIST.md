# ClearGate — Build Checklist

Target submit: **June 12**. Video-first deliverable.

Legend: `[x]` done · `[ ]` not started · **you** = needs you (hardware / publish)

---

## Code & demos — built

- [x] Repo scaffold (TypeScript, viem, DMK, ERC-7730 SDK)
- [x] Multi-chain config (`CHAIN_ID` + built-in profiles)
- [x] `clearSignGate` — refuse on `rawCalldataFallback`, proceed on readable intent
- [x] Tx builders — clear ERC-20/native transfer + blind opaque call
- [x] Agent loop + gate before DMK (lazy-load Ledger)
- [x] Transport middleware attack (`blind-rewrite`, `recipient-swap`)
- [x] Demo CLIs — gate, clear-sign, attack-naive, attack-gated, demo:all
- [x] Dry-run mode (no device) + record-ready banners
- [x] Architecture diagram (`docs/architecture.png`)
- [x] README, post draft (`docs/POST.md`), shot list (`docs/VIDEO.md`)
- [x] Nano HID path documented (`docs/DEVICE.md`) — **no Docker required**
- [x] Gate tests (`npm test`)

---

## Still needs a device (Nano or Speculos)

- [ ] **Beat 1:** clear-signable transfer signs on device (`npm run demo:clear-sign`)
- [ ] **Beat 2:** blind-sign path visible on device (`npm run demo:attack-naive`)
- [ ] **Beat 3:** gated refuse confirmed on device run (`npm run demo:attack-gated`)
- [ ] Proof-of-use capture (screenshot / demo log with device)

Use **Speculos** (no Nano) — see [docs/SPECULOS.md](docs/SPECULOS.md), or **TRANSPORT=hid** + Nano — [docs/DEVICE.md](docs/DEVICE.md).

Optional: `LEDGER_ORIGIN_TOKEN` (enhances DMK metadata; gate works without it)

---

## Submission — not started (you)

- [ ] **~90s video** recorded (beats 2 & 3 side by side; Nano screen visible)
- [ ] Repo pushed to GitHub (public)
- [ ] Thread/post published from `docs/POST.md`
- [ ] @Ledger tag + `#Sponsored` / `#LedgerSponsor`
- [ ] Google Form submitted
- [ ] Hook tested cold: first 5 seconds
- [ ] Caption on video: *"The hardware worked. The runtime lied."*

---

## Bounty qualifiers

| Requirement | Status |
|-------------|--------|
| Uses Ledger DMK | [x] code |
| EVM + ERC-7730 clear signing | [x] code |
| Demonstrates blind-sign gap | [x] dry run · [ ] on device |
| Refuse-if-blind gate | [x] code |
| Speculos or real device | [ ] **needs Nano run** |
| Video ~90s | [ ] |
| @Ledger + sponsor tags | [ ] |
| Public repo | [ ] |

---

## Commands

```bash
npm test                       # gate unit tests
npm run demo:gate              # no device
npm run demo:all               # dry run all beats

# Speculos (see docs/SPECULOS.md)
npm run speculos:fetch-elf
npm run speculos:up
npm run demo:all -- --device
```

Recording chain: **`CHAIN_ID=1`** (mainnet USDT = full ERC-7730 descriptor).
