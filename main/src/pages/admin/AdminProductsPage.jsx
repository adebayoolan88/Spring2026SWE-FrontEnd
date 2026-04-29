import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Edit,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import AdminProductEditModal from "../../components/admin/AdminProductEditModal";
import AdminProductCreateModal from "../../components/admin/AdminProductCreateModal";
import { getStoredToken } from "../../lib/auth";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from "../../lib/admin";

const ITEMS_PER_PAGE = 10;
const MAX_PAGE_COUNT = 5;

function formatMoney(amount) {
  return `$${Number(amount || 0).toFixed(2)}`;
}

function formatDate(dateValue) {
  if (!dateValue) return "N/A";

  try {
    return new Date(dateValue).toLocaleDateString();
  } catch {
    return "N/A";
  }
}

function statusClass(status) {
  if (status === "available") {
    return "admin-products__status-badge admin-products__status-badge--available";
  }

  if (status === "sold") {
    return "admin-products__status-badge admin-products__status-badge--sold";
  }

  if (status === "removed") {
    return "admin-products__status-badge admin-products__status-badge--removed";
  }

  return "admin-products__status-badge admin-products__status-badge--pending";
}

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [saleFilter, setSaleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [editingProduct, setEditingProduct] = useState(null);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const [creatingProduct, setCreatingProduct] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalError, setCreateModalError] = useState("");
  const [createModalSuccess, setCreateModalSuccess] = useState("");
  const [deletingProductId, setDeletingProductId] = useState(null);

  const loadProducts = async () => {
    try {
      const token = getStoredToken();

      if (!token) {
        throw new Error("You must be logged in as an admin.");
      }

      setLoading(true);
      setPageError("");

      const result = await getAdminProducts(token);
      setProducts(result.products || []);
    } catch (err) {
      console.error(err);
      setPageError(err.message || "Failed to load admin products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const searchableText = [
        product.name,
        product.brand,
        product.sku,
        product.category?.name,
        product.availabilityStatus,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all" || product.availabilityStatus === statusFilter;

      const matchesSale =
        saleFilter === "all" ||
        (saleFilter === "sale" && product.isOnSale) ||
        (saleFilter === "not-sale" && !product.isOnSale) ||
        (saleFilter === "featured" && product.isFeatured);

      return matchesSearch && matchesStatus && matchesSale;
    });
  }, [products, query, statusFilter, saleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, saleFilter]);

  const totalPages = Math.max(
    1,
    Math.min(MAX_PAGE_COUNT, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const totals = useMemo(() => {
    return {
      all: products.length,
      available: products.filter(
        (product) => product.availabilityStatus === "available"
      ).length,
      onSale: products.filter((product) => product.isOnSale).length,
      featured: products.filter((product) => product.isFeatured).length,
    };
  }, [products]);

  const categories = useMemo(() => {
    const map = new Map();

    products.forEach((product) => {
      if (product.category?.categoryId && product.category?.name) {
        map.set(product.category.categoryId, product.category.name);
      }
    });

    return Array.from(map.entries()).map(([categoryId, name]) => ({
      categoryId,
      name,
    }));
  }, [products]);

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setModalError("");
    setModalSuccess("");
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);
    setModalError("");
    setModalSuccess("");
  };

  const handleSaveProduct = async (productId, payload) => {
    try {
      const token = getStoredToken();

      if (!token) {
        throw new Error("You must be logged in as an admin.");
      }

      if (payload.isOnSale && payload.salePrice === null) {
        throw new Error("Sale price is required when a product is marked on sale.");
      }

      if (payload.salePrice !== null && payload.salePrice > payload.price) {
        throw new Error("Sale price should not be higher than the regular price.");
      }

      setSaving(true);
      setModalError("");
      setModalSuccess("");

      await updateAdminProduct(token, productId, payload);

      setModalSuccess("Product updated successfully.");

      await loadProducts();

      setTimeout(() => {
        handleCloseEdit();
      }, 500);
    } catch (err) {
      console.error(err);
      setModalError(err.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProduct = async (payload, resetForm) => {
    try {
      const token = getStoredToken();

      if (!token) {
        throw new Error("You must be logged in as an admin.");
      }

      if (payload.isOnSale && payload.salePrice === null) {
        throw new Error("Sale price is required when a product is marked on sale.");
      }

      if (payload.salePrice !== null && payload.salePrice > payload.price) {
        throw new Error("Sale price should not be higher than the regular price.");
      }

      setCreatingProduct(true);
      setCreateModalError("");
      setCreateModalSuccess("");

      await createAdminProduct(token, payload);

      setCreateModalSuccess("Product created successfully.");
      resetForm?.();

      await loadProducts();

      setTimeout(() => {
        setCreateModalOpen(false);
        setCreateModalSuccess("");
      }, 600);
    } catch (err) {
      console.error(err);
      setCreateModalError(err.message || "Failed to create product.");
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Remove "${product.name}" from the storefront? This will not delete old order history.`
    );

    if (!confirmed) return;

    try {
      const token = getStoredToken();

      if (!token) {
        throw new Error("You must be logged in as an admin.");
      }

      setDeletingProductId(product.productId);
      setPageError("");

      await deleteAdminProduct(token, product.productId);

      await loadProducts();
    } catch (err) {
      console.error(err);
      setPageError(err.message || "Failed to remove product.");
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <AdminLayout
      title="Products"
      subtitle="View and manage all marketplace item listings."
    >
      <div className="admin-products__stats-grid">
        <div className="admin-products__stat-card">
          <div className="admin-products__stat-row">
            <div>
              <p className="admin-products__stat-label">
                Total Products
              </p>
              <p className="admin-products__stat-value">{totals.all}</p>
            </div>
            <div className="admin-products__stat-icon admin-products__stat-icon--orange">
              <Boxes className="admin-products__icon" />
            </div>
          </div>
        </div>

        <div className="admin-products__stat-card">
          <div className="admin-products__stat-row">
            <div>
              <p className="admin-products__stat-label">
                Available
              </p>
              <p className="admin-products__stat-value">
                {totals.available}
              </p>
            </div>
            <div className="admin-products__stat-icon admin-products__stat-icon--green">
              <Boxes className="admin-products__icon" />
            </div>
          </div>
        </div>

        <div className="admin-products__stat-card">
          <div className="admin-products__stat-row">
            <div>
              <p className="admin-products__stat-label">
                On Sale
              </p>
              <p className="admin-products__stat-value">
                {totals.onSale}
              </p>
            </div>
            <div className="admin-products__stat-icon admin-products__stat-icon--orange">
              <Tag className="admin-products__icon" />
            </div>
          </div>
        </div>

        <div className="admin-products__stat-card">
          <div className="admin-products__stat-row">
            <div>
              <p className="admin-products__stat-label">
                Featured
              </p>
              <p className="admin-products__stat-value">
                {totals.featured}
              </p>
            </div>
            <div className="admin-products__stat-icon admin-products__stat-icon--yellow">
              <Star className="admin-products__icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 admin-products__stat-card">
        <div className="admin-products__filters-row">
          <div className="admin-products__search">
            <Search className="mr-3 admin-products__icon text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product, SKU, category..."
              className="admin-products__search-input"
            />
          </div>

          <div className="admin-products__filter-controls">
            <div className="admin-products__filter-pill">
              <SlidersHorizontal className="admin-products__tiny-icon" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-products__pill-select"
              >
                <option value="all">All statuses</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="removed">Removed</option>
              </select>
            </div>

            <div className="admin-products__filter-pill">
              <Tag className="admin-products__tiny-icon" />
              <select
                value={saleFilter}
                onChange={(e) => setSaleFilter(e.target.value)}
                className="admin-products__pill-select"
              >
                <option value="all">All listings</option>
                <option value="sale">On sale</option>
                <option value="not-sale">Not on sale</option>
                <option value="featured">Featured</option>
              </select>
            </div>

            <button
              onClick={() => {
                setCreateModalOpen(true);
                setCreateModalError("");
                setCreateModalSuccess("");
              }}
              className="admin-products__create-btn btn-primary"
            >
              <Plus className="admin-products__action-icon" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="admin-products__state-card">
          <h2 className="admin-products__state-title">
            Loading products...
          </h2>
          <p className="admin-products__state-message">Fetching marketplace listings.</p>
        </div>
      ) : pageError ? (
        <div className="admin-products__error">
          {pageError}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="admin-products__state-card admin-products__state-card--empty">
          <h2 className="admin-products__state-title">
            No products found
          </h2>
          <p className="admin-products__state-message">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <>
          <div className="admin-products__table-card">
            <div className="admin-products__table-wrap">
              <table className="admin-products__table">
                <thead className="admin-products__thead">
                  <tr>
                    <th className="admin-products__th">
                      Product
                    </th>
                    <th className="admin-products__th">
                      Price
                    </th>
                    <th className="admin-products__th">
                      Qty
                    </th>
                    <th className="admin-products__th">
                      Status
                    </th>
                    <th className="admin-products__th">
                      Flags
                    </th>
                    <th className="admin-products__th">
                      Listed
                    </th>
                    <th className="admin-products__th admin-products__th--right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="admin-products__tbody">
                  {paginatedProducts.map((product) => (
                    <tr key={product.productId} className="hover:admin-products__thead">
                      <td className="admin-products__td">
                        <div>
                          <p className="admin-products__text-strong">{product.name}</p>
                          <p className="admin-products__text-sub">
                            {product.brand || "No brand"} •{" "}
                            {product.category?.name || "N/A"}
                          </p>
                          <p className="admin-products__text-muted">
                            SKU: {product.sku || "N/A"}
                          </p>
                        </div>
                      </td>

                      <td className="admin-products__td">
                        {product.isOnSale && product.salePrice !== null ? (
                          <div>
                            <p className="admin-products__price admin-products__price--sale">
                              {formatMoney(product.salePrice)}
                            </p>
                            <p className="admin-products__price-strike">
                              {formatMoney(product.price)}
                            </p>
                          </div>
                        ) : (
                          <p className="admin-products__price">
                            {formatMoney(product.price)}
                          </p>
                        )}
                      </td>

                      <td className="admin-products__td">
                        <p className="text-sm admin-products__text-strong">
                          {product.quantity}
                        </p>
                      </td>

                      <td className="admin-products__td">
                        <span
                          className={statusClass(
                            product.availabilityStatus
                          )}
                        >
                          {product.availabilityStatus}
                        </span>
                      </td>

                      <td className="admin-products__td">
                        <div className="admin-products__chips">
                          {product.isOnSale ? (
                            <span className="admin-products__chip admin-products__chip--sale">
                              Sale
                            </span>
                          ) : null}

                          {product.isFeatured ? (
                            <span className="admin-products__chip admin-products__chip--featured">
                              Featured
                            </span>
                          ) : null}

                          {!product.isOnSale && !product.isFeatured ? (
                            <span className="admin-products__text-muted">None</span>
                          ) : null}
                        </div>
                      </td>

                      <td className="admin-products__td admin-products__text-sm">
                        {formatDate(product.listingDate)}
                      </td>

                      <td className="admin-products__td text-right">
                        <div className="admin-products__actions">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="admin-products__action-btn admin-products__action-btn--edit"
                          >
                            <Edit className="admin-products__action-icon" />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(product)}
                            disabled={
                              deletingProductId === product.productId ||
                              product.availabilityStatus === "removed"
                            }
                            className="admin-products__action-btn admin-products__action-btn--delete"
                          >
                            <Trash2 className="admin-products__action-icon" />
                            {deletingProductId === product.productId
                              ? "Removing..."
                              : product.availabilityStatus === "removed"
                              ? "Removed"
                              : "Remove"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 admin-products__filter-controls sm:items-center sm:justify-between">
            <p className="admin-products__pagination-text">
              Showing page {currentPage} of {totalPages} •{" "}
              {filteredProducts.length} matching product
              {filteredProducts.length === 1 ? "" : "s"}
            </p>

            <div className="admin-products__pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:admin-products__thead disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                const isActive = currentPage === pageNumber;

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`admin-products__page-btn ${
                      isActive
                        ? "bg-orange-500 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:admin-products__thead"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:admin-products__thead disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <AdminProductCreateModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setCreateModalError("");
          setCreateModalSuccess("");
        }}
        onSave={handleCreateProduct}
        saving={creatingProduct}
        error={createModalError}
        successMessage={createModalSuccess}
        categories={categories}
      />

      <AdminProductEditModal
        product={editingProduct}
        isOpen={Boolean(editingProduct)}
        onClose={handleCloseEdit}
        onSave={handleSaveProduct}
        saving={saving}
        error={modalError}
        successMessage={modalSuccess}
      />
    </AdminLayout>
  );
}

export default AdminProductsPage;