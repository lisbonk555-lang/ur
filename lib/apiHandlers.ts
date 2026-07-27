import { FEE_WALLET, getFeeBps } from './fee.js';
import { getMap, redis, setMap } from './redis.js';

export const PLATFORM_NAME = "UpFrica Bot Network";
export const DOMAIN_NAME = "UpFrica.africa";

// Hardcoded initial 8 institutional yield pools
export const HARDCODED = [
  { protocol: "UpFrica Treasury Vault", apy: 8.0, category: "RWA", tvl_usd: 50000000 },
  { protocol: "US Treasury Bills", apy: 4.8, category: "RWA", tvl_usd: 200000 },
  { protocol: "Private Credit", apy: 9.2, category: "RWA", tvl_usd: 75000000 },
  { protocol: "Real Estate", apy: 7.1, category: "RWA", tvl_usd: 120000 },
  { protocol: "ETH Liquid Staking", apy: 3.4, category: "DeFi", tvl_usd: 3000000000 },
  { protocol: "USDC Lending Aave", apy: 5.1, category: "DeFi", tvl_usd: 1500000 },
  { protocol: "BTC Yield Solv", apy: 2.8, category: "DeFi", tvl_usd: 800000 },
  { protocol: "Money Market Fund", apy: 5.0, category: "RWA", tvl_usd: 400000 },
];
export const HARDCODED_YIELDS = HARDCODED;

export async function handleWellKnown() {
  return {
    name: PLATFORM_NAME,
    domain: DOMAIN_NAME,
    version: "9.5.1",
    fee_wallet: FEE_WALLET,
    bot_to_bot_fee_bps: 200,
    min_deposit_usd: 100,
    api_base: `https://${DOMAIN_NAME}/api/v1`,
    docs: `https://${DOMAIN_NAME}/api/v1/docs`
  };
}

export async function handleHealth() {
  return {
    status: "ok",
    version: "9.5.1",
    storage: "upstash-redis",
    rate_limit: "none",
    domain: DOMAIN_NAME,
    fee_wallet: FEE_WALLET,
    platform: PLATFORM_NAME
  };
}

export async function handleYields() {
  const cached = await redis.get("cache:yields");
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  let llama_data: any[] = [];
  try {
    const res = await fetch("https://yields.llama.fi/pools", {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        llama_data = data.data.slice(0, 25).map((p: any) => ({
          protocol: p.project ? `${p.project} (${p.symbol})` : (p.chain + "-" + p.symbol),
          apy: Number((p.apy || 0).toFixed(2)),
          category: "DeFi",
          tvl_usd: p.tvlUsd || 0,
          pool: p.pool || p.chain + "-" + p.symbol,
          chain: p.chain || "Multi",
          project: p.project || "DeFi",
          symbol: p.symbol || "USD",
          tvlUsd: p.tvlUsd || 0
        }));
      }
    }
  } catch (err) {
    console.warn("[Yields] Llama API request failed, serving verified hardcoded pools:", err);
  }

  const result = [...HARDCODED, ...llama_data];
  await redis.set("cache:yields", result, { ex: 60 });
  return result;
}

export async function handleRegisterBot(body: { bot_id?: string; name?: string; referrer_bot_id?: string }) {
  const bot_id = (body.bot_id || "").trim();
  const name = (body.name || bot_id).trim();
  const referrer = (body.referrer_bot_id || "").trim() || null;

  if (!bot_id || bot_id.length < 3 || bot_id.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(bot_id)) {
    return { status: 400, error: "Invalid bot_id. Must be 3-50 alphanumeric characters or underscores/dashes." };
  }

  const botsMap = await getMap('bots');
  if (botsMap.has(bot_id)) {
    return { status: 409, error: "Bot ID already exists", bot_id };
  }

  const api_key = "sk_" + crypto.randomUUID().replace(/-/g, "");
  const newBot = {
    bot_id,
    name: name || bot_id,
    api_key,
    created_at: new Date().toISOString(),
    volume_30d: 0,
    referrer: referrer,
    rank: 1
  };

  botsMap.set(bot_id, newBot);

  // Recalculate ranks
  const sorted = Array.from(botsMap.values()).sort((a, b) => b.volume_30d - a.volume_30d);
  sorted.forEach((b, idx) => {
    b.rank = idx + 1;
    botsMap.set(b.bot_id, b);
  });

  await setMap('bots', botsMap);
  await redis.incrby('stats:total_bots', 1);

  return {
    status: 201,
    data: {
      status: "active",
      bot_id,
      api_key,
      dashboard: `https://${DOMAIN_NAME}/bot/${bot_id}`
    }
  };
}

