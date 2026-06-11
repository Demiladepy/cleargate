import {
  arbitrum,
  base,
  holesky,
  mainnet,
  optimism,
  polygon,
  sepolia,
  type Chain,
} from "viem/chains";

export type ChainProfile = {
  id: number;
  name: string;
  viemChain: Chain;
  /** Known ERC-20 with ERC-7730 registry coverage for clear-sign demos */
  demoToken?: {
    address: `0x${string}`;
    symbol: string;
    decimals: number;
  };
  defaultRpc?: string;
};

const PROFILES: Record<number, ChainProfile> = {
  [mainnet.id]: {
    id: mainnet.id,
    name: "Ethereum",
    viemChain: mainnet,
    demoToken: {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      symbol: "USDT",
      decimals: 6,
    },
    defaultRpc: "https://ethereum.publicnode.com",
  },
  [sepolia.id]: {
    id: sepolia.id,
    name: "Sepolia",
    viemChain: sepolia,
    defaultRpc: "https://ethereum-sepolia.publicnode.com",
  },
  [holesky.id]: {
    id: holesky.id,
    name: "Holesky",
    viemChain: holesky,
    defaultRpc: "https://ethereum-holesky.publicnode.com",
  },
  [polygon.id]: {
    id: polygon.id,
    name: "Polygon",
    viemChain: polygon,
    demoToken: {
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      symbol: "USDT",
      decimals: 6,
    },
    defaultRpc: "https://polygon-bor.publicnode.com",
  },
  [base.id]: {
    id: base.id,
    name: "Base",
    viemChain: base,
    demoToken: {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      symbol: "USDC",
      decimals: 6,
    },
    defaultRpc: "https://base.publicnode.com",
  },
  [arbitrum.id]: {
    id: arbitrum.id,
    name: "Arbitrum One",
    viemChain: arbitrum,
    demoToken: {
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      symbol: "USDT",
      decimals: 6,
    },
    defaultRpc: "https://arbitrum-one.publicnode.com",
  },
  [optimism.id]: {
    id: optimism.id,
    name: "Optimism",
    viemChain: optimism,
    demoToken: {
      address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      symbol: "USDT",
      decimals: 6,
    },
    defaultRpc: "https://optimism.publicnode.com",
  },
};

export function resolveChain(chainId: number): ChainProfile {
  const known = PROFILES[chainId];
  if (known) {
    return known;
  }

  return {
    id: chainId,
    name: `EVM ${chainId}`,
    viemChain: {
      id: chainId,
      name: `Chain ${chainId}`,
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: { default: { http: [] } },
    },
  };
}

export function listSupportedChains(): ChainProfile[] {
  return Object.values(PROFILES);
}

export function getRpcUrl(chainId: number, override?: string): string {
  if (override) {
    return override;
  }

  const profile = resolveChain(chainId);
  if (profile.defaultRpc) {
    return profile.defaultRpc;
  }

  throw new Error(
    `No default RPC for chain ${chainId}. Set RPC_URL in .env or use a built-in chain: ${listSupportedChains()
      .map((c) => c.id)
      .join(", ")}`,
  );
}
