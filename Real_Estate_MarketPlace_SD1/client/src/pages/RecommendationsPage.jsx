import React, { useState } from 'react'

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState(null)
  const [trending, setTrending] = useState(null)
  const [similar, setSimilar] = useState(null)
  const [propertyId, setPropertyId] = useState('')
  const [error, setError] = useState(null)

  const recommendationsBaseUrl = import.meta.env.VITE_RECOMMENDATIONS_API_URL || `${import.meta.env.VITE_BASE_URL}/api/recommendations`

  const fetchRecommendations = async () => {
    setError(null)
    try {
      const res = await fetch(`${recommendationsBaseUrl}/recommendations`, {
        headers: { 'content-type': 'application/json' }
      })
      const result = await res.json()
      setRecommendations(result)
    } catch (err) {
      setError('Unable to load recommendations')
    }
  }

  const fetchTrending = async () => {
    setError(null)
    try {
      const res = await fetch(`${recommendationsBaseUrl}/trending`)
      const result = await res.json()
      setTrending(result)
    } catch (err) {
      setError('Unable to load trending properties')
    }
  }

  const fetchSimilar = async () => {
    setError(null)
    if (!propertyId) {
      setError('Please enter a property ID.')
      return
    }
    try {
      const res = await fetch(`${recommendationsBaseUrl}/similar/${propertyId}`)
      const result = await res.json()
      setSimilar(result)
    } catch (err) {
      setError('Unable to load similar properties')
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
      <h1>Recommendation Engine</h1>
      <p>Explore property recommendations, trending listings, and similar property suggestions.</p>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={fetchRecommendations}>Load Recommendations</button>
        <button onClick={fetchTrending} style={{ marginLeft: '12px' }}>Load Trending</button>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <input
          type='text'
          placeholder='Property ID for similar properties'
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          style={{ padding: '8px', width: '280px' }}
        />
        <button onClick={fetchSimilar} style={{ marginLeft: '12px' }}>Load Similar</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {recommendations && (
        <div>
          <h3>Recommendations</h3>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f3f4f6', padding: '16px' }}>
            {JSON.stringify(recommendations, null, 2)}
          </pre>
        </div>
      )}
      {trending && (
        <div>
          <h3>Trending Properties</h3>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f3f4f6', padding: '16px' }}>
            {JSON.stringify(trending, null, 2)}
          </pre>
        </div>
      )}
      {similar && (
        <div>
          <h3>Similar Properties</h3>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f3f4f6', padding: '16px' }}>
            {JSON.stringify(similar, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default RecommendationsPage
