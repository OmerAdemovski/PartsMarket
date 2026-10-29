import { useState } from 'react'
import { Link } from 'react-router-dom'

function Account({ currentUser }) {
  const [showEmail, setShowEmail] = useState(true)

  if (!currentUser) return <main className="account-page"><div className="account-card"><p className="eyebrow">YOUR ACCOUNT</p><h1>You are logged out.</h1><p className="form-intro">Log in to see your account details.</p><Link className="primary-button" to="/login">Log in</Link></div></main>

    return <main className="account-page"><div className="account-card"><p className="eyebrow">YOUR ACCOUNT</p><h1>Hello, {currentUser.name}.</h1><p className="form-intro">Your PartsMarket account is ready for your next repair or listing.</p><div className="account-details"><p><strong>Name</strong><span>{currentUser.name}</span></p><p><strong>Email</strong><span>{showEmail ? currentUser.email : 'Hidden'}</span></p><p><strong>Account type</strong><span>{currentUser.accountType === 'company' ? 'Company' : 'Individual'}</span></p></div><button type="button" className="outline-button" onClick={() => setShowEmail(!showEmail)}>{showEmail ? 'Hide email' : 'Show email'}</button>{currentUser.accountType === 'company' && <p className="account-link"><Link to="/company-profile">Set up or edit your company profile</Link></p>}</div></main>
}

export default Account
