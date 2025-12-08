import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ErrorPage from './error-page';
import { HomePage } from './pages/Home.page';
import { RegisterPage } from './pages/Register.page';
import { LoginPage } from './pages/Login.page';
import { AuthProvider } from './context/AuthContext';
import { CrearGrupoPage } from './pages/CrearGrupo.page';
import { ProfilePage } from './pages/Profile.page';
import { GrupoPage } from './pages/Grupo.page';
import { ProtectedRoute } from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "register",
    element: <RegisterPage />,
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "create",
    element: (
      <ProtectedRoute>
        <CrearGrupoPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ":groupId",
    element: (
      <GrupoPage />
    ),
  },
  {
    path: "profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  }
]);

export default function App() {
  return (
    <AuthProvider>
      <MantineProvider>
        <RouterProvider router={router} />
      </MantineProvider>
    </AuthProvider>
  );
}