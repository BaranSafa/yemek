import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import NotFoundPage from './pages/NotFoundPage';

// Employee pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import ProductManagePage from './pages/employee/ProductManagePage';
import DeliverOrderPage from './pages/employee/DeliverOrderPage';
import EmployeeOrdersPage from './pages/employee/EmployeeOrdersPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminMenuPage from './pages/admin/AdminMenuPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';

// Customer pages
import ProfilePage from './pages/ProfilePage';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Customer */}
          <Route path="/cart" element={<ProtectedRoute roles={['customer']}><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute roles={['customer']}><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<ProtectedRoute roles={['customer']}><ProfilePage /></ProtectedRoute>} />

          {/* Employee */}
          <Route path="/employee" element={<ProtectedRoute roles={['employee', 'admin']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/employee/products" element={<ProtectedRoute roles={['employee', 'admin']}><ProductManagePage /></ProtectedRoute>} />
          <Route path="/employee/deliver" element={<ProtectedRoute roles={['employee', 'admin']}><DeliverOrderPage /></ProtectedRoute>} />
          <Route path="/employee/orders" element={<ProtectedRoute roles={['employee', 'admin']}><EmployeeOrdersPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute roles={['admin']}><AdminCategoriesPage /></ProtectedRoute>} />
          <Route path="/admin/menu" element={<ProtectedRoute roles={['admin']}><AdminMenuPage /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
