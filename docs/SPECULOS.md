# Speculos setup (no physical Nano)

Docker Desktop + Speculos = valid bounty proof-of-use. The emulated device screen is at **http://localhost:5000**.

> **You do NOT need [wallet-cli](https://github.com/LedgerHQ/ledger-live/tree/develop/apps/wallet-cli)** — that's for physical USB devices only. ClearGate + Speculos is the path without a Nano.

---

## 1. Prerequisites

- Docker Desktop running (Engine: running)
- Node.js ≥ 22
- `npm install` in this repo

---

## 2. Get the Ethereum app binary

```powershell
npm run speculos:fetch-elf
```

This downloads `app-1.22.1-nanox.elf` → `apps/ethereum.elf` from [LedgerHQ/app-ethereum releases](https://github.com/LedgerHQ/app-ethereum/releases).

---

## 3. Start Speculos

**Terminal 1:**

```powershell
npm run speculos:up
```

Wait until the container is running, then open **http://localhost:5000** — you'll see the emulated Nano X screen (clickable buttons).

---

## 4. Configure ClearGate

```powershell
copy .env.example .env
```

In `.env`:

```env
TRANSPORT=speculos
SPECULOS_URL=http://127.0.0.1:5000
SPECULOS_CONTROLLER_URL=http://127.0.0.1:5000
SPECULOS_MODEL=nanox
CHAIN_ID=1
AUTO_APPROVE=0
```

**For recording:** use `AUTO_APPROVE=0` and click the emulated device buttons in the browser at http://localhost:5000 when prompted. This is more reliable than auto-approve on Nano X.

`AUTO_APPROVE=1` is best-effort (works better on Flex/Stax touch models).

---

## 5. Run demos

**Terminal 2:**

```powershell
npm run speculos:wait
npm run demo:clear-sign
npm run demo:attack-naive
npm run demo:attack-gated
```

Or all beats:

```powershell
npm run demo:all -- --device
```

---

## Recording (OBS)

Two panes in one scene:

| Pane | Content |
|------|---------|
| Left | Browser — http://localhost:5000 (device screen) |
| Right | PowerShell — demo output |

Show **@Ledger** and **#Sponsored** / **#LedgerSponsor** on-screen in the video (bounty qualifier).

---

## Stop Speculos

```powershell
npm run speculos:down
```

---

## "Blind signing must be enabled in settings"

This screen means the Ethereum app is on the **blind-signing path** and the setting is **off**.

### Beat 1 (`demo:clear-sign`) — should NOT need blind signing

Uses a **native ETH transfer** on Speculos. If you still see this screen:

1. Confirm `.env` exists: `copy .env.example .env`
2. Re-run: `npm run demo:clear-sign`
3. Terminal should show `data: (none — native transfer)` not USDT contract address

### Beat 2 (`demo:attack-naive`) — MUST enable blind signing first

**Manual (recommended for recording):**

1. Open http://localhost:5000
2. On Ethereum app home: press **`right`** until **Settings** is highlighted
3. Press **`both`** to open Settings
4. Navigate to **Blind signing** → **`both`** to enable
5. Confirm the warning with **`both`**
6. Then run: `npm run demo:attack-naive`

**Automated (best-effort):** `npm run speculos:enable-blind-signing`  
If the menu doesn't match, use manual steps above.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `apps/ethereum.elf` missing | `npm run speculos:fetch-elf` |
| Port 5000 in use | Stop other services or change ports in `docker-compose.yml` |
| Device not found | `npm run speculos:wait` — ensure container is up |
| Beat 1 asks for blind signing | Re-run after `copy .env.example .env` — should be native ETH |
| Beat 2 asks for blind signing | Enable in Settings first (see above) |
