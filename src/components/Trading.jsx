import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react'
import { stocksAPI, portfolioAPI } from '../utils/api'
import { subscribeToStocks } from '../utils/socket'
import TradingViewChart from './TradingViewChart'
import StockAnalysis from './StockAnalysis'
import './Trading.css'

function Trading() {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const [stock, setStock] = useState(null)
  const [orderType, setOrderType] = useState('buy')
  const [quantity, setQuantity] = useState('')
  const [orderPrice, setOrderPrice] = useState('')
  const [userBalance, setUserBalance] = useState(10000000)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStockData()
    loadUserBalance()

    // Subscribe to real-time updates
    const unsubscribe = subscribeToStocks((stocks) => {
      const stockData = stocks.find(s => s.symbol === symbol)
      if (stockData) {
        setStock(stockData)
        if (!quantity) {
          setOrderPrice(stockData.price.toFixed(2))
        }
      }
    })

    return () => unsubscribe()
  }, [symbol, navigate])

  const loadStockData = async () => {
    try {
      setLoading(true)
      const response = await stocksAPI.getOne(symbol)
      setStock(response.data)
      setOrderPrice(response.data.price.toFixed(2))
      setLoading(false)
    } catch (error) {
      console.error('Error loading stock:', error)
      navigate('/market')
    }
  }

  const loadUserBalance = async () => {
    try {
      const response = await portfolioAPI.getSummary()
      setUserBalance(response.data.availableBalance)
    } catch (error) {
      console.error('Error loading balance:', error)
    }
  }

  // Update order price when stock price changes
  useEffect(() => {
    if (stock && !quantity) {
      setOrderPrice(stock.price.toFixed(2))
    }
  }, [stock, quantity])

  const handleQuantityChange = (e) => {
    const value = e.target.value
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      setQuantity(value)
    }
  }

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0
    const price = parseFloat(orderPrice) || stock?.price || 0
    return (qty * price).toFixed(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    const qty = parseFloat(quantity)
    const price = parseFloat(orderPrice)

    if (!qty || qty <= 0) {
      setMessage('Please enter a valid quantity')
      return
    }

    if (!price || price <= 0) {
      setMessage('Please enter a valid price')
      return
    }

    try {
      if (orderType === 'buy') {
        const response = await portfolioAPI.buy({
          symbol,
          quantity: qty,
          price
        })
        setUserBalance(response.data.newBalance)
        setMessage(`Successfully bought ${qty} shares of ${symbol} at ₹${price.toFixed(2)}`)
      } else {
        const response = await portfolioAPI.sell({
          symbol,
          quantity: qty,
          price
        })
        setUserBalance(response.data.newBalance)
        setMessage(`Successfully sold ${qty} shares of ${symbol} at ₹${price.toFixed(2)}`)
      }
      setQuantity('')
      loadUserBalance()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Transaction failed. Please try again.')
    }
  }

  if (!stock) return null

  return (
    <div className="trading">
      <div className="trading-container">
        <button onClick={() => navigate('/market')} className="back-button">
          <ArrowLeft size={20} />
          Back to Market
        </button>

        <div className="trading-header">
          <div>
            <h1>{stock.name}</h1>
            <p className="stock-symbol">{stock.symbol}</p>
          </div>
          <div className="stock-price-info">
            <div className="current-price">₹{stock.price.toFixed(2)}</div>
            <div className={`price-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
              {stock.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              <span>
                ₹{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} 
                ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="trading-grid">
          <div className="chart-section">
            <h2>Price Chart</h2>
            {loading ? (
              <div className="chart-loading">Loading chart...</div>
            ) : (
              <TradingViewChart symbol={symbol} />
            )}
          </div>

          <div className="order-section">
            <div className="order-type-selector">
              <button
                className={`order-type-btn ${orderType === 'buy' ? 'active buy' : ''}`}
                onClick={() => setOrderType('buy')}
              >
                Buy
              </button>
              <button
                className={`order-type-btn ${orderType === 'sell' ? 'active sell' : ''}`}
                onClick={() => setOrderType('sell')}
              >
                Sell
              </button>
            </div>

            <form onSubmit={handleSubmit} className="order-form">
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  placeholder="0"
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Price per Share</label>
                <input
                  type="number"
                  value={orderPrice}
                  onChange={(e) => setOrderPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>Total</span>
                  <span className="total-amount">₹{calculateTotal()}</span>
                </div>
                <div className="summary-row">
                  <span>Available Balance</span>
                  <span>₹{userBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {message && (
                <div className={`message ${message.includes('Successfully') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              <button 
                type="submit" 
                className={`submit-order ${orderType}`}
              >
                {orderType === 'buy' ? 'Buy' : 'Sell'} {symbol}
              </button>
            </form>

            <div className="stock-info-card">
              <h3>Stock Information</h3>
              <div className="info-row">
                <span>Market Cap</span>
                <span>{stock.marketCap}</span>
              </div>
              <div className="info-row">
                <span>Volume</span>
                <span>{(stock.volume / 1000000).toFixed(2)}M</span>
              </div>
            </div>
          </div>
        </div>

        <StockAnalysis symbol={symbol} timeframe="1m" />
      </div>
    </div>
  )
}

export default Trading

