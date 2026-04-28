import { useEffect, useState } from "react";
import {
  Boxes,
  DollarSign,
  Percent,
  ReceiptText,
  Tags,
  Users,
} from "lucide-react";
import { getStoredToken } from "../../lib/auth";
import { getAdminDashboard } from "../../lib/admin";
import AdminLayout from "../../components/layout/AdminLayout";

function formatMoney(amount) {
  return `$${Number(amount || 0).toFixed(2)}`;
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="page-admin-dashboard rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = getStoredToken();

        if (!token) {
          throw new Error("You must be logged in as an admin.");
        }

        const result = await getAdminDashboard(token);
        setDashboard(result.dashboard);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="View high-level marketplace activity and admin stats."
    >
      {loading ? (
        <div className="rounded-[28px] bg-white p-12 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Loading dashboard...
          </h2>
          <p className="mt-2 text-slate-500">Fetching admin statistics.</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Total Users"
              value={dashboard?.totalUsers || 0}
              icon={Users}
            />
            <StatCard
              label="Active Users"
              value={dashboard?.activeUsers || 0}
              icon={Users}
            />
            <StatCard
              label="Total Products"
              value={dashboard?.totalProducts || 0}
              icon={Boxes}
            />
            <StatCard
              label="Available Products"
              value={dashboard?.availableProducts || 0}
              icon={Boxes}
            />
            <StatCard
              label="Total Orders"
              value={dashboard?.totalOrders || 0}
              icon={ReceiptText}
            />
            <StatCard
              label="Pending Orders"
              value={dashboard?.pendingOrders || 0}
              icon={ReceiptText}
            />
            <StatCard
              label="Total Revenue"
              value={formatMoney(dashboard?.totalRevenue)}
              icon={DollarSign}
            />
            <StatCard
              label="Active Discount Codes"
              value={dashboard?.activeDiscountCodes || 0}
              icon={Percent}
            />
            <StatCard
              label="Active Sales"
              value={dashboard?.activeSales || 0}
              icon={Tags}
            />
          </div>

          <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
            <p className="mt-2 text-sm text-slate-500">
              Use these shortcuts to manage the most important admin areas.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  window.location.href = "/admin/products";
                }}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Manage Products
              </button>

              <button
                onClick={() => {
                  window.location.href = "/admin/discount-codes";
                }}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Create Discount Code
              </button>

              <button
                onClick={() => {
                  window.location.href = "/admin/sales";
                }}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Create Sale
              </button>

              <button
                onClick={() => {
                  window.location.href = "/admin/orders";
                }}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View Orders
              </button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default AdminDashboardPage;