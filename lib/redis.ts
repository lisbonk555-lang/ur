import { Redis } from '@upstash/redis';

// Smart wrapper / fallback so the app works both with live Upstash Redis or memory store
let upstashClient: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    upstashClient = Redis.fromEnv();
  } catch (err) {
    console.warn('[Redis] Failed to initialize Upstash Redis from env:', err);
  }
}

const memStore = new Map<string, any>();
const memTTL = new Map<string, number>();
const memSets = new Map<string, Set<string>>();
const memZSets = new Map<string, Map<string, number>>();

export const redis = {
  async get<T = any>(key: string): Promise<T | null> {
    if (upstashClient) {
      try {
        const val = await upstashClient.get<T>(key);
        if (val !== null && val !== undefined) return val;
      } catch (err) {
        console.warn(`[Redis] Upstash get error for ${key}:`, err);
      }
    }
    const expiry = memTTL.get(key);
    if (expiry && Date.now() > expiry) {
      memStore.delete(key);
      memTTL.delete(key);
      return null;
    }
    return memStore.has(key) ? (memStore.get(key) as T) : null;
  },

  async set(key: string, value: any, opts?: { ex?: number; ttl?: number }): Promise<'OK' | null> {
    if (upstashClient) {
      try {
        await upstashClient.set(key, value, opts as any);
      } catch (err) {
        console.warn(`[Redis] Upstash set error for ${key}:`, err);
      }
    }
    memStore.set(key, value);
    if (opts?.ex) {
      memTTL.set(key, Date.now() + opts.ex * 1000);
    } else if (opts?.ttl) {
      memTTL.set(key, Date.now() + opts.ttl * 1000);
    }
    return 'OK';
  },

  async sismember(key: string, member: string): Promise<number> {
    if (upstashClient) {
      try {
        const res = await upstashClient.sismember(key, member);
        return typeof res === 'boolean' ? (res ? 1 : 0) : Number(res);
      } catch (err) {
        console.warn(`[Redis] Upstash sismember error for ${key}:`, err);
      }
    }
    const set = memSets.get(key);
    return set && set.has(member) ? 1 : 0;
  },

  async sadd(key: string, ...members: string[]): Promise<number> {
    if (upstashClient && members.length > 0) {
      try {
        await (upstashClient.sadd as any)(key, ...members);
      } catch (err) {
        console.warn(`[Redis] Upstash sadd error for ${key}:`, err);
      }
    }
    if (!memSets.has(key)) memSets.set(key, new Set());
    const set = memSets.get(key)!;
    let added = 0;
    for (const m of members) {
      if (!set.has(m)) {
        set.add(m);
        added++;
      }
    }
    return added;
  },

  async zincrby(key: string, increment: number, member: string): Promise<number> {
    if (upstashClient) {
      try {
        const res = await upstashClient.zincrby(key, increment, member);
        return typeof res === 'number' ? res : parseFloat(res as any);
      } catch (err) {
        console.warn(`[Redis] Upstash zincrby error for ${key}:`, err);
      }
    }
    if (!memZSets.has(key)) memZSets.set(key, new Map());
    const zset = memZSets.get(key)!;
    const current = zset.get(member) || 0;
    const next = current + increment;
    zset.set(member, next);
    return next;
  },

  async zscore(key: string, member: string): Promise<number | null> {
    if (upstashClient) {
      try {
        const res = await upstashClient.zscore(key, member);
        return res === null ? null : typeof res === 'number' ? res : parseFloat(res as any);
      } catch (err) {
        console.warn(`[Redis] Upstash zscore error for ${key}:`, err);
      }
    }
    const zset = memZSets.get(key);
    if (!zset || !zset.has(member)) return null;
    return zset.get(member)!;
  },

  async incrby(key: string, amount: number): Promise<number> {
    if (upstashClient) {
      try {
        const res = await upstashClient.incrby(key, amount);
        return typeof res === 'number' ? res : parseInt(res as any, 10);
      } catch (err) {
        console.warn(`[Redis] Upstash incrby error for ${key}:`, err);
      }
    }
    const current = (memStore.get(key) as number) || 0;
    const next = current + amount;
    memStore.set(key, next);
    return next;
  },

  async incrbyfloat(key: string, amount: number): Promise<number> {
    if (upstashClient) {
      try {
        const res = await upstashClient.incrbyfloat(key, amount);
        return typeof res === 'number' ? res : parseFloat(res as any);
      } catch (err) {
        console.warn(`[Redis] Upstash incrbyfloat error for ${key}:`, err);
      }
    }
    const current = (memStore.get(key) as number) || 0;
    const next = Number((current + amount).toFixed(4));
    memStore.set(key, next);
    return next;
  }
};

export async function getMap(key: string): Promise<Map<string, any>> {
  const data = await redis.get(key);
  if (!data) return new Map();
  if (Array.isArray(data)) return new Map(data);
  if (typeof data === 'object') return new Map(Object.entries(data));
  return new Map();
}

export async function setMap(key: string, map: Map<string, any>) {
  await redis.set(key, Array.from(map.entries()));
}
