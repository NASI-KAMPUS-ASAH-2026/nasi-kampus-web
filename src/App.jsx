import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/ui/Toast';
import CustomerLayout from './layouts/CustomerLayout';
import OwnerLayout from './layouts/OwnerLayout';
import KitchenLayout from './layouts/KitchenLayout';
import AdminLayout from './layouts/AdminLayout';
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
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import OwnerIngredients from './pages/owner/OwnerIngredients';
import OwnerPurchases from './pages/owner/OwnerPurchases';
import KitchenStock from './pages/kitchen/KitchenStock';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPayments from './pages/admin/AdminPayments';
import AdminCustomers from './pages/admin/AdminCustomers';

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

              {/* Halaman Login Internal (Admin, Pemilik, Tim Dapur) */}
              <Route path="login" element={<OwnerLogin defaultRole="admin" />} />
              <Route path="admin/login" element={<OwnerLogin defaultRole="admin" />} />
              <Route path="owner/login" element={<OwnerLogin defaultRole="owner" />} />
              <Route path="dapur/login" element={<OwnerLogin defaultRole="kitchen" />} />

              {/* Halaman Admin */}
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="orders" replace />} />
                <Route path="dashboard" element={<Navigate to="/admin/orders" replace />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="*" element={<Navigate to="/admin/orders" replace />} />
              </Route>

              {/* Halaman Pemilik */}
              <Route path="owner" element={<OwnerLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<OwnerDashboard />} />
                <Route path="orders" element={<OwnerOrders />} />
                <Route path="orders/:id" element={<OwnerOrderDetail />} />
                <Route path="ingredients" element={<OwnerIngredients />} />
                <Route path="purchases" element={<OwnerPurchases />} />
                <Route path="reports" element={<OwnerReports />} />
                <Route path="*" element={<Navigate to="/owner/dashboard" replace />} />
              </Route>

              {/* Halaman Tim Dapur */}
              <Route path="dapur" element={<KitchenLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<KitchenDashboard />} />
                <Route path="stock" element={<KitchenStock defaultTab="stock" />} />
                <Route path="purchases" element={<KitchenStock defaultTab="purchases" />} />
                <Route path="*" element={<Navigate to="/dapur/dashboard" replace />} />
              </Route>
              <Route path="kitchen/*" element={<Navigate to="/dapur/dashboard" replace />} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
