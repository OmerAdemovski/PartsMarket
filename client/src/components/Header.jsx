import { Link, NavLink } from 'react-router-dom'

function Header({ currentUser, onLogout }) {
  return (
    <nav className="navbar">
      <Link className="brand" to="/">Parts<span>Market</span></Link>
      <div className="nav-links">
        <NavLink className="browse-link" to="/#browse">Browse parts</NavLink>
        {currentUser ? (
          <>
            <Link to="/account">Account</Link>
            <button type="button" className="outline-button" onClick={onLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link className="primary-button" to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Header
