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
  const navRef = useRef(null);

  const getItemsForCategory = (category) => {
    return items.filter(
      (item) => item.category?.toLowerCase() === category.toLowerCase()
    );
  };

  const toggleMenu = (category) => {
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
            <div key={category} className="category-nav__menu">
              <button
                type="button"
                className={`category-nav__trigger ${
                  isOpen ? "category-nav__trigger--active" : ""
                }`}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                onClick={() => toggleMenu(category)}
              >
                <span>{category}</span>
                <ChevronDown
                  className={`category-nav__trigger-icon ${
                    isOpen ? "category-nav__trigger-icon--open" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="category-nav__panel" role="menu">
                  <div className="category-nav__panel-header">
                    <div className="category-nav__panel-title">{category} Listings</div>

                    <button
                      type="button"
                      className="category-nav__clear-btn"
                      aria-label="Show full inventory"
                      title="Show full inventory"
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveMenu(null);
                        onClearCategory();
                      }}
                    >
                      <X className="category-nav__clear-icon" />
                    </button>
                  </div>

                  {categoryItems.length === 0 ? (
                    <div className="category-nav__empty">No listings in this category yet.</div>
                  ) : (
                    categoryItems.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className="category-nav__item"
                        onClick={() => {
                          onSelectListing(item);
                          setActiveMenu(null);
                        }}
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
