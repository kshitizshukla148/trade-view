const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { getStockData } = require('../services/stockService');
const { analyzePortfolio } = require('../services/chartgptService');

// Get user portfolio
router.get('/', auth, async (req, res) => {
  try {
    const holdings = await Portfolio.find({ userId: req.userId });
    res.json(holdings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching portfolio', error: error.message });
  }
});

// Buy stock
router.post('/buy', auth, async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;

    if (!symbol || !quantity || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const total = quantity * price;
    const user = await User.findById(req.userId);

    if (user.balance < total) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Update user balance
    user.balance -= total;
    await user.save();

    // Update or create portfolio entry
    let holding = await Portfolio.findOne({ userId: req.userId, symbol });
    
    if (holding) {
      const totalCost = holding.quantity * holding.avgPrice + total;
      const totalQuantity = holding.quantity + quantity;
      holding.avgPrice = totalCost / totalQuantity;
      holding.quantity = totalQuantity;
      holding.updatedAt = new Date();
    } else {
      holding = new Portfolio({
        userId: req.userId,
        symbol,
        quantity,
        avgPrice: price
      });
    }
    await holding.save();

    // Create transaction
    const transaction = new Transaction({
      userId: req.userId,
      type: 'buy',
      symbol,
      quantity,
      price,
      total
    });
    await transaction.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to('stocks').emit('portfolio-updated', { userId: req.userId });

    res.json({
      message: 'Stock purchased successfully',
      holding,
      newBalance: user.balance
    });
  } catch (error) {
    res.status(500).json({ message: 'Error buying stock', error: error.message });
  }
});

// Sell stock
router.post('/sell', auth, async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;

    if (!symbol || !quantity || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const holding = await Portfolio.findOne({ userId: req.userId, symbol });

    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient shares' });
    }

    const total = quantity * price;
    const user = await User.findById(req.userId);

    // Update user balance
    user.balance += total;
    await user.save();

    // Update portfolio
    holding.quantity -= quantity;
    if (holding.quantity === 0) {
      await Portfolio.findByIdAndDelete(holding._id);
    } else {
      holding.updatedAt = new Date();
      await holding.save();
    }

    // Create transaction
    const transaction = new Transaction({
      userId: req.userId,
      type: 'sell',
      symbol,
      quantity,
      price,
      total
    });
    await transaction.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to('stocks').emit('portfolio-updated', { userId: req.userId });

    res.json({
      message: 'Stock sold successfully',
      holding: holding.quantity > 0 ? holding : null,
      newBalance: user.balance
    });
  } catch (error) {
    res.status(500).json({ message: 'Error selling stock', error: error.message });
  }
});

// Get portfolio summary
router.get('/summary', auth, async (req, res) => {
  try {
    const holdings = await Portfolio.find({ userId: req.userId });
    const user = await User.findById(req.userId);

    let totalValue = 0;
    let totalInvested = 0;

    for (const holding of holdings) {
      const stock = await getStockData(`${holding.symbol}.BSE`);
      const currentValue = holding.quantity * stock.price;
      const invested = holding.quantity * holding.avgPrice;
      totalValue += currentValue;
      totalInvested += invested;
    }

    res.json({
      totalValue,
      totalInvested,
      totalGain: totalValue - totalInvested,
      availableBalance: user.balance,
      holdings: holdings.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching portfolio summary', error: error.message });
  }
});

// Analyze portfolio performance using ChartGPT API
router.get('/analyze', auth, async (req, res) => {
  try {
    const holdings = await Portfolio.find({ userId: req.userId });
    const analysis = await analyzePortfolio(holdings);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Error analyzing portfolio', error: error.message });
  }
});

module.exports = router;

