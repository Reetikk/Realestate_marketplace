import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, BedDouble, MapPin, Search, SlidersHorizontal } from 'lucide-react'
import styles from './Style/MapPage.module.css'

const MapPage = () => {
  const [properties, setProperties] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    const controller = new AbortController()
    const fetchProperties = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/map/properties`, { signal: controller.signal })
        if (!response.ok) throw new Error(`Map service returned ${response.status}`)
        const data = await response.json()
        setProperties(Array.isArray(data) ? data : [])
        setSelectedId(data?.[0]?._id ?? null)
      } catch (err) {
        if (err.name !== 'AbortError') setError('We couldn’t load listings right now. Please try again.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    fetchProperties()
    return () => controller.abort()
  }, [])

  const visibleProperties = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return properties
    return properties.filter((property) => [property.title, property.address, property.city, property.state, property.property_type]
      .filter(Boolean).some((value) => value.toLowerCase().includes(term)))
  }, [properties, search])

  const selectedProperty = visibleProperties.find((property) => property._id === selectedId) ?? visibleProperties[0]
  const fullAddress = selectedProperty ? [selectedProperty.address, selectedProperty.city, selectedProperty.state].filter(Boolean).join(', ') : ''
  const encodedAddress = encodeURIComponent(fullAddress)
  const mapUrl = apiKey ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${encodedAddress}` : null
  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`

  return (
    <main className={styles.page}>
      <section className={styles.heading}>
        <div><span className={styles.eyebrow}><MapPin size={14} /> FIND YOUR PLACE</span><h1>Explore homes on the map</h1><p>Browse available properties and see where each one is located.</p></div>
        <div className={styles.count}><strong>{properties.length}</strong><span>listings</span></div>
      </section>

      {!apiKey && <div className={styles.notice}><strong>Google Maps key not configured.</strong><span>Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to <code>client/.env</code> and enable Maps Embed API in Google Cloud. You can still open each location in Google Maps.</span></div>}

      <section className={styles.explorer}>
        <aside className={styles.sidebar}>
          <div className={styles.searchBox}><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by city or address" aria-label="Search properties by city or address" /></div>
          <div className={styles.listHeader}><span><SlidersHorizontal size={15} /> Available homes</span><span>{visibleProperties.length}</span></div>
          <div className={styles.list}>
            {loading && <div className={styles.empty}>Finding properties…</div>}
            {!loading && error && <div className={styles.empty}>{error}</div>}
            {!loading && !error && visibleProperties.length === 0 && <div className={styles.empty}>{search ? 'No listings match your search.' : 'No properties available yet.'}</div>}
            {!loading && !error && visibleProperties.map((property) => (
              <button key={property._id} type="button" className={`${styles.listing} ${selectedProperty?._id === property._id ? styles.active : ''}`} onClick={() => setSelectedId(property._id)}>
                <img src={property.image} alt="" loading="lazy" />
                <span className={styles.listingInfo}><strong>{property.title}</strong><span>{[property.city, property.state].filter(Boolean).join(', ')}</span><b>₹ {Number(property.price || 0).toLocaleString('en-IN')}</b><small><BedDouble size={14} /> {property.bedrooms ?? '—'} beds <span>·</span> {property.bathrooms ?? '—'} baths</small></span>
              </button>
            ))}
          </div>
        </aside>

        <div className={styles.mapPanel}>
          {selectedProperty ? <>
            <div className={styles.mapTopline}><div><span className={styles.eyebrow}>SELECTED PROPERTY</span><h2>{selectedProperty.title}</h2><p><MapPin size={15} /> {fullAddress}</p></div><Link to={`/search/details/${selectedProperty._id}`} className={styles.detailsLink}>View listing <ArrowUpRight size={16} /></Link></div>
            {mapUrl ? <iframe className={styles.map} title={`Map showing ${selectedProperty.title}`} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /> : <a className={styles.mapFallback} href={externalMapUrl} target="_blank" rel="noreferrer"><MapPin size={38} /><strong>Open this location in Google Maps</strong><span>{fullAddress}</span><span className={styles.fallbackAction}>Open Google Maps <ArrowUpRight size={15} /></span></a>}
          </> : <div className={styles.mapEmpty}>{loading ? 'Loading map listings…' : 'Select a property to see its location.'}</div>}
        </div>
      </section>
    </main>
  )
}

export default MapPage
