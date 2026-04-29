import { ChevronDown, X } from "lucide-react";

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
  const getItemsForCategory = (category) => {
    return items.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
  };

  const toggleMenu = (category) => {
    setActiveMenu(activeMenu === category ? null : category);
  };

  return (
    <div className="category-nav">
      <div className="category-nav__grid">
        {CATEGORIES.map((category) => {
          const isOpen = activeMenu === category;
          const categoryItems = getItemsForCategory(category);

          return (
            <div key={category} className="category-nav__menu">
              <button
                onClick={() => {
                  toggleMenu(category);
                  onSelectCategory(category);
                }}
                className={`category-nav__trigger ${
                  isOpen ? "category-nav__trigger--active" : ""
                }`}
              >
                {category}
                <ChevronDown className="category-nav__trigger-icon" />
              </button>

              {isOpen && (
                <div className="category-nav__panel">
                  <div className="category-nav__panel-header">
                    <div className="category-nav__panel-title">{category} Listings</div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(null);
                        onClearCategory();
                      }}
                      className="category-nav__clear-btn"
                      aria-label="Show full inventory"
                      title="Show full inventory"
                    >
                      <X className="category-nav__clear-icon" />
                    </button>
                  </div>

                  {categoryItems.length === 0 ? (
                    <div className="category-nav__empty">No listings in this category yet.</div>
                  ) : (
                    categoryItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectListing(item);
                          setActiveMenu(null);
                        }}
                        className="category-nav__item"
                      >
                        <div className="category-nav__item-row">
                          <div>
                            <p className="category-nav__item-name">{item.name}</p>
                            <p className="category-nav__item-meta">Qty: {item.quantity}</p>
                          </div>
                          <p className="category-nav__item-price">${item.price}</p>
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
