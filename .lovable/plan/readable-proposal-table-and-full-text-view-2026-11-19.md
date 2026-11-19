## Readable proposal table and full-text view
- Keep long Proposal and Decision & Rationale text compact in the table using a short preview with truncation so it cannot stretch the table across the screen.
- Clicking a proposal row opens a read-only popup showing the complete proposal and decision text, along with the proposal’s key fields.
- Keep the pencil button dedicated to editing; clicking it must not also open the read-only popup.
- Make the popup content scrollable and readable on desktop and mobile, including long multi-section entries like the HOP CORE sample.

## Technical notes
- Update the Proposals table and add a selected-row dialog using the existing dialog components; preserve current sorting, pagination, and edit behavior.
- Verify with a long proposal sample that the table stays compact and the popup exposes the full text.