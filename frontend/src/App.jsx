import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import WorkerRecognition from './components/WorkerRecognition';
import WorkerPerformance from './components/WorkerPerformance';
import Attendance from './components/Attendance';
import ProductionLine from './components/ProductionLine';
import JobSequencing from './components/JobSequencing';
import Inventory from './components/Inventory';
import QualityControl from './components/QualityControl';
import WasteTracking from './components/WasteTracking';
import MachineMaintenance from './components/MachineMaintenance';
import WorkerReporting from './components/WorkerReporting';
import AIInsights from './components/AIInsights';
import ReportsCompliance from './components/ReportsCompliance';
import Chats from './components/Chats';
import Settings from './components/Settings';

/* Worker Portal Components */
import WorkerDashboard from './components/WorkerDashboard';
import WorkerIncidentReport from './components/WorkerIncidentReport';
import WorkerPayment from './components/WorkerPayment';
import WorkerSettings from './components/WorkerSettings';

import './App.css';

const ROLE_PERMISSIONS = {
  admin: [
    '/dashboard',
    '/rewards',
    '/performance',
    '/attendance',
    '/safety',
    '/ai-insights',
    '/reports',
    '/chats',
  ],
  line_manager: [
    '/dashboard',
    '/rewards',
    '/performance',
    '/attendance',
    '/production',
    '/job-sequencing',
    '/inventory',
    '/quality-control',
    '/waste',
    '/machines',
  ],
  qc_inspector: [
    '/dashboard',
    '/rewards',
    '/performance',
    '/attendance',
    '/production',
    '/job-sequencing',
    '/inventory',
    '/quality-control',
    '/waste',
    '/machines',
  ],
  maintenance_staff: [
    '/dashboard',
    '/rewards',
    '/performance',
    '/attendance',
    '/production',
    '/job-sequencing',
    '/inventory',
    '/quality-control',
    '/waste',
    '/machines',
  ],
  auditor: [
    '/dashboard',
    '/rewards',
    '/performance',
    '/attendance',
    '/production',
    '/job-sequencing',
    '/inventory',
    '/quality-control',
    '/waste',
    '/machines',
  ],
  worker: [
    '/worker-dashboard',
    '/worker-reporting',
    '/worker-payment',
    '/worker-settings',
  ],
};

function App() {
  const isAuthenticated = () => {
    return localStorage.getItem('user') !== null;
  };

  const getUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.role || 'admin';
    } catch (e) {
      return 'admin';
    }
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  const RoleRestrictedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    const role = getUserRole();
    if (allowedRoles.includes(role)) {
      return children;
    }
    // Redirect to the first allowed page for this role
    const allowedPages = ROLE_PERMISSIONS[role] || ['/dashboard'];
    return <Navigate to={allowedPages[0]} />;
  };

  const getHomeRoute = () => {
    const role = getUserRole();
    const allowedPages = ROLE_PERMISSIONS[role] || ['/dashboard'];
    return allowedPages[0];
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Admin-only routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['admin', 'line_manager', 'qc_inspector', 'maintenance_staff', 'auditor']}>
                <Dashboard />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/rewards"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['admin', 'line_manager', 'qc_inspector', 'maintenance_staff', 'auditor']}>
                <WorkerRecognition />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['admin', 'line_manager', 'qc_inspector', 'maintenance_staff', 'auditor']}>
                <WorkerPerformance />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['admin', 'line_manager', 'qc_inspector', 'maintenance_staff', 'auditor']}>
                <Attendance />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />

        {/* Manufacturing routes (NOT for admin) */}
        <Route
          path="/production"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['line_manager', 'qc_inspector', 'maintenance_staff', 'auditor']}>
                <ProductionLine />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-sequencing"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['line_manager', 'qc_inspector', 'maintenance_staff', 'auditor']}>
                <JobSequencing />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['line_manager', 'qc_inspector', 'maintenance_staff', 'auditor']}>
                <Inventory />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quality-control"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['line_manager', 'qc_inspector', 'maintenance_staff', 'auditor']}>
                <QualityControl />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['line_manager', 'qc_inspector', 'maintenance_staff', 'auditor']}>
                <WasteTracking />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/machines"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['line_manager', 'qc_inspector', 'maintenance_staff', 'auditor']}>
                <MachineMaintenance />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/safety"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['admin']}>
                <WorkerReporting />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-insights"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['admin']}>
                <AIInsights />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['admin']}>
                <ReportsCompliance />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['admin']}>
                <Chats />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['admin']}>
                <Settings />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />

        {/* Worker Portal Routes */}
        <Route
          path="/worker-dashboard"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['worker']}>
                <WorkerDashboard />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker-reporting"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['worker']}>
                <WorkerIncidentReport />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker-payment"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['worker']}>
                <WorkerPayment />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker-settings"
          element={
            <ProtectedRoute>
              <RoleRestrictedRoute allowedRoles={['worker']}>
                <WorkerSettings />
              </RoleRestrictedRoute>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={getHomeRoute()} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
