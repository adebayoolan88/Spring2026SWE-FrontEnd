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
    <div className="admin-dashboard__stat-card">
      <div className="admin-dashboard__stat-row">
        <div>
          <p className="admin-dashboard__stat-label">
            {label}
          </p>
          <p className="admin-dashboard__stat-value">{value}</p>
        </div>

        <div className="admin-dashboard__stat-icon-wrap">
          <Icon className="admin-dashboard__icon" />
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
        <div className="admin-dashboard__state-card">
          <h2 className="admin-dashboard__state-title">
            Loading dashboard...
          </h2>
          <p className="admin-dashboard__state-message">Fetching admin statistics.</p>
        </div>
      ) : error ? (
        <div className="admin-dashboard__error">
          {error}
        </div>
      ) : (
        <>
          <div className="admin-dashboard__stats-grid">
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

          <div className="admin-dashboard__quick-actions">
            <h2 className="admin-dashboard__quick-title">Quick Actions</h2>
            <p className="admin-dashboard__quick-subtitle">
              Use these shortcuts to manage the most important admin areas.
            </p>

            <div className="admin-dashboard__quick-buttons">
              <button
                onClick={() => {
                  window.location.href = "/admin/products";
                }}
                className="btn-primary"
              >
                Manage Products
              </button>

              <button
                onClick={() => {
                  window.location.href = "/admin/discount-codes";
                }}
                className="btn-secondary"
              >
                Create Discount Code
              </button>

              <button
                onClick={() => {
                  window.location.href = "/admin/sales";
                }}
                className="btn-secondary"
              >
                Create Sale
              </button>

              <button
                onClick={() => {
                  window.location.href = "/admin/orders";
                }}
                className="btn-secondary"
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