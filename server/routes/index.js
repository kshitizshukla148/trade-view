const express = require('express');
const router = express.Router();

// Root route - API info
router.get('/', (req, res) => {
  res.json({
    message: 'Trading Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      stocks: '/api/stocks',
      portfolio: '/api/portfolio',
      user: '/api/user'
    }
  });
});

module.exports = router;

