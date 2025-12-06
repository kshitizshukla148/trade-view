import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info, Loader } from 'lucide-react'
import { stocksAPI } from '../utils/api'
import './StockAnalysis.css'

function StockAnalysis({ symbol, timeframe = '1m' }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (symbol) {
      loadAnalysis()
    }
  }, [symbol, timeframe])

  const loadAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await stocksAPI.analyze(symbol, timeframe)
      setAnalysis(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analysis')
      console.error('Error loading analysis:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'very_positive':
        return '#00d4aa'
      case 'positive':
        return '#4ade80'
      case 'negative':
        return '#f87171'
      case 'very_negative':
        return '#ef4444'
      default:
        return '#94a3b8'
    }
  }

  const getSentimentLabel = (sentiment) => {
    switch (sentiment) {
      case 'very_positive':
        return 'Very Positive'
      case 'positive':
        return 'Positive'
      case 'negative':
        return 'Negative'
      case 'very_negative':
        return 'Very Negative'
      default:
        return 'Neutral'
    }
  }

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'buy':
        return <TrendingUp size={20} className="recommendation-icon buy" />
      case 'sell':
        return <TrendingDown size={20} className="recommendation-icon sell" />
      default:
        return <Info size={20} className="recommendation-icon hold" />
    }
  }

  if (loading) {
    return (
      <div className="stock-analysis">
        <div className="analysis-loading">
          <Loader className="spinner" size={32} />
          <p>Analyzing stock performance...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="stock-analysis">
        <div className="analysis-error">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button onClick={loadAnalysis} className="retry-btn">Retry</button>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return null
  }

  return (
    <div className="stock-analysis">
      <div className="analysis-header">
        <div className="header-left">
          <Brain size={24} />
          <h3>AI Stock Analysis</h3>
        </div>
        <div 
          className="sentiment-badge"
          style={{ backgroundColor: getSentimentColor(analysis.sentiment) }}
        >
          {getSentimentLabel(analysis.sentiment)}
        </div>
      </div>

      {analysis.stockData && (
        <div className="stock-overview">
          <div className="overview-item">
            <span className="label">Current Price:</span>
            <span className="value">₹{analysis.stockData.price?.toFixed(2)}</span>
          </div>
          <div className="overview-item">
            <span className="label">Change:</span>
            <span className={`value ${analysis.stockData.changePercent >= 0 ? 'positive' : 'negative'}`}>
              {analysis.stockData.changePercent >= 0 ? '+' : ''}
              {analysis.stockData.changePercent?.toFixed(2)}%
            </span>
          </div>
          <div className="overview-item">
            <span className="label">Volume:</span>
            <span className="value">{analysis.stockData.volume?.toLocaleString()}</span>
          </div>
        </div>
      )}

      {analysis.analysis && (
        <div className="analysis-section">
          <h4>Technical Analysis</h4>
          <div className="analysis-grid">
            <div className="analysis-card">
              <span className="card-label">Trend</span>
              <span className={`card-value ${analysis.analysis.trend}`}>
                {analysis.analysis.trend?.charAt(0).toUpperCase() + analysis.analysis.trend?.slice(1)}
              </span>
            </div>
            <div className="analysis-card">
              <span className="card-label">Avg Price</span>
              <span className="card-value">₹{analysis.analysis.averagePrice}</span>
            </div>
            <div className="analysis-card">
              <span className="card-label">Volatility</span>
              <span className="card-value">{analysis.analysis.volatility}</span>
            </div>
            {analysis.analysis.supportLevel && (
              <div className="analysis-card">
                <span className="card-label">Support</span>
                <span className="card-value">₹{analysis.analysis.supportLevel}</span>
              </div>
            )}
            {analysis.analysis.resistanceLevel && (
              <div className="analysis-card">
                <span className="card-label">Resistance</span>
                <span className="card-value">₹{analysis.analysis.resistanceLevel}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {analysis.technicalIndicators && (
        <div className="analysis-section">
          <h4>Technical Indicators</h4>
          <div className="indicators-grid">
            {analysis.technicalIndicators.rsi && (
              <div className="indicator-item">
                <span className="indicator-label">RSI</span>
                <span className="indicator-value">{analysis.technicalIndicators.rsi.toFixed(2)}</span>
              </div>
            )}
            {analysis.technicalIndicators.movingAverage && (
              <div className="indicator-item">
                <span className="indicator-label">Moving Avg</span>
                <span className="indicator-value">₹{analysis.technicalIndicators.movingAverage}</span>
              </div>
            )}
            {analysis.technicalIndicators.momentum && (
              <div className="indicator-item">
                <span className="indicator-label">Momentum</span>
                <span className={`indicator-value ${analysis.technicalIndicators.momentum}`}>
                  {analysis.technicalIndicators.momentum?.charAt(0).toUpperCase() + analysis.technicalIndicators.momentum?.slice(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {analysis.insights && analysis.insights.length > 0 && (
        <div className="analysis-section">
          <h4>Key Insights</h4>
          <div className="insights-list">
            {analysis.insights.map((insight, index) => (
              <div key={index} className="insight-item">
                <Info size={16} />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="analysis-section">
          <h4>Recommendations</h4>
          <div className="recommendations-list">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-item ${rec.type}`}>
                {getRecommendationIcon(rec.type)}
                <div className="recommendation-content">
                  <div className="recommendation-header">
                    <span className="recommendation-type">{rec.type.toUpperCase()}</span>
                    <span className={`confidence-badge ${rec.confidence}`}>
                      {rec.confidence} confidence
                    </span>
                  </div>
                  <p className="recommendation-reason">{rec.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.source === 'local_analysis' && (
        <div className="analysis-footer">
          <Info size={14} />
          <span>Using local analysis. Add CHARTGPT_API_KEY to environment variables for enhanced AI insights.</span>
        </div>
      )}
      {analysis.source === 'api_fallback' && (
        <div className="analysis-footer warning">
          <AlertCircle size={14} />
          <span>ChartGPT API unavailable. Using local analysis. Check server logs for details.</span>
        </div>
      )}
    </div>
  )
}

export default StockAnalysis

