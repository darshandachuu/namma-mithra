import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Bootstrap 5 CSS
import 'bootstrap/dist/css/bootstrap.min.css'
// React Toastify CSS
import 'react-toastify/dist/ReactToastify.css'
// Custom App CSS
import './index.css'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
