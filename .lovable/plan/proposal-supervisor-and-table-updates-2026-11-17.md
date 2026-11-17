## Proposal supervisor and table updates
- Rename the proposal form’s “Owner” field to “Supervisor” and offer exactly these choices: Katrin Marie Nebrada, Ewaldo Castor Jr. Rosal, and Jessie Ocampo. Keep the field optional, and continue sending the selected name in the existing `owner` payload field so the FastAPI backend needs no changes.
- Remove Accountable Leader from new proposal submission. Show it only in the edit dialog, where only Admins can change it; preserve its existing value when Members edit other proposal details.
- Reorder the Proposals table to: Proposal #, Submitted By, Proposal, Date Submitted, Supervisor Name, Accountable Leader, Status, Decision & Rationale, Decision Date, Days (#). Keep sorting available where it exists, and place the pencil action within the Proposal # column so it does not add another column.

## Technical notes
- Update the dashboard form, edit dialog, proposal table, and any related proposal filter labels while keeping the API field named `owner`.
- Keep the analytics view and backend contract unchanged. Add focused tests for the exact supervisor choices, owner payload value, and Admin-only Accountable Leader editing.