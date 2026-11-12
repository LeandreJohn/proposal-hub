## Proposal submission and owner entry
- Automatically fill “Submitted by” from the signed-in session and make it non-editable in the new proposal form.
- Add “Other” to the owner dropdown; selecting it reveals a name field, and submissions send that entered name as `owner` (never the literal “Other”).

## Role-based dashboard
- Members see only the Proposals tab; Admins retain Proposals, Analytics, and Users.
- Keep the demo sign-in as an Admin, as requested, and use the signed-in identity for proposal attribution.

## Proposal list
- Add sortable column headers for quick sorting in the dashboard proposal table.
- Show 20 proposals per page and add bottom pagination when the filtered results exceed 20; changing filters or sort returns to the first page.

## Technical notes
- Make the changes in the existing dashboard and demo session/data layer, preserving the FastAPI/local-demo API shape.
- Role-based tab visibility is a frontend display rule. The connected FastAPI service must independently enforce authorization for secure data access and writes.
- Add focused tests for owner “Other” payload normalization and the 20-row pagination boundary where existing test patterns allow.
