import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'
import { stocksAPI } from '../utils/api'
import { subscribeToStocks } from '../utils/socket'
import './Market.css'

function Market() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('symbol')
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load initial stocks
    loadStocks()

    // Subscribe to real-time updates
    const unsubscribe = subscribeToStocks((updatedStocks) => {
      setStocks(updatedStocks)
    })

    return () => unsubscribe()
  }, [])

  const loadStocks = async () => {
    try {
      setLoading(true)
      const response = await stocksAPI.getAll()
      setStocks(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading stocks:', error)
      setLoading(false)
    }
  }

  const filteredStocks = stocks
    .filter(stock => 
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch(sortBy) {
        case 'price':
          return b.price - a.price
        case 'change':
          return b.changePercent - a.changePercent
        case 'volume':
          return b.volume - a.volume
        default:
          return a.symbol.localeCompare(b.symbol)
      }
    })

  return (
    <div className="market">
      <div className="market-container">
        <div className="market-header">
          <h1>Market</h1>
          <p className="subtitle">Explore and discover stocks</p>
        </div>

        <div className="market-controls">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search stocks by symbol or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="symbol">Sort by Symbol</option>
            <option value="price">Sort by Price</option>
            <option value="change">Sort by Change</option>
            <option value="volume">Sort by Volume</option>
          </select>
        </div>

        <div className="stocks-table">
          <div className="table-header">
            <div className="col-symbol">Symbol</div>
            <div className="col-name">Company</div>
            <div className="col-price">Price</div>
            <div className="col-change">Change</div>
            <div className="col-volume">Volume</div>
            <div className="col-marketcap">Market Cap</div>
            <div className="col-action">Action</div>
          </div>

          <div className="table-body">
            {filteredStocks.map(stock => (
              <div key={stock.symbol} className="table-row">
                <div className="col-symbol">
                  <span className="symbol">{stock.symbol}</span>
                </div>
                <div className="col-name">{stock.name}</div>
                <div className="col-price">₹{stock.price.toFixed(2)}</div>
                <div className={`col-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                  {stock.change >= 0 ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  <span>
                    {stock.change >= 0 ? '+' : ''}₹{stock.change.toFixed(2)} 
                    ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="col-volume">
                  {(stock.volume / 1000000).toFixed(2)}M
                </div>
                <div className="col-marketcap">{stock.marketCap}</div>
                <div className="col-action">
                  <Link to={`/trade/${stock.symbol}`} className="trade-btn">
                    Trade
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Market

