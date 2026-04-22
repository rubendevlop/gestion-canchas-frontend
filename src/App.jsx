import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const OwnerLandingPage = lazy(() => import('./pages/OwnerLandingPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// Dashboard (owner / superadmin)
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const Inventory = lazy(() => import('./pages/Inventory'));
const OwnerOrders = lazy(() => import('./pages/OwnerOrders'));
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

// Portal (client)
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
    <div className="min-h-screen flex items-center justify-center bg-brand_bg px-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-sm text-slate-400">Cargando pantalla...</p>
      </div>
    </div>
  );
}

/** Redirects authenticated users away from the landing / register pages. */
function PublicGuard({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (user && role) {
    if (role === 'client') return <Navigate to="/portal" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

/** Catch-all: authenticated â†’ role home, anonymous â†’ landing. */
function RoleRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background text-primary">
      Cargando...
    </div>
  );
  if (!user || !role) return <Navigate to="/" replace />;
  if (role === 'client') return <Navigate to="/portal" replace />;
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* â”€â”€ Public â”€â”€ */}
        <Route
          path="/"
          element={
            <PublicGuard>
              <LandingPage />
            </PublicGuard>
          }
        />
        <Route
          path="/duenos"
          element={
            <PublicGuard>
              <OwnerLandingPage />
            </PublicGuard>
          }
        />
        <Route
          path="/register"
          element={
            <PublicGuard>
              <RegisterPage />
            </PublicGuard>
          }
        />
        {/* /login legacy redirect */}
        <Route path="/login" element={<Navigate to="/" replace />} />

        {/* â”€â”€ Owner billing result (skip billing check) â”€â”€ */}
        <Route
          path="/dashboard/billing/resultado"
          element={
            <ProtectedRoute allowedRoles={['owner']} skipOwnerBillingCheck>
              <OwnerBillingPaymentResult />
            </ProtectedRoute>
          }
        />

        {/* â”€â”€ Dashboard â”€â”€ */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['owner', 'superadmin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="courts" element={<ProtectedRoute allowedRoles={['owner']}><Courts /></ProtectedRoute>} />
          <Route path="reservations" element={<ProtectedRoute allowedRoles={['owner']}><Reservations /></ProtectedRoute>} />
          <Route path="products" element={<ProtectedRoute allowedRoles={['owner']}><Inventory /></ProtectedRoute>} />
          <Route path="orders" element={<ProtectedRoute allowedRoles={['owner']}><OwnerOrders /></ProtectedRoute>} />
          <Route path="collections" element={<ProtectedRoute allowedRoles={['owner']}><OwnerCollections /></ProtectedRoute>} />
          <Route path="billing" element={<ProtectedRoute allowedRoles={['owner']}><OwnerBilling /></ProtectedRoute>} />
          <Route path="customers" element={<ProtectedRoute allowedRoles={['owner']}><OwnerCustomers /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute allowedRoles={['owner']}><Settings /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="complexes" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminComplexes /></ProtectedRoute>} />
          <Route path="payments" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminPayments /></ProtectedRoute>} />
        </Route>

        {/* â”€â”€ Portal (client) â”€â”€ */}
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

        {/* Catch-all */}
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
