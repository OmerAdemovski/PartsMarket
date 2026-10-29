import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import Header from './components/Header.jsx'
import Account from './pages/Account.jsx'
import Companies from './pages/Companies.jsx'
import CompanyDetails from './pages/CompanyDetails.jsx'
import CompanyProfile from './pages/CompanyProfile.jsx'
import BrowseParts from './pages/BrowseParts.jsx'
import EditPart from './pages/EditPart.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import MyParts from './pages/MyParts.jsx'
import PartDetails from './pages/PartDetails.jsx'
import Register from './pages/Register.jsx'
import SellPart from './pages/SellPart.jsx'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

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

  const handleAuthExpired = useCallback(() => {
    setCurrentUser(null)
    navigate('/login', {
      replace: true,
      state: {
        from: `${location.pathname}${location.search}`,
        message: 'Your session expired. Please log in again.',
      },
    })
  }, [location.pathname, location.search, navigate])

  if (authLoading) return <main className="page-shell loading-page">Checking your account...</main>

  function protectedPage(page) {
    return currentUser ? page : <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  function companyPage(page) {
    return currentUser?.accountType === 'company' ? page : <Navigate to="/account" replace />
  }

  return <div className="page-shell"><Header currentUser={currentUser} onLogout={handleLogout} /><Routes>
    <Route path="/" element={<Home />} /><Route path="/parts" element={<BrowseParts />} /><Route path="/parts/:id" element={<PartDetails currentUser={currentUser} />} /><Route path="/companies" element={<Companies />} /><Route path="/companies/:id" element={<CompanyDetails />} />
    <Route path="/register" element={<Register onRegister={setCurrentUser} />} /><Route path="/login" element={<Login onLogin={setCurrentUser} />} />
    <Route path="/account" element={<Account currentUser={currentUser} />} />
    <Route path="/company-profile" element={protectedPage(companyPage(<CompanyProfile onAuthExpired={handleAuthExpired} />))} />
    <Route path="/parts/new" element={protectedPage(<SellPart onAuthExpired={handleAuthExpired} />)} /><Route path="/my-parts" element={protectedPage(<MyParts currentUser={currentUser} onAuthExpired={handleAuthExpired} />)} />
    <Route path="/parts/:id/edit" element={protectedPage(<EditPart currentUser={currentUser} onAuthExpired={handleAuthExpired} />)} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></div>
}

export default App
