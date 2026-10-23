import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  function handleSearch(event) {
    event.preventDefault()
    const search = searchTerm.trim()
    navigate(search ? `/parts?search=${encodeURIComponent(search)}` : '/parts')
  }

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">THE SMARTER WAY TO REPAIR</p>
          <h1>Good parts deserve a second life.</h1>
          <p className="hero-text">
            Find quality used car parts from real people, or turn the parts in
            your garage into someone else&apos;s perfect fix.
          </p>
          <form className="search-box" onSubmit={handleSearch}>
            <input type="search" placeholder="Search for a part, make, or model" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} aria-label="Search for car parts" />
            <button type="submit" className="primary-button">Search</button>
          </form>
        </div>
        <div className="hero-art" aria-label="Illustration of a car part" role="img">
          <span className="art-circle circle-one"></span><span className="art-circle circle-two"></span>
          <span className="gear">⚙</span><span className="spark spark-one">✦</span><span className="spark spark-two">✦</span>
        </div>
      </section>

      <section className="category-section" id="browse">
        <p className="eyebrow">START HERE</p>
        <h2>What are you looking for?</h2>
        <div className="category-grid">
          <article className="category-card"><span className="category-icon">◉</span><h3>Engine &amp; transmission</h3><p>Powertrain parts for your next repair.</p></article>
          <article className="category-card"><span className="category-icon">▣</span><h3>Body &amp; exterior</h3><p>Panels, lights, mirrors, and more.</p></article>
          <article className="category-card"><span className="category-icon">◇</span><h3>Interior &amp; accessories</h3><p>Make your car feel like new again.</p></article>
        </div>
      </section>

      <section className="sell-banner">
        <div><p className="eyebrow">HAVE PARTS TO SELL?</p><h2>Clear out your garage. Help another driver.</h2></div>
        <Link className="dark-button" to="/register">Create a listing</Link>
      </section>
    </>
  )
}

export default Home
