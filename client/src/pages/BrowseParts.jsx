import { useEffect, useState } from 'react'
import PartCard from '../components/PartCard.jsx'

function BrowseParts() {
  const [parts, setParts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadParts() {
      try {
        const response = await fetch('http://localhost:5000/api/parts')
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load parts.')
        setParts(data.parts || [])
      } catch (requestError) {
        setError(requestError.message || 'Unable to load parts right now.')
      } finally {
        setLoading(false)
      }
    }
    loadParts()
  }, [])

  const categories = [...new Set(parts.map((part) => part.category).filter(Boolean))]
  const search = searchTerm.trim().toLowerCase()
  const filteredParts = parts.filter((part) => {
    const matchesSearch = !search || [part.title, part.carBrand, part.carModel].some((value) => value?.toLowerCase().includes(search))
    const matchesCategory = category === 'all' || part.category === category
    return matchesSearch && matchesCategory
  })

  return <main className="listing-page"><div className="listing-heading"><div><p className="eyebrow">PARTSMARKET LISTINGS</p><h1>Browse used parts.</h1><p className="form-intro">Find a practical second life for the parts you need.</p></div></div>
    <div className="listing-filters"><input type="search" placeholder="Search title, brand, or model" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} aria-label="Search listings" /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
    {loading && <p className="status-message">Loading parts...</p>}
    {!loading && error && <p className="message error-message" role="alert">{error}</p>}
    {!loading && !error && parts.length === 0 && <p className="status-message">No parts have been listed yet.</p>}
    {!loading && !error && parts.length > 0 && filteredParts.length === 0 && <p className="status-message">No parts match your search.</p>}
    {!loading && !error && filteredParts.length > 0 && <><p className="success-note">Showing {filteredParts.length} part{filteredParts.length === 1 ? '' : 's'}.</p><div className="parts-grid">{filteredParts.map((part) => <PartCard key={part._id} part={part} />)}</div></>}
  </main>
}

export default BrowseParts
