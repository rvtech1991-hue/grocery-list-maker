import React from 'react';
import { GroceryConfig, GroceryItem } from '../types';

interface ClassicViewProps {
  items: GroceryItem[];
  config: GroceryConfig;
  onCheckboxChange: (id: number) => void;
  onUnitChange: (id: number, unit: string) => void;
  onQuantityChange: (id: number, quantity: string) => void;
  onSubmit: () => void;
  selectedCount: number;
}

const ClassicView: React.FC<ClassicViewProps> = ({
  items,
  config,
  onCheckboxChange,
  onUnitChange,
  onQuantityChange,
  onSubmit,
  selectedCount
}) => {
  return (
    <div className="card shadow-lg">
      <div className="card-body">
        <div className="alert alert-info mb-4">
          <strong>Selected Items:</strong> <span className="badge bg-primary fs-6">{selectedCount}</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-striped">
            <thead className="table-dark">
              <tr>
                <th style={{ width: '60px' }}>Select</th>
                <th>Item</th>
                <th style={{ width: '120px' }}>Unit</th>
                <th style={{ width: '90px' }}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      checked={item.selected}
                      onChange={() => onCheckboxChange(item.id)}
                    />
                  </td>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={item.unit}
                      onChange={(e) => onUnitChange(item.id, e.target.value)}
                      disabled={!item.selected}
                    >
                      {config.units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={item.quantity}
                      onChange={(e) => onQuantityChange(item.id, e.target.value)}
                      disabled={!item.selected}
                      min="0.0"
                      step="0.5"
                      placeholder="1"
                      style={{ display: item.unit === 'Other' ? 'none' : 'block' }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={item.quantity}
                      onChange={(e) => onQuantityChange(item.id, e.target.value)}
                      disabled={!item.selected}
                      placeholder="Rs.20"
                      style={{ display: item.unit === 'Other' ? 'block' : 'none' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-grid mt-4">
          <button
            className="btn btn-primary btn-lg"
            onClick={onSubmit}
          >
            Submit & Preview List
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassicView;
