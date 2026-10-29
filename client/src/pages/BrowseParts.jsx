import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PartCard from '../components/PartCard.jsx'
import { BRANDS, CATEGORIES, CONDITIONS, QUALITIES, SELLER_TYPES, YEARS } from '../utils/catalogue.js'

const filterNames = ['search', 'brand', 'model', 'category', 'subcategory', 'minYear', 'maxYear', 'minPrice', 'maxPrice', 'condition', 'quality', 'city', 'sellerType', 'sort']

function getFilters(params) {
  return Object.fromEntries(filterNames.map((name) => [name, params.get(name) || (name === 'sort' ? 'newest' : '')]))
}

function BrowseParts() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState(() => getFilters(searchParams))
  const [parts, setParts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadParts() {
      setFilters(getFilters(searchParams))
      setLoading(true); setError('')
      try {
        const response = await fetch(`http://localhost:5000/api/parts?${searchParams.toString()}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to load parts.')
        setParts(data.parts || [])
        setTotal(data.total ?? data.parts?.length ?? 0)
      } catch (requestError) { setError(requestError.message || 'Unable to load parts right now.')
      } finally { setLoading(false) }
    }
    loadParts()
  }, [searchParams])

  function updateFilter(event) { setFilters((current) => ({ ...current, [event.target.name]: event.target.value })) }

  function applyFilters(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    filterNames.forEach((name) => { if (filters[name] && (name !== 'sort' || filters[name] !== 'newest')) params.set(name, filters[name]) })
    setSearchParams(params)
  }

  function clearFilters() { setSearchParams({}) }

  return <main className="listing-page"><div className="listing-heading"><div><p className="eyebrow">PARTSMARKET LISTINGS</p><h1>Browse used parts.</h1><p className="form-intro">Find a practical second life for the parts you need.</p></div></div>
    <form className="catalogue-filters" onSubmit={applyFilters}><div className="filter-main-search"><label htmlFor="parts-search">Search listings</label><input id="parts-search" name="search" type="search" placeholder="Search title, brand, model, part number..." value={filters.search} onChange={updateFilter} /></div><div className="filter-grid">
      <label>Brand<select name="brand" value={filters.brand} onChange={updateFilter}><option value="">All brands</option>{BRANDS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Model<input name="model" value={filters.model} onChange={updateFilter} /></label>
      <label>Category<select name="category" value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value, subcategory: '' }))}><option value="">All categories</option>{Object.keys(CATEGORIES).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Subcategory<select name="subcategory" value={filters.subcategory} onChange={updateFilter} disabled={!filters.category}><option value="">All subcategories</option>{(CATEGORIES[filters.category] || []).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Year from<select name="minYear" value={filters.minYear} onChange={updateFilter}><option value="">Any year</option>{YEARS.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
      <label>Year to<select name="maxYear" value={filters.maxYear} onChange={updateFilter}><option value="">Any year</option>{YEARS.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
      <label>Minimum price<input name="minPrice" type="number" min="0" step="0.01" value={filters.minPrice} onChange={updateFilter} /></label>
      <label>Maximum price<input name="maxPrice" type="number" min="0" step="0.01" value={filters.maxPrice} onChange={updateFilter} /></label>
      <label>Condition<select name="condition" value={filters.condition} onChange={updateFilter}><option value="">All conditions</option>{CONDITIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Quality<select name="quality" value={filters.quality} onChange={updateFilter}><option value="">All qualities</option>{QUALITIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>City<input name="city" value={filters.city} onChange={updateFilter} /></label>
      <label>Seller type<select name="sellerType" value={filters.sellerType} onChange={updateFilter}><option value="">All sellers</option>{Object.entries(SELLER_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Sort<select name="sort" value={filters.sort} onChange={updateFilter}><option value="newest">Newest</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
    </div><div className="filter-actions"><button className="primary-button" type="submit">Apply filters</button><button className="outline-button" type="button" onClick={clearFilters}>Clear filters</button></div></form>
    {loading && <p className="status-message">Loading parts...</p>}{!loading && error && <p className="message error-message" role="alert">{error}</p>}{!loading && !error && total === 0 && <p className="status-message">No parts match these filters.</p>}{!loading && !error && parts.length > 0 && <><p className="success-note">Showing {parts.length} of {total} part{total === 1 ? '' : 's'}.</p><div className="parts-grid">{parts.map((part) => <PartCard key={part._id} part={part} />)}</div></>}
  </main>
}

export default BrowseParts