export async function handleGetBots() {
  const botsMap = await getMap('bots');
  const list = Array.from(botsMap.values()).sort((a, b) => b.volume_30d - a.volume_30d);
  list.forEach((b, idx) => {
    b.rank = idx + 1;
  });
  return list.slice(0, 100);
}

export async function handleQuote(body: any) {
  const amount_usd = Number(body.amount_usd);
  if (isNaN(amount_usd) || amount_usd < 100) {
    return { status: 400, error: "Minimum deposit / routing amount is $100 USD" };
  }

  const isBotToBot = Array.isArray(body.route_to_bots) && body.route_to_bots.length > 0;
  const fee_bps = getFeeBps(amount_usd, isBotToBot);
  const fee_usd = Number((amount_usd * fee_bps / 10000).toFixed(2));
  const net_amount_usd = Number((amount_usd - fee_usd).toFixed(2));

  const quote_id = "quote_" + crypto.randomUUID().slice(0, 12);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 600000);

  const allocation = isBotToBot
    ? { bot_network: "50%", liquidity_markets: "50%" }
    : { rwa_vaults: "40%", defi_pools: "60%" };

  const quoteObj = {
    quote_id,
    amount_usd,
    is_bot_to_bot: isBotToBot,
    route_to_bots: isBotToBot ? body.route_to_bots : [],
    fee_bps,
    fee_usd,
    net_amount_usd,
    fee_wallet: FEE_WALLET,
    allocation,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString()
  };

  await redis.set(`quote:${quote_id}`, quoteObj, { ex: 600 });

  return { status: 200, data: quoteObj };
}

export async function handleExecute(body: any) {
  const quote_id = (body.quote_id || "").trim();
  const tx_hash = (body.tx_hash || "").trim();

  if (!quote_id || !tx_hash) {
    return { status: 400, error: "Both quote_id and tx_hash are required" };
  }

  const quote = await redis.get(`quote:${quote_id}`);
  if (!quote) {
    return { status: 404, error: "Quote not found or expired" };
  }

  const isUsed = await redis.sismember('used_tx', tx_hash);
  if (isUsed === 1) {
    return { status: 409, error: "Transaction hash has already been executed" };
  }

  await redis.sadd('used_tx', tx_hash);

  const botsMap = await getMap('bots');
  if (quote.is_bot_to_bot && Array.isArray(quote.route_to_bots) && quote.route_to_bots.length > 0) {
    const splitVolume = quote.amount_usd / quote.route_to_bots.length;
    for (const targetBotId of quote.route_to_bots) {
      if (botsMap.has(targetBotId)) {
        const bot = botsMap.get(targetBotId);
        bot.volume_30d = (bot.volume_30d || 0) + splitVolume;
        botsMap.set(targetBotId, bot);

        if (bot.referrer) {
          await redis.zincrby('referral_earnings', quote.fee_usd * 0.001, bot.referrer);
        }
      }
    }

    // Recalculate ranks
    const sorted = Array.from(botsMap.values()).sort((a, b) => b.volume_30d - a.volume_30d);
    sorted.forEach((b, idx) => {
      b.rank = idx + 1;
      botsMap.set(b.bot_id, b);
    });
    await setMap('bots', botsMap);
  }

  await redis.incrby('stats:volume24h', Math.round(quote.amount_usd));
  await redis.incrbyfloat('stats:fees', quote.fee_usd);

  return {
    status: 200,
    data: {
      status: "executed",
      quote_id: quote.quote_id,
      tx_hash,
      amount_usd: quote.amount_usd,
      fee_usd: quote.fee_usd,
      fee_wallet: FEE_WALLET,
      executed_at: new Date().toISOString()
    }
  };
}

export async function handleLeaderboard() {
  const botsMap = await getMap('bots');
  const sorted = Array.from(botsMap.values()).sort((a, b) => b.volume_30d - a.volume_30d);
  const formatted = sorted.slice(0, 100).map((bot, index) => ({
    ...bot,
    rank: index + 1,
    featured: index < 3
  }));
  return formatted;
}

