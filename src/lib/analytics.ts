import { OPEN_STATUSES, type Proposal } from "./types";

export function daysToDecision(p: Pick<Proposal, "dateSubmitted" | "decisionDate">): number | null {
  if (!p.decisionDate || !p.dateSubmitted) return null;
  const ms = new Date(p.decisionDate).getTime() - new Date(p.dateSubmitted).getTime();
  return Math.round(ms / 86400000);
}

export const isOpen = (p: Proposal) => OPEN_STATUSES.includes(p.status);

function avg(nums: number[]): number | null {
  return nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : null;
}

export function summarize(list: Proposal[]) {
  const open = list.filter(isOpen).length;
  const days = list.map(daysToDecision).filter((d): d is number => d !== null);
  return { open, closed: list.length - open, total: list.length, avgDays: avg(days) };
}

export function byOwner(list: Proposal[]) {
  const map = new Map<string, Proposal[]>();
  for (const p of list) map.set(p.owner, [...(map.get(p.owner) ?? []), p]);
  return [...map.entries()].map(([owner, ps]) => ({ owner, ...summarize(ps) }));
}
