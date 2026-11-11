import { describe, expect, it } from "vitest";
import { byOwner, daysToDecision, summarize } from "./analytics";
import type { Proposal } from "./types";

const base: Proposal = { id: 1, proposal: "a", owner: "Jane", status: "Approved", decisionDate: "2026-11-01", submittedBy: "x", dateSubmitted: "2026-10-20", rationale: "" };
const open: Proposal = { ...base, id: 2, owner: "John", status: "Under review", decisionDate: null };

describe("analytics", () => {
  it("days to decision matches the sheet (Oct 20 -> Nov 1 = 12)", () => expect(daysToDecision(base)).toBe(12));
  it("no decision date means no days", () => expect(daysToDecision(open)).toBeNull());
  it("Submitted/Under review count as open, others closed", () =>
    expect(summarize([base, open])).toEqual({ open: 1, closed: 1, total: 2, avgDays: 12 }));
  it("Submitted status counts as open", () => expect(summarize([{ ...open, status: "Submitted" }]).open).toBe(1));
  it("per-owner summary", () => expect(byOwner([base, open]).find((o) => o.owner === "John")).toMatchObject({ open: 1, closed: 0, avgDays: null }));
});
