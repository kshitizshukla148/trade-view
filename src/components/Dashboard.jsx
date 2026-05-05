import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { stocksAPI, portfolioAPI } from '../utils/api'
import { subscribeToStocks } from '../utils/socket'
import { formatCompactNumber, formatCurrency, formatPercent } from '../utils/formatters'
import './Dashboard.css'

function Dashboard({ user, theme }) {
  const [totalValue, setTotalValue] = useState(0)
  const [totalGain, setTotalGain] = useState(0)
  const [chartData, setChartData] = useState([])
  const [stocks, setStocks] = useState([])

  useEffect(() => {
    loadPortfolioSummary()
    loadStocks()

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
      setChartData(generateChartData(response.data.totalValue, response.data.totalInvested))
    } catch (error) {
      console.error('Error loading portfolio:', error)
    }
  }

  const generateChartData = (currentValue, invested) => {
    const data = []
    const days = 30
    const startValue = invested || 10000000

    for (let i = days; i >= 0; i -= 1) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const progress = (days - i) / days
      const value = startValue + (currentValue - startValue) * progress
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value
      })
    }

    return data
  }

  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
  const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)
  const activeStocks = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 5)
  const totalPortfolioValue = (user?.balance || 0) + totalValue
  const performancePercent = totalValue > 0 && (totalValue - totalGain) > 0
    ? (totalGain / (totalValue - totalGain)) * 100
    : 0
  const averageMove = stocks.length
    ? stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length
    : 0
  const momentumLeader = topGainers[0]
  const riskWatch = topLosers[0]
  const chartPalette = theme === 'light'
    ? {
        grid: 'rgba(16, 32, 51, 0.1)',
        axis: '#61758a',
        tooltipBackground: 'rgba(255, 255, 255, 0.98)',
        tooltipBorder: 'rgba(16, 32, 51, 0.1)',
        line: '#0ea47f'
      }
    : {
        grid: 'rgba(148, 170, 197, 0.14)',
        axis: '#7f94ae',
        tooltipBackground: 'rgba(10, 20, 34, 0.96)',
        tooltipBorder: 'rgba(148, 170, 197, 0.16)',
        line: '#3dd9b8'
      }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-header-copy">
            <span className="eyebrow">Portfolio command center</span>
            <h1>Welcome back, {user?.name}!</h1>
            <p className="subtitle">Track your capital, spot momentum, and jump into live opportunities faster.</p>
          </div>

          <div className="dashboard-highlight">
            <span className="highlight-label">30D performance trend</span>
            <strong>{formatPercent(performancePercent)}</strong>
            <p>Based on your current invested positions.</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <Wallet size={24} />
              <span>Total Portfolio Value</span>
            </div>
            <div className="stat-value">{formatCurrency(totalPortfolioValue)}</div>
            <div className={`stat-change ${totalGain >= 0 ? 'positive' : 'negative'}`}>
              {totalGain >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{`${formatCurrency(totalGain)} (${formatPercent(performancePercent)})`}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <TrendingUp size={24} />
              <span>Available Balance</span>
            </div>
            <div className="stat-value">{formatCurrency(user?.balance || 10000000)}</div>
            <div className="stat-change neutral">
              <span>Ready to invest</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <Wallet size={24} />
              <span>Invested Amount</span>
            </div>
            <div className="stat-value">{formatCurrency(totalValue)}</div>
            <div className="stat-change neutral">
              <span>{formatCompactNumber(stocks.length)} listed stocks tracked</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-left-column">
            <div className="chart-card">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">Insight</span>
                  <h2>Portfolio Performance</h2>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} />
                  <XAxis dataKey="date" stroke={chartPalette.axis} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartPalette.axis} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartPalette.tooltipBackground,
                      border: `1px solid ${chartPalette.tooltipBorder}`,
                      borderRadius: '16px',
                      boxShadow: '0 20px 45px rgba(2, 9, 18, 0.4)'
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={chartPalette.line}
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="performance-insights">
                <div className="performance-tile">
                  <span className="performance-label">Market breadth</span>
                  <strong className={averageMove >= 0 ? 'positive' : 'negative'}>
                    {formatPercent(averageMove)}
                  </strong>
                  <p>Average move across {formatCompactNumber(stocks.length)} tracked names.</p>
                </div>

                <div className="performance-tile">
                  <span className="performance-label">Momentum leader</span>
                  <strong>{momentumLeader?.symbol || 'N/A'}</strong>
                  <p>
                    {momentumLeader
                      ? `${formatCurrency(momentumLeader.price)} • ${formatPercent(momentumLeader.changePercent)}`
                      : 'Waiting for market data.'}
                  </p>
                </div>

                <div className="performance-tile">
                  <span className="performance-label">Risk watch</span>
                  <strong>{riskWatch?.symbol || 'N/A'}</strong>
                  <p>
                    {riskWatch
                      ? `${formatCurrency(riskWatch.price)} • ${formatPercent(riskWatch.changePercent)}`
                      : 'Waiting for market data.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="activity-card">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">Activity</span>
                  <h3>Most Active Stocks</h3>
                </div>
              </div>

              <div className="activity-grid">
                {activeStocks.map((stock) => (
                  <Link
                    key={stock.symbol}
                    to={`/trade/${stock.symbol}`}
                    className="activity-item"
                  >
                    <div className="activity-main">
                      <div>
                        <div className="activity-symbol">{stock.symbol}</div>
                        <div className="activity-name">{stock.name}</div>
                      </div>
                      <div className={`activity-change ${stock.changePercent >= 0 ? 'positive' : 'negative'}`}>
                        {formatPercent(stock.changePercent)}
                      </div>
                    </div>
                    <div className="activity-meta">
                      <span className="activity-price">{formatCurrency(stock.price)}</span>
                      <span className="activity-volume">{formatCompactNumber(stock.volume)} volume</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="top-stocks">
            <div className="top-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">Momentum</span>
                  <h3>Top Gainers</h3>
                </div>
              </div>

              <div className="stock-list">
                {topGainers.map((stock) => (
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
                      <span>{formatCurrency(stock.price)}</span>
                      <span className="change">{formatPercent(stock.changePercent)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="top-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">Pressure</span>
                  <h3>Top Losers</h3>
                </div>
              </div>

              <div className="stock-list">
                {topLosers.map((stock) => (
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
                      <span>{formatCurrency(stock.price)}</span>
                      <span className="change">{formatPercent(stock.changePercent)}</span>
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
