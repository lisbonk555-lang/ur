export const FEE_WALLET = "0xB4FB11FB0c3BE6a1760a0e2ffbe4726255F0990D";

export function getFeeBps(amount: number, isBotToBot: boolean): number {
  if (isBotToBot) return 200; // 2.0%
  if (amount < 1_000_000) return 10; // 0.1%
  if (amount < 10_000_000) return 50; // 0.5%
  return 100; // 1.0%
}
