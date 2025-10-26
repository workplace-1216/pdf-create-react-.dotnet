import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { ClientReadyDocumentsPage } from './pages/ClientReadyDocumentsPageNew'
import { DocumentsPage } from './pages/DocumentsPage'
import { TemplatesPage } from './pages/TemplatesPage'
import { Layout } from './components/Layout'
import { ClientLayout } from './components/ClientLayout'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Layout>
                <AdminDashboardPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/client" element={
            <ProtectedRoute>
              <ClientLayout>
                <ClientReadyDocumentsPage />
              </ClientLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/documents" element={
            <ProtectedRoute>
              <Layout>
                <DocumentsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/templates" element={
            <ProtectedRoute>
              <Layout>
                <TemplatesPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/client" replace />} />
          <Route path="*" element={<Navigate to="/client" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App