import { Navigate, Route, Routes } from 'react-router'
import { CadastroPage } from '../components/pages/CadastroPage'
import { FeedPage } from '../components/pages/FeedPage'
import { LoginPage } from '../components/pages/LoginPage'
import { ProtectedPlaceholderPage } from '../components/pages/ProtectedPlaceholderPage'
import { PostDetailsPage } from '../components/pages/PostDetailsPage'
import { PublishPage } from '../components/pages/PublishPage'
import { AuthProvider } from '../services/auth/AuthProvider'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return <AuthProvider><Routes>
    <Route element={<Navigate replace to="/feed" />} path="/" />
    <Route element={<FeedPage />} path="/feed" />
    <Route element={<PostDetailsPage />} path="/posts/:id" />
    <Route element={<CadastroPage />} path="/cadastro" />
    <Route element={<LoginPage />} path="/login" />
    <Route element={<ProtectedRoute><ProtectedPlaceholderPage title="Perfil" /></ProtectedRoute>} path="/perfil" />
    <Route element={<ProtectedRoute><PublishPage /></ProtectedRoute>} path="/publicar" />
  </Routes></AuthProvider>
}
