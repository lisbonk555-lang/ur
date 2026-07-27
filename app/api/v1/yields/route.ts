import { handleYields } from '../../../../lib/apiHandlers.js';

const HARDCODED = [
  { protocol: "UpFrica Treasury Vault", apy: 8.0, category: "RWA", tvl_usd: 50000000 },
  { protocol: "US Treasury Bills", apy: 4.8, category: "RWA", tvl_usd: 200000 },
  { protocol: "Private Credit", apy: 9.2, category: "RWA", tvl_usd: 75000000 },
  { protocol: "Real Estate", apy: 7.1, category: "RWA", tvl_usd: 120000 },
  { protocol: "ETH Liquid Staking", apy: 3.4, category: "DeFi", tvl_usd: 3000000000 },
  { protocol: "USDC Lending Aave", apy: 5.1, category: "DeFi", tvl_usd: 1500000 },
  { protocol: "BTC Yield Solv", apy: 2.8, category: "DeFi", tvl_usd: 800000 },
  { protocol: "Money Market Fund", apy: 5.0, category: "RWA", tvl_usd: 400000 },
];

export async function GET() {
  const data = await handleYields();
  return Response.json(data);
}
