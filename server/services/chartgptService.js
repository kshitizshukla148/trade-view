const axios = require('axios');
const { getStockData, getHistoricalData } = require('./stockService');

// ChartGPT API configuration
const CHARTGPT_API_URL = process.env.CHARTGPT_API_URL || 'https://api.gptchart.ai';
const CHARTGPT_API_KEY = process.env.CHARTGPT_API_KEY;

/**
 * Analyze stock performance using ChartGPT API
 * @param {string} symbol - Stock symbol (e.g., 'RELIANCE')
 * @param {string} timeframe - Analysis timeframe (e.g., '1d', '1w', '1m', '3m', '1y')
 * @returns {Promise<Object>} Analysis results with insights and recommendations
 */
async function analyzeStockPerformance(symbol, timeframe = '1m') {
  try {
    // Get current stock data and historical data
    const stockData = await getStockData(`${symbol}.BSE`);
    const historicalData = await getHistoricalData(`${symbol}.BSE`, '1d', timeframe);

    // Prepare data for ChartGPT API
    const analysisData = {
      symbol: symbol,
      name: stockData.name,
      currentPrice: stockData.price,
      change: stockData.change,
      changePercent: stockData.changePercent,
      volume: stockData.volume,
      high: stockData.high,
      low: stockData.low,
      open: stockData.open,
      historicalData: historicalData.slice(-30), // Last 30 data points
      timeframe: timeframe
    };

    // If API key is configured, call ChartGPT API
    if (CHARTGPT_API_KEY && CHARTGPT_API_KEY !== 'your-chartgpt-api-key-here') {
      try {
        console.log(`[ChartGPT] Attempting to analyze ${symbol} with ChartGPT API...`);
        const response = await axios.post(
          `${CHARTGPT_API_URL}/api/v2/stock/analyze`,
          {
            symbol: symbol,
            priceData: analysisData,
            timeframe: timeframe
          },
          {
            headers: {
              'Authorization': `Bearer ${CHARTGPT_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );
        
        console.log(`[ChartGPT] Successfully analyzed ${symbol}`);

        return {
          success: true,
          symbol: symbol,
          stockData: stockData,
          analysis: response.data.analysis || response.data,
          insights: response.data.insights || [],
          recommendations: response.data.recommendations || [],
          technicalIndicators: response.data.technicalIndicators || {},
          sentiment: response.data.sentiment || 'neutral',
          timestamp: Date.now()
        };
      } catch (apiError) {
        console.error('[ChartGPT] API error:', apiError.response?.data || apiError.message);
        console.log('[ChartGPT] Falling back to local analysis');
        // Fall through to local analysis
      }
    } else {
      console.log('[ChartGPT] No API key configured, using local analysis');
    }

    // Fallback: Generate local AI-like analysis based on stock data
    const localAnalysis = generateLocalAnalysis(analysisData);
    // Only mark as local_analysis if no API key was configured
    if (!CHARTGPT_API_KEY || CHARTGPT_API_KEY === 'your-chartgpt-api-key-here') {
      localAnalysis.source = 'local_analysis';
    } else {
      localAnalysis.source = 'api_fallback';
    }
    return localAnalysis;

  } catch (error) {
    console.error('Error analyzing stock performance:', error.message);
    throw new Error(`Failed to analyze stock: ${error.message}`);
  }
}

/**
 * Generate local analysis when ChartGPT API is not available
 * @param {Object} data - Stock data for analysis
 * @returns {Object} Analysis results
 */
function generateLocalAnalysis(data) {
  const { currentPrice, change, changePercent, volume, historicalData, timeframe } = data;
  
  // Calculate technical indicators
  const prices = historicalData.map(d => d.close).filter(p => p !== null);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const volatility = calculateVolatility(prices);
  
  // Determine trend
  const recentPrices = prices.slice(-10);
  const olderPrices = prices.slice(-20, -10);
  const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
  const olderAvg = olderPrices.length > 0 ? olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length : recentAvg;
  const trend = recentAvg > olderAvg ? 'bullish' : recentAvg < olderAvg ? 'bearish' : 'neutral';
  
  // Generate insights
  const insights = [];
  if (changePercent > 5) {
    insights.push('Strong upward momentum detected. Stock is showing significant gains.');
  } else if (changePercent < -5) {
    insights.push('Significant downward pressure. Consider risk management strategies.');
  } else if (changePercent > 0) {
    insights.push('Moderate positive movement. Stock is performing well.');
  } else {
    insights.push('Slight negative movement. Monitor for potential recovery.');
  }

  if (volatility > 0.05) {
    insights.push('High volatility detected. Stock price is experiencing significant fluctuations.');
  } else {
    insights.push('Low volatility. Stock price is relatively stable.');
  }

  if (currentPrice > avgPrice * 1.1) {
    insights.push('Stock is trading significantly above average price. May indicate overvaluation.');
  } else if (currentPrice < avgPrice * 0.9) {
    insights.push('Stock is trading below average price. Potential buying opportunity.');
  }

  // Generate recommendations
  const recommendations = [];
  if (trend === 'bullish' && changePercent > 0) {
    recommendations.push({
      type: 'buy',
      confidence: changePercent > 3 ? 'high' : 'medium',
      reason: 'Strong bullish trend with positive momentum'
    });
  } else if (trend === 'bearish' && changePercent < -2) {
    recommendations.push({
      type: 'sell',
      confidence: changePercent < -5 ? 'high' : 'medium',
      reason: 'Bearish trend with negative momentum'
    });
  } else {
    recommendations.push({
      type: 'hold',
      confidence: 'medium',
      reason: 'Mixed signals. Monitor closely before making decisions.'
    });
  }

  // Determine sentiment
  let sentiment = 'neutral';
  if (changePercent > 3 && trend === 'bullish') {
    sentiment = 'very_positive';
  } else if (changePercent > 0 && trend === 'bullish') {
    sentiment = 'positive';
  } else if (changePercent < -3 && trend === 'bearish') {
    sentiment = 'very_negative';
  } else if (changePercent < 0 && trend === 'bearish') {
    sentiment = 'negative';
  }

  return {
    success: true,
    symbol: data.symbol,
    stockData: {
      symbol: data.symbol,
      name: data.name,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: volume
    },
    analysis: {
      trend: trend,
      averagePrice: avgPrice.toFixed(2),
      priceRange: {
        high: maxPrice.toFixed(2),
        low: minPrice.toFixed(2)
      },
      volatility: (volatility * 100).toFixed(2) + '%',
      supportLevel: minPrice.toFixed(2),
      resistanceLevel: maxPrice.toFixed(2)
    },
    insights: insights,
    recommendations: recommendations,
    technicalIndicators: {
      movingAverage: avgPrice.toFixed(2),
      rsi: calculateRSI(prices),
      trend: trend,
      momentum: changePercent > 0 ? 'positive' : 'negative'
    },
    sentiment: sentiment,
    timestamp: Date.now(),
    source: 'local_analysis'
  };
}

/**
 * Calculate volatility (standard deviation of returns)
 */
function calculateVolatility(prices) {
  if (prices.length < 2) return 0;
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i-1] > 0) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
  }
  
  if (returns.length === 0) return 0;
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  return Math.sqrt(variance);
}

/**
 * Calculate RSI (Relative Strength Index)
 */
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50; // Neutral RSI if not enough data
  
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i-1]);
  }
  
  const recentChanges = changes.slice(-period);
  const gains = recentChanges.filter(c => c > 0).reduce((a, b) => a + b, 0);
  const losses = Math.abs(recentChanges.filter(c => c < 0).reduce((a, b) => a + b, 0));
  
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - (100 / (1 + rs));
}

/**
 * Analyze portfolio performance
 * @param {Array} holdings - Array of portfolio holdings
 * @returns {Promise<Object>} Portfolio analysis
 */
async function analyzePortfolio(holdings) {
  try {
    const analyses = await Promise.all(
      holdings.map(holding => analyzeStockPerformance(holding.symbol, '1m'))
    );

    const totalGain = holdings.reduce((sum, holding) => {
      const analysis = analyses.find(a => a.symbol === holding.symbol);
      if (analysis) {
        return sum + (holding.quantity * analysis.stockData.change);
      }
      return sum;
    }, 0);

    const recommendations = [];
    const topPerformers = analyses
      .filter(a => a.stockData.changePercent > 0)
      .sort((a, b) => b.stockData.changePercent - a.stockData.changePercent)
      .slice(0, 3);

    const underPerformers = analyses
      .filter(a => a.stockData.changePercent < 0)
      .sort((a, b) => a.stockData.changePercent - b.stockData.changePercent)
      .slice(0, 3);

    if (topPerformers.length > 0) {
      recommendations.push({
        type: 'consider_adding',
        stocks: topPerformers.map(a => a.symbol),
        reason: 'These stocks are showing strong positive momentum'
      });
    }

    if (underPerformers.length > 0) {
      recommendations.push({
        type: 'review',
        stocks: underPerformers.map(a => a.symbol),
        reason: 'These stocks are underperforming and may need review'
      });
    }

    return {
      success: true,
      totalGain: totalGain,
      stockAnalyses: analyses,
      recommendations: recommendations,
      sentiment: totalGain > 0 ? 'positive' : totalGain < 0 ? 'negative' : 'neutral',
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error analyzing portfolio:', error.message);
    throw new Error(`Failed to analyze portfolio: ${error.message}`);
  }
}

module.exports = {
  analyzeStockPerformance,
  analyzePortfolio
};

