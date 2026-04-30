# Page-by-Page UI Migration Playbook

This file operationalizes the migration order and verification flow.

## 1) Start with global tokens/base styles only

- Keep design decisions centralized in `src/styles/tokens.css`, `src/styles/base.css`, and `src/styles/layout.css`.
- Avoid introducing new one-off colors/spacing in page files unless promoted back to tokens.
- Keep legacy token definitions temporarily for compatibility and annotate them as deprecated.

## 2) Migrate high-traffic pages in order

Migration order:
1. Home (`AppHomePage` styles and catalog shell)
2. Product/content lists (catalog state and list/grid surfaces)
3. Profile (`MyProfilePage`)
4. Checkout (`CheckoutSuccessPage`, `CheckoutCancelPage`)

## 3) Validation checklist after each page migration

For each page above, run the following before moving to the next page:

- [ ] Navigation routes
  - Enter page directly via URL
  - Navigate from primary nav and return
- [ ] Button actions
  - Primary and secondary actions trigger expected handlers
  - Disabled/loading button states are visually distinct
- [ ] Form submission flows
  - Success and error messaging states render with tokenized feedback colors
  - Inputs retain focus styles and validation legibility
- [ ] Conditional rendering (auth/admin states)
  - Logged-out vs logged-in states
  - Admin-only surfaces hidden for non-admin users

## 4) Legacy CSS retention and removal policy

- During migration, keep old CSS blocks in place with a clear `LEGACY:` comment.
- Remove legacy blocks only after page-level checklist items pass.
- If keeping temporary compatibility styles, tie comments to the page migration checkpoint.

## 5) Finish with consistency sweep

After all target pages are migrated:
- Sweep edge pages/components for token drift.
- Normalize heading, spacing, border, and alert patterns.
- Re-run the full UI state checklist and refresh baseline screenshots.
