import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Placeholder } from '@/components/common/Placeholder';
import { isAuthenticated } from '@/lib/auth';

import Login from '@/pages/Login';
import Overview from '@/pages/Overview';
import Devices from '@/pages/Devices';
import DeviceDetail from '@/pages/DeviceDetail';
import DeviceGroups from '@/pages/DeviceGroups';
import Skus from '@/pages/Skus';
import Merchants from '@/pages/Merchants';
import MerchantDetail from '@/pages/MerchantDetail';
import Alerts from '@/pages/Alerts';
import Tickets from '@/pages/Tickets';
import TicketDetail from '@/pages/TicketDetail';
import Campaigns from '@/pages/Campaigns';
import ContentLibrary from '@/pages/ContentLibrary';
import Approvals from '@/pages/Approvals';
import CampaignCalendar from '@/pages/CampaignCalendar';
import Ota from '@/pages/Ota';
import OtaDetail from '@/pages/OtaDetail';
import Inventory from '@/pages/Inventory';
import Dispatch from '@/pages/Dispatch';
import Rma from '@/pages/Rma';
import Reports from '@/pages/Reports';
import Users from '@/pages/Users';
import AuditLog from '@/pages/AuditLog';
import SystemHealth from '@/pages/SystemHealth';
import Settings from '@/pages/Settings';
import Integrations from '@/pages/Integrations';
import Analytics from '@/pages/Analytics';
import Assistant from '@/pages/Assistant';

function RequireAuth({ children }: { children: ReactElement }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Overview /> },
      { path: 'devices', element: <Devices /> },
      { path: 'devices/:id', element: <DeviceDetail /> },
      { path: 'groups', element: <DeviceGroups /> },
      { path: 'skus', element: <Skus /> },
      { path: 'merchants', element: <Merchants /> },
      { path: 'merchants/:id', element: <MerchantDetail /> },
      { path: 'alerts', element: <Alerts /> },
      { path: 'tickets', element: <Tickets /> },
      { path: 'tickets/:id', element: <TicketDetail /> },
      { path: 'campaigns', element: <Campaigns /> },
      { path: 'content', element: <ContentLibrary /> },
      { path: 'approvals', element: <Approvals /> },
      { path: 'calendar', element: <CampaignCalendar /> },
      { path: 'ota', element: <Ota /> },
      { path: 'ota/:id', element: <OtaDetail /> },
      { path: 'inventory', element: <Inventory /> },
      { path: 'dispatch', element: <Dispatch /> },
      { path: 'rma', element: <Rma /> },
      { path: 'reports', element: <Reports /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'users', element: <Users /> },
      { path: 'audit', element: <AuditLog /> },
      { path: 'integrations', element: <Integrations /> },
      { path: 'settings', element: <Settings /> },
      { path: 'system', element: <SystemHealth /> },
      { path: 'assistant', element: <Assistant /> },
      { path: '*', element: <Placeholder title="Not found" subtitle="The page you are looking for does not exist." /> },
    ],
  },
], {
  // Opt in to React Router v7 data-router behavior early — silences the
  // future-flag warnings. (v7_startTransition is set on <RouterProvider>.)
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});
