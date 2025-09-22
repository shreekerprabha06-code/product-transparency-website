import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProducts } from '../utils/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecentProducts();
  }, []);

  const loadRecentProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts();
      if (response.data.success) {
        // Show last 3 products
        setRecentProducts(response.data.products.slice(-3).reverse());
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Product Transparency Platform</h1>
          <p className="hero-subtitle">
            Evaluate and improve your product's transparency score through AI-powered questionnaires
          </p>
          <div className="hero-buttons">
            <button 
              className="btn btn-primary btn-large"
              onClick={() => navigate('/create')}
            >
              Start Product Analysis
            </button>
            <button 
              className="btn btn-secondary btn-large"
              onClick={() => document.getElementById('features').scrollIntoView()}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      <div id="features" className="features-section">
        <div className="container">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Create Product Profile</h3>
              <p>Enter basic information about your product including name, category, and description</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Generated Questions</h3>
              <p>Our AI generates relevant transparency questions based on your product category</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Transparency Score</h3>
              <p>Get a detailed score based on your answers and industry standards</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>Detailed Report</h3>
              <p>Generate comprehensive transparency reports for stakeholders</p>
            </div>
          </div>
        </div>
      </div>

      {recentProducts.length > 0 && (
        <div className="recent-products-section">
          <div className="container">
            <h2>Recent Products</h2>
            <div className="products-grid">
              {recentProducts.map(product => (
                <div key={product._id} className="product-card">
                  <h3>{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  <p className="product-description">
                    {product.description || 'No description provided'}
                  </p>
                  <div className="product-actions">
                    <button 
                      className="btn btn-primary btn-small"
                      onClick={() => navigate(`/questionnaire/${product._id}`)}
                    >
                      Continue Questions
                    </button>
                    <button 
                      className="btn btn-secondary btn-small"
                      onClick={() => navigate(`/results/${product._id}`)}
                    >
                      View Results
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
