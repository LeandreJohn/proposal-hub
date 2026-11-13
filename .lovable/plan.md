## Proposal owner and accountable leader
- Allow a proposal to be submitted with no Owner; send `owner: ""` when the owner dropdown is untouched or the “Other” name is blank.
- Add an “Accountable Leader” text field to proposal submission and editing, include it in the API payload as `accountableLeader`, and show it in the proposal table with quick sorting.
- Display an empty value for older proposals that do not yet contain this field.

## Technical notes
- Update the shared proposal type and dashboard form/table while preserving the FastAPI and local-demo data paths.
- The FastAPI service must accept, persist, and return the `accountableLeader` field; its code is external to this project.
- Add focused tests for blank-owner submission and Accountable Leader sorting/display data behavior using existing test conventions.
