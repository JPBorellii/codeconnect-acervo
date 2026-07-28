import { Navigate, Route, Routes } from 'react-router'
import { CadastroPage } from '../components/pages/CadastroPage'
import { LoginPage } from '../components/pages/LoginPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Navigate replace to="/login" />} path="/" />
      <Route element={<CadastroPage />} path="/cadastro" />
      <Route element={<LoginPage />} path="/login" />
    </Routes>
  )
}
