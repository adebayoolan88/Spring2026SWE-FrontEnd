import { ChevronDown, X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

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
  const navRef = useRef(null);

  const getItemsForCategory = (category) => {
    return items.filter(
      (item) => item.category?.toLowerCase() === category.toLowerCase()
    );
  };

  const activeItems = useMemo(
    () => (activeMenu ? getItemsForCategory(activeMenu) : []),
    [items, activeMenu]
  );

  const activeSections = useMemo(() => {
    if (!activeMenu) return [];

    const inStock = activeItems.filter((item) => Number(item.quantity) > 0);
    const outOfStock = activeItems.filter((item) => Number(item.quantity) <= 0);

    const priceLowHigh = [...activeItems].sort(
      (a, b) => Number(a.price || 0) - Number(b.price || 0)
    );

    const featured = activeItems.filter((item) => Boolean(item.isFeatured));

    return [
      {
        key: "in-stock",
        title: `${activeMenu} In Stock`,
        items: inStock.slice(0, 7),
      },
      {
        key: "budget-picks",
        title: "Budget Picks",
        items: priceLowHigh.slice(0, 7),
      },
      {
        key: "featured",
        title: "Featured",
        items: featured.slice(0, 7),
      },
      {
        key: "out-of-stock",
        title: "Coming Soon",
        items: outOfStock.slice(0, 7),
      },
    ].filter((section) => section.items.length > 0);
  }, [activeItems, activeMenu]);

  useEffect(() => {
    if (!activeMenu) return undefined;

    const handlePointerDown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [activeMenu, setActiveMenu]);

  const handleOpenCategory = (category) => {
    const next = activeMenu === category ? null : category;
    setActiveMenu(next);

    if (next) {
      onSelectCategory(category);
    }
  };

  return (
    <div className="category-nav" ref={navRef}>
      <div className="category-nav__tabs" role="menubar" aria-label="Categories">
        {CATEGORIES.map((category) => {
          const isOpen = activeMenu === category;

          return (
            <button
              key={category}
              type="button"
              role="menuitem"
              className={`category-nav__tab ${
                isOpen ? "category-nav__tab--active" : ""
              }`}
              aria-expanded={isOpen}
              aria-controls="category-nav-mega-panel"
              onClick={() => handleOpenCategory(category)}
              onMouseEnter={() => {
                setActiveMenu(category);
                onSelectCategory(category);
              }}
            >
              <span>{category}</span>
              <ChevronDown
                className={`category-nav__trigger-icon ${
                  isOpen ? "category-nav__trigger-icon--open" : ""
                }`}
              />
            </button>
          );
        })}
      </div>

      {activeMenu && (
        <div className="category-nav__mega" id="category-nav-mega-panel" role="region">
          <div className="category-nav__mega-header">
            <h3 className="category-nav__mega-title">{activeMenu}</h3>
            <div className="category-nav__mega-actions">
              <button
                type="button"
                className="category-nav__shop-all"
                onClick={() => {
                  onSelectCategory(activeMenu);
                  setActiveMenu(null);
                }}
              >
                Shop All {activeMenu}
              </button>

              <button
                type="button"
                className="category-nav__clear-btn"
                aria-label="Show full inventory"
                title="Show full inventory"
                onClick={() => {
                  onClearCategory();
                  setActiveMenu(null);
                }}
              >
                <X className="category-nav__clear-icon" />
              </button>
            </div>
          </div>

          {activeSections.length === 0 ? (
            <div className="category-nav__empty">No listings in this category yet.</div>
          ) : (
            <div className="category-nav__mega-grid">
              {activeSections.map((section) => (
                <div key={section.key} className="category-nav__section">
                  <h4 className="category-nav__section-title">{section.title}</h4>
                  <div className="category-nav__section-list">
                    {section.items.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className="category-nav__mega-link"
                        onClick={() => {
                          onSelectListing(item);
                          setActiveMenu(null);
                        }}
                      >
                        <span className="category-nav__item-name">{item.name}</span>
                        <span className="category-nav__item-meta">
                          Qty: {item.quantity} • ${item.price}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CategoryNav;
