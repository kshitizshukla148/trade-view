import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, Home, BarChart3, Wallet, LogOut, User } from 'lucide-react'
import './Navbar.css'

function Navbar({ user, onLogout }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <TrendingUp size={24} />
          <span>TradeHub</span>
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

