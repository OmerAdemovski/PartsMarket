import { Link, NavLink } from 'react-router-dom'

function Header({ currentUser, onLogout }) {
  return (
    <nav className="navbar">
      <Link className="brand" to="/">Parts<span>Market</span></Link>
      <div className="nav-links">
        <NavLink className="browse-link" to="/parts">Browse Parts</NavLink>
        <NavLink className="browse-link" to="/companies">Companies</NavLink>
        {currentUser ? (
          <>
            <Link className="primary-button" to="/parts/new">Sell a Part</Link>
            <Link to="/my-parts">My Listings</Link>
            {currentUser.accountType === 'company' && <Link to="/company-profile">Company Profile</Link>}
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
