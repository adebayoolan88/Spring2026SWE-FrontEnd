import { ChevronDown, X } from "lucide-react";

// Hardcoded category list used for the secondary navigation bar.
const CATEGORIES = [
  "Accessories",
  "Brass",
  "Drums",
  "Guitar",
  "Piano",
  "Violin",
  "Woodwind",
];

function CategoryNav({
  items,
  activeMenu,
  setActiveMenu,
  onSelectCategory,
  onSelectListing,
  onClearCategory,
}) {
  // Returns only the products that belong to one category.
  const getItemsForCategory = (category) => {
    return items.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
  };

  // If the user clicks the same category again, close it.
  // If they click a different one, open that one instead.
  const toggleMenu = (category) => {
    setActiveMenu(activeMenu === category ? null : category);
  };

  return (
    <div className="border-b border-slate-200 bg-white">
      {/* Category buttons laid out in a responsive grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 px-4 py-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 lg:px-8">
        {CATEGORIES.map((category) => {
          const isOpen = activeMenu === category;
          const categoryItems = getItemsForCategory(category);

          return (
            <div key={category} className="relative">
              {/* Category button */}
              <button
                onClick={() => {
                  toggleMenu(category);
                  onSelectCategory(category);
                }}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  isOpen
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {category}
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* Dropdown for products in that category */}
              {isOpen && (
                <div className="absolute left-0 top-full z-40 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {category} Listings
                    </div>

                    {/* X button clears filters and returns to full inventory */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(null);
                        onClearCategory();
                      }}
                      className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Show full inventory"
                      title="Show full inventory"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Empty state vs listing buttons */}
                  {categoryItems.length === 0 ? (
                    <div className="px-3 py-3 text-sm text-slate-500">
                      No listings in this category yet.
                    </div>
                  ) : (
                    categoryItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          // Selecting a listing usually updates category + search in the parent.
                          onSelectListing(item);
                          setActiveMenu(null);
                        }}
                        className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-slate-900">
                            ${item.price}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryNav;