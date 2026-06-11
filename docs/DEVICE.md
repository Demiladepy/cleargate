# Device setup (no Docker)

ClearGate supports two device paths. **Use a real Nano via USB** if you are not running Speculos.

---

## Option A — Ledger Nano (recommended for you)

1. Connect Nano via USB
2. Unlock device, open **Ethereum** app
3. Configure `.env`:

```env
TRANSPORT=hid
CHAIN_ID=1
AUTO_APPROVE=0
```

4. Run demos — **you approve manually on the device**:

```bash
npm run demo:clear-sign
npm run demo:attack-naive    # enable blind signing in device settings when prompted
npm run demo:attack-gated
```

**Recording:** point a camera or screen capture at the Nano screen. No emulator needed.

### Windows notes

- Node HID transport requires the device drivers Ledger normally uses
- Close Ledger Live while running demos (it can lock the device)

---

## Option B — Speculos (native install, optional)

If you prefer an emulator without Docker:

```bash
pip install speculos
# Run with Ethereum app ELF — see https://speculos.ledger.com
speculos --model nanosp --api-port 5000 ./path/to/eth.elf
```

```env
TRANSPORT=speculos
SPECULOS_URL=http://127.0.0.1:5000
SPECULOS_CONTROLLER_URL=http://127.0.0.1:5000
AUTO_APPROVE=1
```

Then `npm run speculos:wait` and run device demos.

---

## Dry run (no device at all)

All gate logic works without hardware:

```bash
npm run demo:gate
npm run demo:all
npm test
```

Beat 2 simulates blind-sign outcome; beat 3 refuses at the gate. For the bounty video you still need **device footage** (Nano or Speculos) for beats 1–2.
