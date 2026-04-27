import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Edit,
  Search,
  SlidersHorizontal,
  Star,
  Tag,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import AdminProductEditModal from "../../components/admin/AdminProductEditModal";
import { getStoredToken } from "../../lib/auth";
import { getAdminProducts, updateAdminProduct } from "../../lib/admin";

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
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "sold") {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  return "border-orange-200 bg-orange-50 text-orange-700";
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

  return (
    <AdminLayout
      title="Products"
      subtitle="View and manage all marketplace item listings."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total Products
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{totals.all}</p>
            </div>
            <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Available
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totals.available}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                On Sale
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totals.onSale}
              </p>
            </div>
            <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
              <Tag className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Featured
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totals.featured}
              </p>
            </div>
            <div className="rounded-2xl bg-yellow-50 p-3 text-yellow-600">
              <Star className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 items-center rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Search className="mr-3 h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product, SKU, category..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm text-slate-700 outline-none"
              >
                <option value="all">All statuses</option>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2">
              <Tag className="h-4 w-4 text-slate-400" />
              <select
                value={saleFilter}
                onChange={(e) => setSaleFilter(e.target.value)}
                className="bg-transparent text-sm text-slate-700 outline-none"
              >
                <option value="all">All listings</option>
                <option value="sale">On sale</option>
                <option value="not-sale">Not on sale</option>
                <option value="featured">Featured</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 rounded-[28px] bg-white p-12 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Loading products...
          </h2>
          <p className="mt-2 text-slate-500">Fetching marketplace listings.</p>
        </div>
      ) : pageError ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            No products found
          </h2>
          <p className="mt-2 text-slate-500">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Product
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Price
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Qty
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Flags
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Listed
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedProducts.map((product) => (
                    <tr key={product.productId} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{product.name}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {product.brand || "No brand"} •{" "}
                            {product.category?.name || "N/A"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            SKU: {product.sku || "N/A"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {product.isOnSale && product.salePrice !== null ? (
                          <div>
                            <p className="text-sm font-bold text-emerald-700">
                              {formatMoney(product.salePrice)}
                            </p>
                            <p className="text-xs text-slate-400 line-through">
                              {formatMoney(product.price)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm font-bold text-slate-900">
                            {formatMoney(product.price)}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {product.quantity}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                            product.availabilityStatus
                          )}`}
                        >
                          {product.availabilityStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {product.isOnSale ? (
                            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                              Sale
                            </span>
                          ) : null}

                          {product.isFeatured ? (
                            <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                              Featured
                            </span>
                          ) : null}

                          {!product.isOnSale && !product.isFeatured ? (
                            <span className="text-xs text-slate-400">None</span>
                          ) : null}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(product.listingDate)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing page {currentPage} of {totalPages} •{" "}
              {filteredProducts.length} matching product
              {filteredProducts.length === 1 ? "" : "s"}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className={`rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition ${
                      isActive
                        ? "bg-orange-500 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

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