import { describe, expect, it } from "vitest";
import { getDashboardTabs, hasProposalPagination, paginateItems, preserveAccountableLeader, PROPOSAL_PAGE_SIZE, resolveProposalOwner, sortProposalRows, SUPERVISOR_OPTIONS } from "./proposal-management";
import type { Proposal } from "./types";

const proposal = (id: number, dateSubmitted: string): Proposal => ({
  id,
  proposal: `Proposal ${id}`,
  owner: "Jane",
  accountableLeader: "",
  status: "Submitted",
  decisionDate: null,
  submittedBy: "Demo User",
  dateSubmitted,
  rationale: "",
});

describe("proposal management helpers", () => {
  it("shows all dashboard tabs to Admin and only Proposals to Member", () => {
    expect(getDashboardTabs("Admin")).toEqual(["proposals", "analytics", "users"]);
    expect(getDashboardTabs("Member")).toEqual(["proposals"]);
  });

  it("offers exactly the three supervisors and sends the selected name as owner", () => {
    expect(SUPERVISOR_OPTIONS).toEqual([
      "Katrin Marie Nebrada",
      "Ewaldo Castor Jr. Rosal",
      "Jessie Ocampo",
    ]);
    expect(SUPERVISOR_OPTIONS.map(resolveProposalOwner)).toEqual([
      "Katrin Marie Nebrada",
      "Ewaldo Castor Jr. Rosal",
      "Jessie Ocampo",
    ]);
  });

  it("allows an empty owner and rejects values outside the supervisor list", () => {
    expect(resolveProposalOwner("")).toBe("");
    expect(resolveProposalOwner("Other")).toBe("");
  });

  it("allows only Admins to change Accountable Leader while editing", () => {
    const original = { ...proposal(1, "2026-11-01"), accountableLeader: "Original leader" };
    const edited = { ...original, accountableLeader: "Changed leader", proposal: "Updated proposal" };

    expect(preserveAccountableLeader(original, edited, "Admin").accountableLeader).toBe("Changed leader");
    expect(preserveAccountableLeader(original, edited, "Member")).toMatchObject({
      accountableLeader: "Original leader",
      proposal: "Updated proposal",
    });
  });

  it("starts pagination only above 20 proposals", () => {
    expect(hasProposalPagination(20)).toBe(false);
    expect(hasProposalPagination(21)).toBe(true);
  });

  it("keeps each proposal page to 20 rows", () => {
    const rows = Array.from({ length: 21 }, (_, index) => proposal(index + 1, "2026-11-01"));
    expect(paginateItems(rows, 1)).toHaveLength(PROPOSAL_PAGE_SIZE);
    expect(paginateItems(rows, 2)).toHaveLength(1);
  });

  it("sorts proposal rows by selected table field and direction", () => {
    const rows = [proposal(1, "2026-11-02"), proposal(2, "2026-11-01")];
    expect(sortProposalRows(rows, { key: "dateSubmitted", dir: 1 }).map((row) => row.id)).toEqual([2, 1]);
  });

  it("sorts proposals by Accountable Leader", () => {
    const rows = [
      { ...proposal(1, "2026-11-01"), accountableLeader: "Zoe" },
      { ...proposal(2, "2026-11-01"), accountableLeader: "Alex" },
    ];
    expect(sortProposalRows(rows, { key: "accountableLeader", dir: 1 }).map((row) => row.id)).toEqual([2, 1]);
  });
});