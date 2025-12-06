// Mock stock data (base prices in USD, will be converted to INR)
export const stocks = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    price: 2456.50,
    change: 12.34,
    changePercent: 0.50,
    volume: 45234567,
    marketCap: '16.6L Cr'
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    price: 3421.75,
    change: -15.25,
    changePercent: -0.44,
    volume: 23456789,
    marketCap: '12.5L Cr'
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    price: 1654.20,
    change: 8.90,
    changePercent: 0.54,
    volume: 34567890,
    marketCap: '12.8L Cr'
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    price: 1523.45,
    change: 18.75,
    changePercent: 1.25,
    volume: 56789012,
    marketCap: '6.3L Cr'
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd.',
    price: 987.65,
    change: -5.43,
    changePercent: -0.55,
    volume: 12345678,
    marketCap: '6.9L Cr'
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    price: 1234.56,
    change: 22.34,
    changePercent: 1.84,
    volume: 23456789,
    marketCap: '6.8L Cr'
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    price: 678.90,
    change: 4.56,
    changePercent: 0.68,
    volume: 45678901,
    marketCap: '6.1L Cr'
  },
  {
    symbol: 'HINDUNILVR',
    name: 'Hindustan Unilever Ltd.',
    price: 2567.89,
    change: -8.12,
    changePercent: -0.32,
    volume: 12345678,
    marketCap: '5.9L Cr'
  }
]

// Generate mock price history for charts
export const generatePriceHistory = (days = 30, basePrice) => {
  const history = []
  let currentPrice = basePrice

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const change = (Math.random() - 0.5) * 5
    currentPrice = Math.max(1, currentPrice + change)
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(currentPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000
    })
  }

  return history
}

// Get stock by symbol
export const getStockBySymbol = (symbol) => {
  return stocks.find(stock => stock.symbol === symbol)
}

