import { listSupportedChains } from "../chains/index";

console.log("ClearGate — supported EVM chains\n");
for (const chain of listSupportedChains()) {
  const token = chain.demoToken
    ? `${chain.demoToken.symbol} @ ${chain.demoToken.address}`
    : "native ETH demo";
  console.log(`  ${chain.id.toString().padEnd(8)} ${chain.name.padEnd(16)} ${token}`);
}
console.log("\nAny EVM chain: set CHAIN_ID=<id> and RPC_URL=<url>");
