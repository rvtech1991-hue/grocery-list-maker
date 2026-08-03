import React, { useMemo, useState } from 'react';
import { Search, Send, X } from 'lucide-react';
import { GroceryConfig, GroceryItem } from '../types';
import './ModernView.css';

interface ModernViewProps {
  items: GroceryItem[];
  config: GroceryConfig;
  onCheckboxChange: (id: number) => void;
  onUnitChange: (id: number, unit: string) => void;
  onQuantityChange: (id: number, quantity: string) => void;
  onSubmit: () => void;
  selectedCount: number;
}

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const CATEGORY_ICONS: Record<string, string> = {
  'Dal & Pulses': '🫘',
  'Spices & Masala': '🌶️',
  'Oil & Ghee': '🛢️',
  'Grains & Staples': '🌾',
  'Dry Fruits & Nuts': '🥜',
  'Cleaning & Household': '🧼',
  'Personal Care': '🪥',
  'Snacks & Others': '🍪',
  'Beverages': '☕'
};

const ItemThumb: React.FC<{ item: GroceryItem }> = ({ item }) => {
  const [errored, setErrored] = useState(false);

  if (!item.image || errored) {
    return <div className="modern-card-icon">{item.icon}</div>;
  }

  return (
    <img
      src={item.image}
      alt={item.name}
      className="modern-card-image"
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
    />
  );
};

const ModernView: React.FC<ModernViewProps> = ({
  items,
  config,
  onCheckboxChange,
  onUnitChange,
  onQuantityChange,
  onSubmit,
  selectedCount
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item => item.name.toLowerCase().includes(q));
  }, [items, searchQuery]);

  const categorizedSections = useMemo(() => {
    return config.categoryOrder
      .map(category => ({
        category,
        items: filteredItems.filter(item => item.category === category)
      }))
      .filter(section => section.items.length > 0);
  }, [config.categoryOrder, filteredItems]);

  const scrollToCategory = (category: string) => {
    const el = document.getElementById(`cat-${slugify(category)}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="modern-view">
      <div className="modern-search-bar">
        <div className="modern-search-input">
          <Search size={18} className="modern-search-icon" />
          <input
            type="text"
            placeholder="Search items (e.g. dal, oil, colgate)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="modern-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="modern-results-hint">
          {searchQuery
            ? `${filteredItems.length} result${filteredItems.length === 1 ? '' : 's'} for "${searchQuery}"`
            : `${items.length} items across ${categorizedSections.length} categories`}
        </div>

        {!searchQuery && (
          <div className="modern-category-nav">
            {categorizedSections.map(section => (
              <button
                key={section.category}
                type="button"
                className="modern-chip"
                onClick={() => scrollToCategory(section.category)}
              >
                {CATEGORY_ICONS[section.category] ?? '🛒'} {section.category}
              </button>
            ))}
          </div>
        )}
      </div>

      {categorizedSections.length === 0 ? (
        <div className="modern-empty-state">
          <p>No items match "{searchQuery}"</p>
        </div>
      ) : (
        categorizedSections.map((section, index) => (
          <section
            key={section.category}
            id={`cat-${slugify(section.category)}`}
            className="modern-category-section"
            style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
          >
            <div className="modern-category-header">
              <h4>
                <span className="modern-category-icon" aria-hidden="true">
                  {CATEGORY_ICONS[section.category] ?? '🛒'}
                </span>
                {section.category}
              </h4>
              <span className="modern-category-count">{section.items.length}</span>
            </div>
            <div className="modern-grid">
              {section.items.map(item => (
                <div
                  key={item.id}
                  className={`modern-card ${item.selected ? 'selected' : ''}`}
                  onClick={() => onCheckboxChange(item.id)}
                >
                  <input
                    type="checkbox"
                    className="modern-card-checkbox"
                    checked={item.selected}
                    onChange={() => onCheckboxChange(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <ItemThumb item={item} />
                  <div className="modern-card-name">{item.name}</div>

                  {item.selected && (
                    <div className="modern-card-controls" onClick={(e) => e.stopPropagation()}>
                      <select
                        className="modern-card-select"
                        value={item.unit}
                        onChange={(e) => onUnitChange(item.id, e.target.value)}
                      >
                        {config.units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                      <input
                        type={item.unit === 'Other' ? 'text' : 'number'}
                        className="modern-card-qty"
                        value={item.quantity}
                        onChange={(e) => onQuantityChange(item.id, e.target.value)}
                        min="0.0"
                        step="0.5"
                        placeholder={item.unit === 'Other' ? 'Rs.20' : '1'}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      <div className="modern-submit-bar">
        <span className="modern-submit-count">
          <strong>{selectedCount}</strong> item{selectedCount === 1 ? '' : 's'} selected
        </span>
        <button type="button" className="modern-submit-btn" onClick={onSubmit}>
          <Send size={18} />
          Submit & Preview
        </button>
      </div>
    </div>
  );
};

export default ModernView;
