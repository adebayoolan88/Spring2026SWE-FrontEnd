import { X } from "lucide-react";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

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

  return (
    <div className="category-nav">
      <div className="category-nav__grid">
        {CATEGORIES.map((category) => {
          const isOpen = activeMenu === category;
          const categoryItems = getItemsForCategory(category);

          return (
            <div key={category} className="category-nav__menu">
              <DropdownButton
                as={ButtonGroup}
                title={category}
                className={`category-nav__trigger ${
                  isOpen ? "category-nav__trigger--active" : ""
                }`}
                show={isOpen}
                onToggle={(isDropdownOpen) => {
                  setActiveMenu(isDropdownOpen ? category : null);
                  if (isDropdownOpen) {
                    onSelectCategory(category);
                  }
                }}
                variant=""
              >
                <Dropdown.Item
                  onClick={() => {
                    onClearCategory();
                    setActiveMenu(null);
                  }}
                  className="category-nav__clear-item"
                >
                  <X className="category-nav__clear-icon" />
                  Show full inventory
                </Dropdown.Item>

                {categoryItems.length === 0 ? (
                  <Dropdown.Item disabled className="category-nav__empty-item">
                    No listings in this category yet.
                  </Dropdown.Item>
                ) : (
                  categoryItems.map((item) => (
                    <Dropdown.Item
                      key={item.id}
                      onClick={() => {
                        onSelectListing(item);
                        setActiveMenu(null);
                      }}
                      className="category-nav__listing-item"
                    >
                      <div className="category-nav__item-row">
                        <div>
                          <p className="category-nav__item-name">{item.name}</p>
                          <p className="category-nav__item-meta">Qty: {item.quantity}</p>
                        </div>
                        <p className="category-nav__item-price">${item.price}</p>
                      </div>
                    </Dropdown.Item>
                  ))
                )}
              </DropdownButton>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryNav;
