import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Companies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCompanies() {
      try {
        const response = await fetch('http://localhost:5000/api/companies')
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load companies.')
        setCompanies(data.companies)
      } catch (requestError) { setError(requestError.message || 'Unable to load companies right now.')
      } finally { setLoading(false) }
    }
    loadCompanies()
  }, [])

  return <main className="listing-page"><p className="eyebrow">USED-PARTS BUSINESSES</p><div className="listing-heading"><div><h1>Companies</h1><p className="form-intro">Explore used-parts businesses on PartsMarket.</p></div></div>{loading && <p className="status-message">Loading companies...</p>}{error && <p className="message error-message" role="alert">{error}</p>}{!loading && !error && companies.length === 0 && <div className="empty-card"><p>No company profiles have been published yet.</p></div>}<div className="company-grid">{companies.map((company) => <Link className="company-card" to={`/companies/${company._id}`} key={company._id}><div className="company-logo">{company.logoPath ? <img src={`http://localhost:5000${company.logoPath}`} alt="" /> : 'PM'}</div><div><h2>{company.companyName}</h2><p>{company.description}</p><span>{company.address}</span></div></Link>)}</div></main>
}

export default Companies
