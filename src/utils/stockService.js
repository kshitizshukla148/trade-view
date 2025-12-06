// Real-time stock price service
import { stocks as initialStocks } from './mockData'

// Initialize stocks with base prices (already in INR)
let currentStocks = initialStocks.map(stock => ({
  ...stock,
  basePrice: stock.price // Store base price for fluctuations
}))

// Subscribers for real-time updates
const subscribers = new Set()

// Update stock prices with random fluctuations
const updateStockPrices = () => {
  currentStocks = currentStocks.map(stock => {
    // Generate random price change (-2% to +2%)
    const fluctuation = (Math.random() - 0.5) * 0.04
    const newPrice = stock.basePrice * (1 + fluctuation)
    const change = newPrice - stock.basePrice
    const changePercent = (change / stock.basePrice) * 100
    
    // Update volume slightly
    const volumeChange = Math.floor(Math.random() * 1000000) - 500000
    const newVolume = Math.max(1000000, stock.volume + volumeChange)
    
    return {
      ...stock,
      price: parseFloat(newPrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: newVolume,
      lastUpdate: new Date().toISOString()
    }
  })
  
  // Notify all subscribers
  subscribers.forEach(callback => callback([...currentStocks]))
}

// Start real-time updates every 2 seconds
let updateInterval = null

export const startRealTimeUpdates = () => {
  if (updateInterval) return
  
  updateInterval = setInterval(updateStockPrices, 2000)
  // Initial update
  updateStockPrices()
}

export const stopRealTimeUpdates = () => {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
}

export const subscribe = (callback) => {
  subscribers.add(callback)
  // Immediately call with current data
  callback([...currentStocks])
  
  // Return unsubscribe function
  return () => {
    subscribers.delete(callback)
  }
}

export const getStocks = () => [...currentStocks]

export const getStockBySymbol = (symbol) => {
  return currentStocks.find(stock => stock.symbol === symbol)
}

// Reset to initial prices (useful for testing)
export const resetPrices = () => {
  currentStocks = initialStocks.map(stock => ({
    ...stock,
    basePrice: stock.price
  }))
  subscribers.forEach(callback => callback([...currentStocks]))
}

