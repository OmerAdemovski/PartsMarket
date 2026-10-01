import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './components/Header.jsx'
import Account from './pages/Account.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data.user)
        }
      } catch {
        // Logged out is the safe default if the API is unavailable.
      } finally { setAuthLoading(false) }
    }
    loadCurrentUser()
  }, [])

  async function handleLogout() {
    try { await fetch('http://localhost:5000/api/auth/logout', { method: 'POST', credentials: 'include' })
    } finally { setCurrentUser(null) }
  }

  if (authLoading) return <main className="page-shell loading-page">Checking your account...</main>

  return <div className="page-shell"><Header currentUser={currentUser} onLogout={handleLogout} /><Routes>
    <Route path="/" element={<Home />} /><Route path="/register" element={<Register onRegister={setCurrentUser} />} />
    <Route path="/login" element={<Login onLogin={setCurrentUser} />} /><Route path="/account" element={<Account currentUser={currentUser} />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></div>
}

export default App
