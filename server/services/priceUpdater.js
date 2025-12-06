const { getAllStocks } = require('./stockService');

// Update stock prices every 3 seconds and broadcast via Socket.io
function startPriceUpdates(io) {
  setInterval(async () => {
    try {
      const stocks = await getAllStocks();
      if (stocks && stocks.length > 0) {
        io.to('stocks').emit('stock-prices-updated', stocks);
      }
    } catch (error) {
      console.error('Error updating stock prices:', error);
    }
  }, 3000); // Update every 3 seconds (reduced frequency to avoid rate limiting)
}

module.exports = { startPriceUpdates };

