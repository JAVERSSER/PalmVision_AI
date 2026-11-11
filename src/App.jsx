import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Home from './pages/Home.jsx';

// Heavy pages (camera, CV, admin) are code-split and loaded on demand.
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Scanner = lazy(() => import('./pages/Scanner.jsx'));
const PalmAnalysis = lazy(() => import('./pages/PalmAnalysis.jsx'));
const ReadingResults = lazy(() => import('./pages/ReadingResults.jsx'));
const History = lazy(() => import('./pages/History.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
      </Route>
      <Route element={<MainLayout app />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="scan" element={<Scanner />} />
        <Route path="analysis" element={<PalmAnalysis />} />
        <Route path="results/:scanId" element={<ReadingResults />} />
        <Route path="history" element={<History />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path=":section" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}
