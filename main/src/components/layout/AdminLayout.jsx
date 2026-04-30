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
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "Products", href: "/admin/products", icon: Boxes },
  { label: "Orders", href: "/admin/orders", icon: ReceiptText },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Discount Codes", href: "/admin/discount-codes", icon: Percent },
  { label: "Sales", href: "/admin/sales", icon: Tags },
];

function AdminLayout({ children, title = "Admin Panel", subtitle = "" }) {
  const currentPath = window.location.pathname;

  return (
    <div className="admin-layout">
      <div className="admin-layout__topbar">
        <div className="admin-layout__topbar-inner">
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="admin-layout__brand"
          >
            <div className="admin-layout__brand-copy">
              <p className="admin-layout__brand-title">NoteSwap Admin</p>
              <p className="admin-layout__brand-subtitle">Manage marketplace operations</p>
            </div>
          </button>

          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="admin-layout__storefront-btn"
          >
            <Home className="admin-layout__icon" />
            Storefront
          </button>
        </div>
      </div>

      <div className="admin-layout__content">
        <aside className="admin-layout__sidebar">
          <nav className="admin-layout__nav">
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
                  className={`admin-layout__nav-item ${
                    isActive ? "admin-layout__nav-item--active" : ""
                  }`}
                >
                  <Icon className="admin-layout__icon" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main>
          <div className="admin-layout__page-header">
            <p className="admin-layout__eyebrow">Admin</p>
            <h1 className="admin-layout__title">{title}</h1>
            {subtitle ? <p className="admin-layout__subtitle">{subtitle}</p> : null}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
