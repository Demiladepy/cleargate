export type EvmTransaction = {
  chainId: number;
  to?: `0x${string}`;
  data?: `0x${string}`;
  value?: bigint;
  from?: `0x${string}`;
};

export type UnsignedEvmTransaction = EvmTransaction & {
  nonce: number;
  gas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  type: "eip1559";
};
