import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { portfolioAPI, stocksAPI } from '../utils/api'
import { subscribeToStocks, subscribeToPortfolio } from '../utils/socket'
import PortfolioAnalysis from './PortfolioAnalysis'
import './Portfolio.css'

function Portfolio() {
  const [portfolio, setPortfolio] = useState([])
  const [totalValue, setTotalValue] = useState(0)
  const [totalInvested, setTotalInvested] = useState(0)
  const [totalGain, setTotalGain] = useState(0)
  const [chartData, setChartData] = useState([])
  const [stocks, setStocks] = useState([])

  useEffect(() => {
    loadPortfolio()
    loadSummary()

    // Subscribe to real-time updates
    const unsubscribeStocks = subscribeToStocks((updatedStocks) => {
      setStocks(updatedStocks)
      loadPortfolio()
      loadSummary()
    })

    const unsubscribePortfolio = subscribeToPortfolio(() => {
      loadPortfolio()
      loadSummary()
    })

    return () => {
      unsubscribeStocks()
      unsubscribePortfolio()
    }
  }, [])

  const loadPortfolio = async () => {
    try {
      const response = await portfolioAPI.getAll()
      setPortfolio(response.data)
    } catch (error) {
      console.error('Error loading portfolio:', error)
    }
  }

  const loadSummary = async () => {
    try {
      const response = await portfolioAPI.getSummary()
      setTotalValue(response.data.totalValue)
      setTotalInvested(response.data.totalInvested)
      setTotalGain(response.data.totalGain)
      
      // Generate chart data
      const history = generateChartData(response.data.totalValue, response.data.totalInvested)
      setChartData(history)
    } catch (error) {
      console.error('Error loading summary:', error)
    }
  }

  const generateChartData = (currentValue, invested) => {
    const data = []
    const days = 30
    const startValue = invested || 0
    
    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const progress = (days - i) / days
      const value = startValue + (currentValue - startValue) * progress
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: value
      })
    }
    return data
  }

  const getStockData = async (symbol) => {
    try {
      const response = await stocksAPI.getOne(symbol)
      return response.data
    } catch (error) {
      return stocks.find(s => s.symbol === symbol)
    }
  }

  if (portfolio.length === 0) {
    return (
      <div className="portfolio">
        <div className="portfolio-container">
          <div className="portfolio-header">
            <h1>Portfolio</h1>
            <p className="subtitle">Your investment holdings</p>
          </div>
          <div className="empty-portfolio">
            <Wallet size={64} />
            <h2>No Holdings Yet</h2>
            <p>Start building your portfolio by trading stocks</p>
            <Link to="/market" className="cta-button">
              Explore Market
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="portfolio">
      <div className="portfolio-container">
        <div className="portfolio-header">
          <h1>Portfolio</h1>
          <p className="subtitle">Your investment holdings</p>
        </div>

        <div className="portfolio-stats">
          <div className="stat-card">
            <div className="stat-label">Total Value</div>
            <div className="stat-amount">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Invested</div>
            <div className="stat-amount">₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className={`stat-card ${totalGain >= 0 ? 'positive' : 'negative'}`}>
            <div className="stat-label">Total Gain/Loss</div>
            <div className="stat-amount">
              {totalGain >= 0 ? '+' : ''}₹{totalGain.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="stat-percent">
              {totalGain >= 0 ? '+' : ''}{((totalGain / totalInvested) * 100).toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="portfolio-chart">
          <h2>Portfolio Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="date" stroke="#a0aec0" />
              <YAxis stroke="#a0aec0" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#141b2d', 
                  border: '1px solid #2d3748',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#00d4aa" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="holdings-section">
          <h2>Your Holdings</h2>
          <div className="holdings-table">
            <div className="table-header">
              <div className="col-symbol">Symbol</div>
              <div className="col-name">Company</div>
              <div className="col-quantity">Quantity</div>
              <div className="col-avg">Avg Price</div>
              <div className="col-current">Current Price</div>
              <div className="col-value">Value</div>
              <div className="col-gain">Gain/Loss</div>
              <div className="col-action">Action</div>
            </div>

            <div className="table-body">
              {portfolio.map(holding => {
                const stock = stocks.find(s => s.symbol === holding.symbol)
                if (!stock) return null
                
                const currentValue = holding.quantity * stock.price
                const invested = holding.quantity * holding.avgPrice
                const gain = currentValue - invested
                const gainPercent = invested > 0 ? ((gain / invested) * 100) : 0

                return (
                  <div key={holding.symbol} className="table-row">
                    <div className="col-symbol">
                      <span className="symbol">{holding.symbol}</span>
                    </div>
                    <div className="col-name">{stock.name}</div>
                    <div className="col-quantity">{holding.quantity}</div>
                    <div className="col-avg">₹{holding.avgPrice.toFixed(2)}</div>
                    <div className="col-current">₹{stock.price.toFixed(2)}</div>
                    <div className="col-value">₹{currentValue.toFixed(2)}</div>
                    <div className={`col-gain ${gain >= 0 ? 'positive' : 'negative'}`}>
                      {gain >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      <span>
                        {gain >= 0 ? '+' : ''}₹{gain.toFixed(2)} ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="col-action">
                      <Link to={`/trade/${holding.symbol}`} className="trade-btn">
                        Trade
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <PortfolioAnalysis />
      </div>
    </div>
  )
}

export default Portfolio

