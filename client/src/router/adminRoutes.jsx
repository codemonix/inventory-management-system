
import { Lazy } from 'react';
import { Route } from 'react-router-dom';

const ManageConsole = Lazy(() => import('../pages/admin/ManagePage.jsx'));
const UsersPage = Lazy(() => import('../pages/admin/UsersPage.jsx'));
const LogsPage = Lazy(() => import('../pages/admin/LogsPage.jsx'));
const SettingsPage = Lazy(() => import('../pages/admin/SettingsPage.jsx'));

export const consoleRoutes = (
    <Route path='admin' element={<ManageConsole />} >
        <Route index element={<UsersPage />} />
        <Route path='users' element={<UsersPage />} />
        <Route path='logs' element={<LogsPage />} />
        <Route path='settings' element={<SettingsPage />} />
    </Route>
);

