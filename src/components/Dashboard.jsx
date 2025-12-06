import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { stocksAPI, portfolioAPI } from '../utils/api'
import { subscribeToStocks } from '../utils/socket'
import './Dashboard.css'

function Dashboard({ user }) {
  const [portfolio, setPortfolio] = useState([])
  const [totalValue, setTotalValue] = useState(0)
  const [totalGain, setTotalGain] = useState(0)
  const [chartData, setChartData] = useState([])
  const [stocks, setStocks] = useState([])

  useEffect(() => {
    loadPortfolioSummary()
    loadStocks()

    // Subscribe to real-time stock updates
    const unsubscribe = subscribeToStocks((updatedStocks) => {
      setStocks(updatedStocks)
      loadPortfolioSummary()
    })

    return () => unsubscribe()
  }, [])

  const loadStocks = async () => {
    try {
      const response = await stocksAPI.getAll()
      setStocks(response.data)
    } catch (error) {
      console.error('Error loading stocks:', error)
    }
  }

  const loadPortfolioSummary = async () => {
    try {
      const response = await portfolioAPI.getSummary()
      setTotalValue(response.data.totalValue)
      setTotalGain(response.data.totalGain)
      
      // Generate chart data
      const history = generateChartData(response.data.totalValue, response.data.totalInvested)
      setChartData(history)
    } catch (error) {
      console.error('Error loading portfolio:', error)
    }
  }

  const generateChartData = (currentValue, invested) => {
    const data = []
    const days = 30
    const startValue = invested || 10000000
    
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

  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
  const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name}!</h1>
            <p className="subtitle">Here's your portfolio overview</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <Wallet size={24} />
              <span>Total Portfolio Value</span>
            </div>
            <div className="stat-value">₹{((user?.balance || 0) + totalValue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className={`stat-change ${totalGain >= 0 ? 'positive' : 'negative'}`}>
              {totalGain >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>₹{totalGain >= 0 ? '+' : ''}${totalGain.toFixed(2)} ({totalValue > 0 && (totalValue - totalGain) > 0 ? (totalGain >= 0 ? '+' : '') + ((totalGain / (totalValue - totalGain)) * 100).toFixed(2) + '%' : '0.00%'})</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <TrendingUp size={24} />
              <span>Available Balance</span>
            </div>
            <div className="stat-value">₹{(user?.balance || 10000000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="stat-change neutral">
              <span>Ready to invest</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <Wallet size={24} />
              <span>Invested Amount</span>
            </div>
            <div className="stat-value">₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="stat-change neutral">
              <span>{portfolio.length} holdings</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="chart-card">
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

          <div className="top-stocks">
            <div className="top-section">
              <h3>Top Gainers</h3>
              <div className="stock-list">
                {topGainers.map(stock => (
                  <Link 
                    key={stock.symbol} 
                    to={`/trade/${stock.symbol}`}
                    className="stock-item"
                  >
                    <div className="stock-info">
                      <div className="stock-symbol">{stock.symbol}</div>
                      <div className="stock-name">{stock.name}</div>
                    </div>
                    <div className="stock-price positive">
                      <span>₹{stock.price.toFixed(2)}</span>
                      <span className="change">+{stock.changePercent.toFixed(2)}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="top-section">
              <h3>Top Losers</h3>
              <div className="stock-list">
                {topLosers.map(stock => (
                  <Link 
                    key={stock.symbol} 
                    to={`/trade/${stock.symbol}`}
                    className="stock-item"
                  >
                    <div className="stock-info">
                      <div className="stock-symbol">{stock.symbol}</div>
                      <div className="stock-name">{stock.name}</div>
                    </div>
                    <div className="stock-price negative">
                      <span>₹{stock.price.toFixed(2)}</span>
                      <span className="change">{stock.changePercent.toFixed(2)}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

