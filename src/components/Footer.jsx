import React from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Heart, Coffee, Sparkles, ArrowUpRight } from 'lucide-react'
import './Footer.css'

function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-shell">
        <div className="footer-top">
          <div className="footer-brand-block">
            <div className="footer-brand">
              <div className="footer-brand-icon">
                <TrendingUp size={18} />
              </div>
              <div>
                <span>TradeHub</span>
                <small>Live market cockpit</small>
              </div>
            </div>
            <p className="footer-tagline">
              A polished trading dashboard built to feel fast, focused, and presentation-ready.
            </p>
          </div>

          <div className="footer-nav-block">
            <span className="footer-label">Navigate</span>
            <div className="footer-links">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/market">Market</Link>
              <Link to="/portfolio">Portfolio</Link>
            </div>
          </div>

          <div className="footer-cta">
            <span className="footer-label">Project Note</span>
            <p>Live market cockpit for smarter trading and cleaner decision-making.</p>
            <div className="footer-badge">
              <Sparkles size={14} />
              <span>Final year project</span>
              <ArrowUpRight size={14} />
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-credit">
            Made by Group 23 with
            <Heart size={14} className="credit-icon love" />
            Love and
            <Coffee size={14} className="credit-icon coffee" />
            Coffee
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
