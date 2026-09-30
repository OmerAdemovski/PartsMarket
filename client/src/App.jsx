import { useState } from 'react'
import './App.css'

function App() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <main className="page-shell">
      <nav className="navbar">
        <a className="brand" href="/">Parts<span>Market</span></a>
        <div className="nav-links">
          <a href="#browse">Browse parts</a>
          <button type="button" className="outline-button">Log in</button>
          <button type="button" className="primary-button">Sell a part</button>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">THE SMARTER WAY TO REPAIR</p>
          <h1>Good parts deserve a second life.</h1>
          <p className="hero-text">
            Find quality used car parts from real people, or turn the parts in
            your garage into someone else’s perfect fix.
          </p>
          <div className="search-box">
            <input
              type="search"
              placeholder="Search for a part, make, or model"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search for car parts"
            />
            <button type="button" className="primary-button">Search</button>
          </div>
        </div>
        <div className="hero-art" aria-label="Illustration of a car part" role="img">
          <span className="art-circle circle-one"></span>
          <span className="art-circle circle-two"></span>
          <span className="gear">⚙</span>
          <span className="spark spark-one">✦</span>
          <span className="spark spark-two">✦</span>
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
        <button type="button" className="dark-button">Create a listing</button>
      </section>
    </main>
  )
}

export default App
