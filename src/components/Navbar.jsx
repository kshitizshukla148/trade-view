import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, Home, BarChart3, Wallet, LogOut, User, Activity, Sun } from 'lucide-react'
import './Navbar.css'

function Navbar({ user, onLogout }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-icon">
            <TrendingUp size={18} />
          </div>
          <div className="brand-text">
            <span>TradeHub</span>
            <small>Live market cockpit</small>
          </div>
        </Link>

        <div className="navbar-links">
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <Home size={18} />
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/market" 
            className={`nav-link ${isActive('/market') ? 'active' : ''}`}
          >
            <BarChart3 size={18} />
            <span>Market</span>
          </Link>
          <Link 
            to="/portfolio" 
            className={`nav-link ${isActive('/portfolio') ? 'active' : ''}`}
          >
            <Wallet size={18} />
            <span>Portfolio</span>
          </Link>
        </div>

        <div className="navbar-user">
          <button className="icon-btn" aria-label="theme">
            <Sun size={16} />
          </button>
          <div className="realtime-pill">
            <Activity size={14} />
            <span>Realtime</span>
          </div>
          <div className="user-info">
            <User size={18} />
            <span>{user?.name}</span>
          </div>
          <button onClick={onLogout} className="logout-btn">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

