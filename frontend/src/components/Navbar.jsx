import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { useCart } from '../context/CartContext';
import './Navbar.css';

function Navbar() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, [location]);

  function handleLogout() {
    authService.logout();
    setUser(null);
    navigate('/login');
  }

  return (
    <header className="fh-navbar">
      <div className="fh-navbar-container">
        <Link to="/products" className="fh-brand">
          <span className="fh-brand-icon">🌱</span>
          <span className="fh-brand-name">FreshHarvest</span>
          <span className="fh-badge">Farm Direct</span>
        </Link>

        <nav className="fh-nav-links">
          <Link
            to="/products"
            className={`fh-link ${location.pathname === '/products' || location.pathname === '/' ? 'active' : ''}`}
          >
            🌾 Browse Products
          </Link>

          <Link
            to="/cart"
            className={`fh-link fh-cart-link ${location.pathname === '/cart' ? 'active' : ''}`}
          >
            🛒 Review Cart
            <span className="fh-cart-count">{cartCount}</span>
          </Link>

          <Link
            to="/orders"
            className={`fh-link ${location.pathname === '/orders' ? 'active' : ''}`}
          >
            📦 Orders & Delivery
          </Link>

          <Link
            to="/payments"
            className={`fh-link ${location.pathname === '/payments' ? 'active' : ''}`}
          >
            💳 Payment History
          </Link>

          {user && (
            <Link
              to="/profile"
              className={`fh-link ${location.pathname === '/profile' ? 'active' : ''}`}
            >
              👤 My Profile
            </Link>
          )}
        </nav>

        <div className="fh-nav-actions">
          {user ? (
            <div className="fh-user-menu">
              <span className="fh-user-pill">
                <span className="fh-avatar">{user.name ? user.name[0].toUpperCase() : 'U'}</span>
                <span className="fh-user-name">{user.name}</span>
                <span className="fh-role-tag">{user.role || 'Customer'}</span>
              </span>
              <button onClick={handleLogout} className="fh-btn-logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="fh-auth-buttons">
              <Link to="/login" className="fh-btn-secondary">
                Login
              </Link>
              <Link to="/register" className="fh-btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
