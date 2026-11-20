import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/ui/Toast';
import CustomerLayout from './layouts/CustomerLayout';
import OwnerLayout from './layouts/OwnerLayout';
import Home from './pages/customer/Home';
import Menu from './pages/customer/Menu';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderSuccess from './pages/customer/OrderSuccess';
import OrderTracking from './pages/customer/OrderTracking';
import NotFound from './pages/customer/NotFound';
import OwnerLogin from './pages/owner/OwnerLogin';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerOrders from './pages/owner/OwnerOrders';
import OwnerOrderDetail from './pages/owner/OwnerOrderDetail';
import OwnerReports from './pages/owner/OwnerReports';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              {/* Halaman Pelanggan (tanpa login) */}
              <Route element={<CustomerLayout />}>
                <Route index element={<Home />} />
                <Route path="menu" element={<Menu />} />
                <Route path="menu/:id" element={<ProductDetail />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="order-success/:id" element={<OrderSuccess />} />
                <Route path="lacak-pesanan" element={<OrderTracking />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Halaman Pemilik (Akses login tersembunyi di /login) */}
              <Route path="login" element={<OwnerLogin />} />
              <Route path="owner/login" element={<Navigate to="/login" replace />} />
              <Route path="owner" element={<OwnerLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<OwnerDashboard />} />
                <Route path="orders" element={<OwnerOrders />} />
                <Route path="orders/:id" element={<OwnerOrderDetail />} />
                <Route path="reports" element={<OwnerReports />} />
                <Route path="*" element={<Navigate to="/owner/dashboard" replace />} />
              </Route>
            </Routes>
          </ToastProvider>
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
