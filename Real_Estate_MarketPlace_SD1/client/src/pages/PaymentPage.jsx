import React, { useState } from 'react'

const PaymentPage = () => {
  const [amount, setAmount] = useState('1000')
  const [propertyId, setPropertyId] = useState('')
  const [transactionType, setTransactionType] = useState('booking')
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)

  const paymentBaseUrl = import.meta.env.VITE_PAYMENT_API_URL || `${import.meta.env.VITE_BASE_URL}/api/payment`
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID

  const createOrder = async () => {
    setError(null)
    try {
      const res = await fetch(`${paymentBaseUrl}/create-order`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: Number(amount), propertyId, transactionType })
      })
      const result = await res.json()
      setResponse(result)
    } catch (err) {
      setError('Unable to create payment order')
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
      <h1>Payment Gateway</h1>
      <p>Use this page to create Razorpay payment orders for a property.</p>
      {!razorpayKeyId && (
        <div style={{ marginBottom: '16px', padding: '14px', background: '#fef2f2', borderRadius: '10px' }}>
          <strong>Razorpay key missing.</strong> Set <code>VITE_RAZORPAY_KEY_ID</code> in <code>client/.env</code> to enable the frontend payment flow.
        </div>
      )}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Amount (INR)</label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: '8px', width: '200px' }} />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Property ID</label>
        <input value={propertyId} onChange={(e) => setPropertyId(e.target.value)} style={{ padding: '8px', width: '320px' }} />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Transaction Type</label>
        <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} style={{ padding: '8px' }}>
          <option value='booking'>booking</option>
          <option value='inquiry'>inquiry</option>
          <option value='deposit'>deposit</option>
        </select>
      </div>
      <button onClick={createOrder}>Create Order</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {response && (
        <div style={{ marginTop: '16px' }}>
          <h3>Order Response</h3>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f3f4f6', padding: '16px' }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default PaymentPage
