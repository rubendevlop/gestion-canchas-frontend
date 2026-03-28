import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const Login = lazy(() => import('./pages/Login'));

const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Courts = lazy(() => import('./pages/Courts'));
const Reservations = lazy(() => import('./pages/Reservations'));
const OwnerBilling = lazy(() => import('./pages/OwnerBilling'));
const OwnerBillingPaymentResult = lazy(() => import('./pages/OwnerBillingPaymentResult'));
const OwnerCollections = lazy(() => import('./pages/OwnerCollections'));
const OwnerCustomers = lazy(() => import('./pages/OwnerCustomers'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminComplexes = lazy(() => import('./pages/AdminComplexes'));
const AdminPayments = lazy(() => import('./pages/AdminPayments'));
const Settings = lazy(() => import('./pages/Settings'));

const PortalLayout = lazy(() => import('./layouts/PortalLayout'));
const PortalHome = lazy(() => import('./pages/portal/PortalHome'));
const ComplexDetail = lazy(() => import('./pages/portal/ComplexDetail'));
const BookCourt = lazy(() => import('./pages/portal/BookCourt'));
const ComplexStore = lazy(() => import('./pages/portal/ComplexStore'));
const Cart = lazy(() => import('./pages/portal/Cart'));
const MyReservations = lazy(() => import('./pages/portal/MyReservations'));
const MyOrders = lazy(() => import('./pages/portal/MyOrders'));
const PortalPaymentResult = lazy(() => import('./pages/portal/PortalPaymentResult'));
const PortalProfile = lazy(() => import('./pages/portal/PortalProfile'));

function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-4 rounded-[1.75rem] border border-outline_variant/20 bg-white px-8 py-10 shadow-[0_28px_60px_-36px_rgba(24,36,24,0.22)]">
        <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-sm text-on_surface_variant">Cargando pantalla...</p>
      </div>
    </div>
  );
}

function LoginGuard({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (user && role) {
    if (role === 'client') return <Navigate to="/portal" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function RoleRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-primary">Cargando...</div>;
  if (!user || !role) return <Navigate to="/login" replace />;
  if (role === 'client') return <Navigate to="/portal" replace />;
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route
          path="/login"
          element={
            <LoginGuard>
              <Login />
            </LoginGuard>
          }
        />

        <Route path="/" element={<RoleRedirect />} />

        <Route
          path="/dashboard/billing/resultado"
          element={
            <ProtectedRoute allowedRoles={['owner']} skipOwnerBillingCheck>
              <OwnerBillingPaymentResult />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['owner', 'superadmin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route
            path="courts"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <Courts />
              </ProtectedRoute>
            }
          />
          <Route
            path="reservations"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <Reservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="products"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="collections"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerCollections />
              </ProtectedRoute>
            }
          />
          <Route
            path="billing"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerBilling />
              </ProtectedRoute>
            }
          />
          <Route
            path="customers"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <OwnerCustomers />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="complexes"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <AdminComplexes />
              </ProtectedRoute>
            }
          />
          <Route
            path="payments"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <AdminPayments />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/portal"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <PortalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PortalHome />} />
          <Route path="complejo/:complexId" element={<ComplexDetail />} />
          <Route path="complejo/:complexId/reservar" element={<BookCourt />} />
          <Route path="complejo/:complexId/tienda" element={<ComplexStore />} />
          <Route path="complejo/:complexId/tienda/carrito" element={<Cart />} />
          <Route path="pago/mercadopago" element={<PortalPaymentResult />} />
          <Route path="mis-reservas" element={<MyReservations />} />
          <Route path="mis-compras" element={<MyOrders />} />
          <Route path="perfil" element={<PortalProfile />} />
        </Route>

        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
