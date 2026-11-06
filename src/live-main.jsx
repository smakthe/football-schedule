import React from 'react'
import ReactDOM from 'react-dom/client'
import LiveDashboard from './live/LiveDashboard.jsx'
import './index.css'
import './live/live.css'

ReactDOM.createRoot(document.getElementById('live-root')).render(
  <React.StrictMode>
    <div className="live-page">
      <LiveDashboard />
    </div>
  </React.StrictMode>,
)
