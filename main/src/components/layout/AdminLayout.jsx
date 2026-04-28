import {
  BarChart3,
  Boxes,
  Home,
  Percent,
  ReceiptText,
  Tags,
  Users,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Boxes,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ReceiptText,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Discount Codes",
    href: "/admin/discount-codes",
    icon: Percent,
  },
  {
    label: "Sales",
    href: "/admin/sales",
    icon: Tags,
  },
];

function AdminLayout({ children, title = "Admin Panel", subtitle = "" }) {
  const currentPath = window.location.pathname;

  return (
    <div className="admin-layout min-h-screen bg-[#f7f8fa] text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-bold text-white shadow-md">
              NS
            </div>
            <div className="text-left">
              <p className="text-xl font-bold tracking-tight text-slate-900">
                NoteSwap Admin
              </p>
              <p className="text-xs text-slate-500">Manage marketplace operations</p>
            </div>
          </button>

          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Home className="h-4 w-4" />
            Storefront
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="h-fit rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentPath === item.href ||
                (item.href !== "/admin" && currentPath.startsWith(item.href));

              return (
                <button
                  key={item.href}
                  onClick={() => {
                    window.location.href = item.href;
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main>
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
              Admin
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
            ) : null}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;