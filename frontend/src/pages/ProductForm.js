import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../utils/api';

const ProductForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'food',
    description: '',
    manufacturer: ''
  });

  const categories = [
    { value: 'food', label: 'Food & Beverages' },
    { value: 'cosmetics', label: 'Cosmetics & Beauty' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing & Apparel' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.category) {
      setError('Name and category are required');
      return;
    }

    try {
      setLoading(true);
      const response = await createProduct(formData);
      
      if (response.data.success) {
        // Navigate to questionnaire with the product ID
        navigate(`/questionnaire/${response.data.productId}`);
      } else {
        setError(response.data.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setError(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-page">
      <div className="container">
        <div className="form-header">
          <h1>Create New Product</h1>
          <p>Enter your product information to begin the transparency assessment</p>
        </div>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Product Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your product (optional but recommended)"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="manufacturer">Manufacturer/Brand</label>
            <input
              type="text"
              id="manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleInputChange}
              placeholder="Company or brand name"
            />
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner small"></span>
                  Creating...
                </>
              ) : (
                'Create Product & Start Questions'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;