export async function handleStats() {
  const volume_24h = (await redis.get('stats:volume24h')) || 0;
  const total_fees_usd = (await redis.get('stats:fees')) || 0;
  const botsMap = await getMap('bots');
  const total_bots = (await redis.get('stats:total_bots')) || botsMap.size || 0;

  return {
    volume_24h: Number(volume_24h),
    total_fees_usd: Number(total_fees_usd),
    total_bots: Number(total_bots)
  };
}

export async function handleReferrals(bot_id: string) {
  const earnings = (await redis.zscore('referral_earnings', bot_id)) || 0;
  return {
    bot_id,
    total_referral_earnings_usd: Number(earnings)
  };
}

export function handleDocs() {
  return {
    openapi: "3.0.3",
    info: {
      title: "UpFrica Bot Network API",
      description: "The Router to Global Capital. Unlimited API for $660T Markets. 2% Bot-to-Bot Fee.",
      version: "9.5.1",
      contact: { name: "UpFrica Infrastructure", url: `https://${DOMAIN_NAME}` }
    },
    servers: [
      { url: `https://${DOMAIN_NAME}/api/v1`, description: "Production API Server" },
      { url: "/api/v1", description: "Relative Local Endpoint" }
    ],
    paths: {
      "/.well-known/upfrica.json": {
        get: {
          summary: "Bot Network Auto-Discovery Protocol",
          responses: { "200": { description: "Network parameters & configuration" } }
        }
      },
      "/health": {
        get: {
          summary: "Network & Storage Node Health",
          responses: { "200": { description: "System operational status" } }
        }
      },
      "/yields": {
        get: {
          summary: "Real-time DeFi & RWA Yield Aggregator",
          responses: { "200": { description: "Cached or live yield pool metrics" } }
        }
      },
      "/register_bot": {
        post: {
          summary: "Register Autonomous Bot Agent",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    bot_id: { type: "string", example: "alpha_bot_01" },
                    name: { type: "string", example: "Alpha Trading Bot" },
                    referrer_bot_id: { type: "string", example: "genesis_bot" }
                  },
                  required: ["bot_id"]
                }
              }
            }
          },
          responses: { "201": { description: "Bot registered successfully with API key" }, "409": { description: "Bot ID collision" } }
        }
      },
      "/bots": {
        get: {
          summary: "List Registered Bots & Volume Ranks",
          responses: { "200": { description: "Top 100 bots ranked by 30d routing volume" } }
        }
      },
      "/quote": {
        post: {
          summary: "Calculate Route & Dynamic Network Fee Quote",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    amount_usd: { type: "number", minimum: 100, example: 5000 },
                    route_to_bots: { type: "array", items: { type: "string" }, example: ["bot_01", "bot_02"] }
                  },
                  required: ["amount_usd"]
                }
              }
            }
          },
          responses: { "200": { description: "Quote generated with fee BPS tier" } }
        }
      },
      "/execute": {
        post: {
          summary: "Settle & Finalize Capital Route",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    quote_id: { type: "string", example: "quote_a1b2c3d4e5f6" },
                    tx_hash: { type: "string", example: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b" }
                  },
                  required: ["quote_id", "tx_hash"]
                }
              }
            }
          },
          responses: { "200": { description: "Route executed and stats updated" }, "409": { description: "Replay attack detected (Tx hash reused)" } }
        }
      },
      "/leaderboard": {
        get: {
          summary: "Capital Router Leaderboard",
          responses: { "200": { description: "Ranked list of bots with featured indicators" } }
        }
      },
      "/stats": {
        get: {
          summary: "Global Network Capital & Fee Metrics",
          responses: { "200": { description: "Aggregate 24h volume, fee totals, active bot count" } }
        }
      },
      "/referrals/{bot_id}": {
        get: {
          summary: "Bot Referral Commission Metrics",
          parameters: [{ name: "bot_id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Accrued 0.1% referral rewards in USD" } }
        }
      },
      "/docs": {
        get: {
          summary: "OpenAPI 3.0 Documentation Schema",
          responses: { "200": { description: "OpenAPI 3.0 JSON specification" } }
        }
      }
    }
  };
}
