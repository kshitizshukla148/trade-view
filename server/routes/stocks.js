const express = require('express');
const router = express.Router();
const { getStockData, getHistoricalData, getAllStocks } = require('../services/stockService');
const { analyzeStockPerformance } = require('../services/chartgptService');
const auth = require('../middleware/auth');

// Get all stocks
router.get('/', async (req, res) => {
  try {
    const stocks = await getAllStocks();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stocks', error: error.message });
  }
});

// Get single stock
router.get('/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const stock = await getStockData(`${symbol}.BSE`);
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock', error: error.message });
  }
});

// Get historical data for chart
router.get('/:symbol/history', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const { interval = '1d', range = '1mo' } = req.query;
    const data = await getHistoricalData(`${symbol}.BSE`, interval, range);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching historical data', error: error.message });
  }
});

// Analyze stock performance using ChartGPT API
router.get('/:symbol/analyze', auth, async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const { timeframe = '1m' } = req.query;
    const analysis = await analyzeStockPerformance(symbol, timeframe);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Error analyzing stock', error: error.message });
  }
});

module.exports = router;

