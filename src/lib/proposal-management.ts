import { daysToDecision } from "./analytics";
import type { AppUser, Proposal } from "./types";

export const SUPERVISOR_OPTIONS = [
  "Katrin Marie Nebrada",
  "Ewaldo Castor Jr. Rosal",
  "Jessie Ocampo",
] as const;
export const PROPOSAL_PAGE_SIZE = 20;

export type ProposalSortKey = "id" | "proposal" | "owner" | "accountableLeader" | "status" | "submittedBy" | "dateSubmitted" | "decisionDate" | "days";
export type DashboardTab = "proposals" | "analytics" | "users";

export function getDashboardTabs(role: AppUser["role"] | null | undefined): DashboardTab[] {
  return role === "Admin" ? ["proposals", "analytics", "users"] : ["proposals"];
}

export function resolveProposalOwner(selectedSupervisor: string): string {
  return SUPERVISOR_OPTIONS.find((supervisor) => supervisor === selectedSupervisor) ?? "";
}

export function preserveAccountableLeader(
  original: Proposal,
  edited: Proposal,
  role: AppUser["role"] | null | undefined,
): Proposal {
  if (role === "Admin") return edited;
  const { accountableLeader: _editedAccountableLeader, ...editedFields } = edited;
  return original.accountableLeader === undefined
    ? editedFields
    : { ...editedFields, accountableLeader: original.accountableLeader };
}

export function hasProposalPagination(itemCount: number): boolean {
  return itemCount > PROPOSAL_PAGE_SIZE;
}

export function paginateItems<T>(items: T[], page: number, pageSize = PROPOSAL_PAGE_SIZE): T[] {
  const safePage = Math.max(1, Math.floor(page));
  return items.slice((safePage - 1) * pageSize, safePage * pageSize);
}

export function sortProposalRows(
  proposals: Proposal[],
  sort: { key: ProposalSortKey; dir: 1 | -1 },
): Proposal[] {
  return [...proposals].sort((a, b) => {
    const left = sort.key === "days" ? daysToDecision(a) ?? -1 : a[sort.key] ?? "";
    const right = sort.key === "days" ? daysToDecision(b) ?? -1 : b[sort.key] ?? "";
    return (left < right ? -1 : left > right ? 1 : 0) * sort.dir;
  });
}