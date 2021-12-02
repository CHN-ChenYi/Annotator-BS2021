import { Navigate, useRoutes } from 'react-router-dom';
// utils
import { useUtils } from './utils/utils';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardApp from './pages/DashboardApp';
import Gallery from './pages/Gallery';
import Task from './pages/Task';
import TaskEdit from './pages/TaskEdit';
import NotFound from './pages/Page404';

// ----------------------------------------------------------------------

export default function Router() {
  const utils = useUtils();

  return useRoutes([
    {
      path: '/dashboard',
      element: utils.user ? <DashboardLayout /> : <Navigate to="/login" />,
      children: [
        { element: <Navigate to="/dashboard/app" replace /> },
        { path: 'app', element: <DashboardApp /> },
        { path: 'gallery', element: <Gallery /> },
        { path: 'owned', element: <Task taskType={0} /> },
        { path: 'claimed', element: <Task taskType={1} /> },
        { path: 'free', element: <Task taskType={2} /> },
        { path: 'task/:taskId', element: <TaskEdit /> }
      ]
    },
    {
      path: '/',
      element: !utils.user ? <LogoOnlyLayout /> : <Navigate to="/dashboard" />,
      children: [
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: '404', element: <NotFound /> },
        { path: '/', element: <Navigate to="/dashboard" /> },
        { path: '*', element: <Navigate to="/404" /> }
      ]
    },
    { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}
