import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Navbar from './components/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import AdminPage from './pages/AdminPage.jsx'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
          <Navbar />
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/historico" element={<HistoryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<RegisterPage />} />

            {/* /reportar — requer login (qualquer role) */}
            {/* Usuário não logado é redirecionado para /login */}
            <Route
              path="/reportar"
              element={
                <ProtectedRoute>
                  <ReportPage />
                </ProtectedRoute>
              }
            />

            {/* Painel — apenas bombeiros e admins */}
            <Route
              path="/painel"
              element={
                <ProtectedRoute requireFirefighter>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Admin — apenas admins */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
