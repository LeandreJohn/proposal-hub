export const STATUSES = ["Submitted", "Under review", "Approved", "Declined", "Implemented"] as const;
export type Status = (typeof STATUSES)[number];
export const OPEN_STATUSES: Status[] = ["Submitted", "Under review"];

export interface Proposal {
  id: number;
  proposal: string;
  owner: string;
  status: Status;
  decisionDate: string | null; // YYYY-MM-DD
  submittedBy: string;
  dateSubmitted: string; // YYYY-MM-DD
  rationale: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Member";
}
