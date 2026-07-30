import { Navigate, Route, Routes } from 'react-router'
import { CadastroPage } from '../components/pages/CadastroPage'
import { LoginPage } from '../components/pages/LoginPage'
import { FeedPage } from '../components/pages/FeedPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Navigate replace to="/feed" />} path="/" />
      <Route element={<FeedPage />} path="/feed" />
      <Route element={<CadastroPage />} path="/cadastro" />
      <Route element={<LoginPage />} path="/login" />
    </Routes>
  )
}
