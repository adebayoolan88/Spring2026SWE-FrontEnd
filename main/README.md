# Frontend (React + Vite)

## Styling architecture

This project is using a **semantic CSS architecture** and is explicitly moving away from Tailwind utility-class JSX.

### Rules for contributors

- Prefer semantic/BEM-like class names in JSX (e.g. `my-orders__card`, `checkout-success__total-row`).
- Add or update styles under `src/styles/**`.
- Keep page-specific styles in `src/styles/pages/**`.
- Keep reusable component styles in `src/styles/components/**`.
- Shared layout/base tokens live in:
  - `src/styles/base.css`
  - `src/styles/layout.css`
  - `src/styles/tokens.css`
  - `src/styles/utilities.css` (for project utility helpers only, not Tailwind classes)
- Avoid introducing new Tailwind-style class strings in JSX (e.g. `px-4`, `text-slate-900`, `sm:grid-cols-2`).

## Current migration status

The following high-utility screens/components have been migrated to semantic class usage:

- `MyOrdersPage.jsx`
- `MyProfilePage.jsx`
- `CheckoutSuccessPage.jsx`
- `CheckoutCancelPage.jsx`
- Modal/component cleanup in:
  - `AdminUserEditModal.jsx`
  - `ProductDetailsModal.jsx`

If you touch these files, keep the semantic class pattern consistent and update the paired CSS files in `src/styles/`.

## Development

```bash
npm install
npm run dev
```

## Button policy

We use **shared button primitives** for all new and refactored button work.

- Base interaction/sizing comes from shared classes in `src/styles/utilities.css`.
- Use `btn-primary`, `btn-secondary`, `btn-ghost`, and `btn-destructive` directly in JSX.
- For disabled buttons, use the native `disabled` attribute (the primitive styles handle opacity/cursor).

Examples:

```jsx
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-ghost">Ghost</button>
<button className="btn-destructive">Delete</button>
<button className="btn-primary" disabled>Disabled</button>
```

Run `npm run check:classnames` before opening a PR. This flags new Tailwind-like utility tokens in `className` values.
