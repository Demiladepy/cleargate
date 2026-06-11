# Speculos app binaries

`ethereum.elf` is the Ledger Ethereum app binary Speculos runs.

## Get the file (pick one)

**Automatic (recommended):**

```powershell
npm run speculos:fetch-elf
```

**Manual:** download from [LedgerHQ/app-ethereum releases](https://github.com/LedgerHQ/app-ethereum/releases) (e.g. `app-1.22.1-nanox.elf`) and save as `apps/ethereum.elf`.

This file is **not committed** to git (large binary). `.gitignore` excludes `*.elf`.
