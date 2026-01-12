import { parseAbi } from "viem";

export const NFT_CONTRACT_ADDRESS =
  "0x6D1BaA7951f26f600b4ABc3a9CF8F18aBf36fac1";

export const NFT_MINTABLE_ABI_PARSED = parseAbi([
  "function mintTo(address recipient) returns (uint256)",
  "function baseURI() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
] as const);
