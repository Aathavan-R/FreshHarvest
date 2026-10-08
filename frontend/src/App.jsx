import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentConfirmation from './pages/PaymentConfirmation';
import Orders from './pages/Orders';
import PaymentHistory from './pages/PaymentHistory';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-confirmation/:transactionId" element={<PaymentConfirmation />} />
            <Route path="/order-confirmation/:transactionId" element={<PaymentConfirmation />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/payments" element={<PaymentHistory />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>
        </main>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;