# Spring2026SWE
Group Project Software Engineering Spring 2026

## Brand color theming guide

All color choices are defined as semantic design tokens in `main/src/tokens.css`.
Component-level styles should consume `var(--token-name)` values and should not introduce raw hex colors.

### Where to change brand colors

Edit these variables in the `:root` block inside `main/src/tokens.css`:

- `--accent`: Primary brand/action color (buttons, focus ring accents).
- `--accent-bg`: Accent surface background (button fills, highlighted chips).
- `--accent-border`: Accent hover/active border color.
- `--color-text-base`: Global body text color.
- `--color-bg-page-start` and `--color-bg-page-end`: Main page gradient colors.
- `--border`: Dividers and section outlines.
- `--text-h`: High-emphasis text in links/cards.
- `--social-bg`: Pill/button neutral backgrounds.
- `--shadow`: Elevated hover/focus shadow tone.

### Expected impact examples

- Changing `--accent` updates interactive accents globally, including the counter text and focus outline.
- Changing `--color-bg-page-start` / `--color-bg-page-end` updates the page background gradient without touching component CSS.
- Changing `--border` updates section separators and decorative tick marks in shared layouts.

### Alternate theme support

A second theme block already exists in `main/src/tokens.css`:

- `[data-theme="alt"]` overrides the same semantic tokens with alternate values.

To preview alternate branding, set `data-theme="alt"` on the root HTML element (or any parent container).
No component CSS edits are required for theme switching, because components only read semantic variables.
