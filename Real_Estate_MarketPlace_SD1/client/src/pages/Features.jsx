import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Style/Home.module.css'

const Features = () => {
  return (
    <div className={styles.featureSection}>
      <h1>Explore New Features</h1>
      <div className={styles.featureButtons}>
        <Link to='/features/map'><button>Google Map</button></Link>
        <Link to='/features/chat'><button>Chat System</button></Link>
        <Link to='/features/recommendations'><button>Recommendations</button></Link>
        <Link to='/features/payment'><button>Payments</button></Link>
      </div>
      <p>Use these buttons to access newly added backend-powered features.</p>
    </div>
  )
}

export default Features
