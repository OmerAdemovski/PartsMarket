import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

function CompanyDetails() {
  const { id } = useParams()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCompany() {
      try {
        const response = await fetch(`http://localhost:5000/api/companies/${id}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load this company.')
        setCompany(data.company)
      } catch (requestError) { setError(requestError.message || 'Unable to load this company right now.')
      } finally { setLoading(false) }
    }
    loadCompany()
  }, [id])

  if (loading) return <main className="details-page"><p className="status-message">Loading company details...</p></main>
  if (error) return <main className="details-page"><p className="message error-message" role="alert">{error}</p><Link to="/companies">Back to companies</Link></main>
  if (!company) return null
  return <main className="details-page"><Link className="back-link" to="/companies">← Back to companies</Link><div className="company-details-card"><div className="company-details-header"><div className="company-logo large-logo">{company.logoPath ? <img src={`http://localhost:5000${company.logoPath}`} alt="" /> : 'PM'}</div><div><p className="eyebrow">COMPANY PROFILE</p><h1>{company.companyName}</h1><p className="form-intro">{company.address}</p></div></div><p className="details-description">{company.description}</p><div className="details-list"><p><strong>Phone</strong><span>{company.phone}</span></p><p><strong>Email</strong><span>{company.email}</span></p>{company.website && <p><strong>Website</strong><span>{company.website}</span></p>}<p><strong>Payment methods</strong><span>{company.paymentMethods.join(', ') || 'Contact company'}</span></p><p><strong>Delivery methods</strong><span>{company.deliveryMethods.join(', ') || 'Contact company'}</span></p><p><strong>Estimated delivery</strong><span>{company.estimatedDeliveryText}</span></p></div></div></main>
}

export default CompanyDetails
