import { useState, useEffect } from 'react';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import './Products.css';

function Products() {
  const { addToCart, cartItems } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    'All',
    'Vegetables',
    'Fruits',
    'Grains & Pulses',
    'Dairy & Organic',
    'Herbs & Spices'
  ]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, page]);

  async function fetchProducts(overrideSearch) {
    setLoading(true);
    setError('');
    try {
      const search = overrideSearch !== undefined ? overrideSearch : searchQuery;
      const data = await productService.getProducts({
        search,
        category: selectedCategory,
        sortBy,
        page,
        limit: 6
      });
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      }
    } catch (err) {
      setError(err.message || 'Failed to load products. Ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  }

  function handleCategoryClick(cat) {
    setSelectedCategory(cat);
    setPage(1);
  }

  function handleClearFilters() {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('newest');
    setPage(1);
    fetchProducts('');
  }

  return (
    <div className="products-page">
      {/* Hero Banner */}
      <section className="products-hero">
        <div className="hero-content">
          <span className="hero-tag">🌱 100% Farm Fresh & Organic</span>
          <h1>Fresh Harvest Directly From Local Farmers</h1>
          <p>
            Skip the middlemen. Support local farming communities across Tamil Nadu and receive
            harvest-day fresh produce delivered to your doorstep.
          </p>

          {/* Search bar inside hero */}
          <form onSubmit={handleSearchSubmit} className="hero-search-form">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by vegetable, fruit, grain, or farmer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearchQuery('');
                  fetchProducts('');
                }}
              >
                ✕
              </button>
            )}
          </form>
        </div>
      </section>

      <div className="products-container">
        {/* Category Filter Bar */}
        <div className="filter-controls-row">
          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat === 'All' && '🧺 '}
                {cat === 'Vegetables' && '🥬 '}
                {cat === 'Fruits' && '🍎 '}
                {cat === 'Grains & Pulses' && '🌾 '}
                {cat === 'Dairy & Organic' && '🥛 '}
                {cat === 'Herbs & Spices' && '🌿 '}
                {cat}
              </button>
            ))}
          </div>

          <div className="sort-box">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Results summary */}
        <div className="results-summary">
          <span>
            Showing <strong>{products.length}</strong> of <strong>{total}</strong> products
            {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>

          {(selectedCategory !== 'All' || searchQuery) && (
            <button onClick={handleClearFilters} className="clear-all-link">
              Clear all filters
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Product Cards Grid */}
        {loading ? (
          <div className="products-loading">
            <div className="spinner"></div>
            <p>Fetching farm-fresh produce...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-products-box">
            <span className="empty-icon">🌾</span>
            <h3>No fresh produce found</h3>
            <p>We couldn't find any products matching your current search or category filter.</p>
            <button onClick={handleClearFilters} className="fh-btn-primary">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((item) => (
              <article key={item._id} className="product-card">
                <div className="card-image-wrapper">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    className="product-img"
                    loading="lazy"
                  />
                  <div className="card-badges">
                    <span className="category-tag">{item.category}</span>
                    {item.isOrganic && <span className="organic-tag">🌱 Organic</span>}
                  </div>
                </div>

                <div className="card-body">
                  <div className="card-rating">
                    <span className="star">★</span>
                    <span className="rating-score">{item.rating || 4.8}</span>
                    <span className="stock-status">
                      {item.stock > 0 ? `In Stock (${item.stock} ${item.unit})` : 'Out of Stock'}
                    </span>
                  </div>

                  <h3 className="product-name">{item.name}</h3>
                  <p className="product-desc">{item.description}</p>

                  <div className="farmer-info">
                    <span className="farmer-icon">👨‍🌾</span>
                    <div className="farmer-text">
                      <span className="farmer-name">{item.farmerName}</span>
                      <span className="farm-location">{item.farmLocation}</span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="price-tag">
                      <span className="currency">₹</span>
                      <span className="amount">{item.price}</span>
                      <span className="per-unit">/{item.unit}</span>
                    </div>

                    {(() => {
                      const inCart = cartItems.find((c) => (c._id || c.id) === item._id);
                      return (
                        <button
                          className={`add-to-cart-btn ${inCart ? 'in-cart' : ''}`}
                          onClick={() => addToCart(item, 1)}
                          title={inCart ? `Currently ${inCart.quantity} in cart. Click to add more.` : 'Add to cart'}
                        >
                          {inCart ? `✓ In Cart (${inCart.quantity}) +` : '+ Add to Cart'}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="page-btn prev-next"
            >
              ← Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`page-btn ${page === p ? 'active' : ''}`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="page-btn prev-next"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
