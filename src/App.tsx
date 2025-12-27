import React, { useState, useEffect } from 'react';
import { Download, Send, Copy, ShoppingCart, CheckCircle } from 'lucide-react';

// Grocery configuration - this will be loaded from JSON file
interface GroceryConfig {
  items: Array<{ id: number; name: string }>;
  units: string[];
  user: {
    name: string;
    mobile: string;
    shopkeeperMobile: string;
  };
}

interface GroceryItem {
  id: number;
  name: string;
  unit: string;
  quantity: string;
  selected: boolean;
}

const GroceryListApp = () => {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [config, setConfig] = useState<GroceryConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    // Load configuration from JSON file
    fetch('/config/groceryConfig.json')
      .then(response => response.json())
      .then((configData: GroceryConfig) => {
        setConfig(configData);
        
        // Initialize items from config
        const initialItems = configData.items.map((item: { id: number; name: string }) => ({
          ...item,
          unit: 'Kg(s)',
          quantity: '1',
          selected: false
        }));
        setItems(initialItems);
        setLoading(false);
      })
      .catch((error: Error) => {
        console.error('Error loading config:', error);
        showToast('Failed to load grocery items. Please refresh the page', 'error');
        setLoading(false);
      });
  }, []);

  const showToast = (message: string, type: string) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleCheckboxChange = (id: number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const handleUnitChange = (id: number, unit: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, unit } : item
    ));
  };

  const handleQuantityChange = (id: number, quantity: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const getSelectedCount = () => items.filter(item => item.selected).length;

  const getSelectedItems = () => items.filter(item => item.selected);

  const formatDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatItemDisplay = (item: GroceryItem) => {
    // If unit is "Other", don't show the unit word
    if (item.unit === 'Other') {
      return `${item.quantity} ${item.name}`;
    }
    return `${item.quantity} ${item.unit} ${item.name}`;
  };

  const generateListText = () => {
    if (!config) return '';
    
    const selectedItems = getSelectedItems();
    let text = `📅 Date: ${formatDate()}\n`;
    text += `👤 Name: ${config.user.name}\n`;
    text += `📱 Contact: ${config.user.mobile}\n\n`;
    text += `🛒 *Grocery List*\n`;
    text += `${'-'.repeat(35)}\n\n`;
    
    selectedItems.forEach((item, index) => {
      text += `${index + 1}) ${formatItemDisplay(item)}\n`;
    });
    
    text += `\n${'-'.repeat(35)}\n`;
    text += `Total Items: ${selectedItems.length}`;
    
    return text;
  };

  const handleSubmit = () => {
    const selectedCount = getSelectedCount();
    if (selectedCount === 0) {
      showToast('Please select at least one item', 'warning');
      return;
    }
    setShowPreview(true);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateListText());
      showToast('List copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownload = () => {
    const text = generateListText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grocery-list-${formatDate()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('List downloaded successfully!', 'success');
  };

  const handleSendWhatsApp = () => {
    if (!config) return;
    
    const text = encodeURIComponent(generateListText());
    const url = `https://wa.me/${config.user.shopkeeperMobile}?text=${text}`;
    window.open(url, '_blank');
    showToast('Opening WhatsApp...', 'info');
  };

  const handleBackToList = () => {
    setShowPreview(false);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-white">Loading grocery items...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Configuration Error</h4>
          <p>Unable to load grocery configuration. Please check if the config file exists at /config/groceryConfig.json</p>
        </div>
      </div>
    );
  }

  if (showPreview) {
    const selectedItems = getSelectedItems();
    return (
      <div className="container py-4" style={{ maxWidth: '800px' }}>
        <div className="card shadow-lg">
          <div className="card-header bg-success text-white">
            <h4 className="mb-0 d-flex align-items-center">
              <CheckCircle size={24} className="me-2" />
              Grocery List Preview
            </h4>
          </div>
          <div className="card-body">
            <div className="bg-light p-4 rounded mb-4 border border-primary">
              <div className="row">
                <div className="col-12 mb-2">
                  <span className="text-muted">📅</span> <strong>Date:</strong> <span className="text-primary">{formatDate()}</span>
                </div>
                <div className="col-12 mb-2">
                  <span className="text-muted">👤</span> <strong>Name:</strong> <span className="text-primary">{config.user.name}</span>
                </div>
                <div className="col-12">
                  <span className="text-muted">📱</span> <strong>Contact:</strong> <span className="text-primary">{config.user.mobile}</span>
                </div>
              </div>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 text-success">🛒 Selected Items</h5>
              <span className="badge bg-success fs-6">{selectedItems.length} items</span>
            </div>
            
            <div className="list-group mb-4">
              {selectedItems.map((item, index) => (
                <div key={item.id} className="list-group-item list-group-item-action">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-primary rounded-circle me-3" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{index + 1}</span>
                    <span className="fs-5">{formatItemDisplay(item)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-grid gap-2">
              <button 
                className="btn btn-outline-primary btn-lg"
                onClick={handleCopyToClipboard}
              >
                <Copy size={20} className="me-2" />
                Copy to Clipboard
              </button>
              
              <button 
                className="btn btn-outline-success btn-lg"
                onClick={handleDownload}
              >
                <Download size={20} className="me-2" />
                Download List
              </button>
              
              <button 
                className="btn btn-success btn-lg"
                onClick={handleSendWhatsApp}
              >
                <Send size={20} className="me-2" />
                Send via WhatsApp
              </button>

              <button 
                className="btn btn-secondary btn-lg"
                onClick={handleBackToList}
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: '1200px' }}>
      {toast.show && (
        <div 
          className={`alert alert-${toast.type === 'success' ? 'success' : toast.type === 'warning' ? 'warning' : toast.type === 'error' ? 'danger' : 'info'} position-fixed top-0 start-50 translate-middle-x mt-3`}
          style={{ zIndex: 9999, minWidth: '300px' }}
        >
          {toast.message}
        </div>
      )}

      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0 d-flex align-items-center">
            <ShoppingCart size={28} className="me-2" />
            Home Grocery List Maker
          </h3>
        </div>
        
        <div className="card-body">
          <div className="alert alert-info mb-4">
            <strong>Selected Items:</strong> <span className="badge bg-primary fs-6">{getSelectedCount()}</span>
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
                        onChange={() => handleCheckboxChange(item.id)}
                      />
                    </td>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>
                      <select
                        className="form-select"
                        value={item.unit}
                        onChange={(e) => handleUnitChange(item.id, e.target.value)}
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
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
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
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
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
              onClick={handleSubmit}
            >
              Submit & Preview List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryListApp;