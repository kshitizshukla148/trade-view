import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { portfolioAPI } from '../utils/api'
import './PortfolioAnalysis.css'

function PortfolioAnalysis() {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(false)

  const loadAnalysis = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await portfolioAPI.analyze()
      setAnalysis(response.data)
      setExpanded(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load portfolio analysis')
      console.error('Error loading portfolio analysis:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!expanded && !loading) {
    return (
      <div className="portfolio-analysis-collapsed">
        <button onClick={loadAnalysis} className="analyze-btn">
          <Brain size={20} />
          Analyze Portfolio Performance
        </button>
      </div>
    )
  }

  return (
    <div className="portfolio-analysis">
      <div className="analysis-header">
        <div className="header-left">
          <Brain size={24} />
          <h3>Portfolio AI Analysis</h3>
        </div>
        <button onClick={() => setExpanded(false)} className="close-btn">×</button>
      </div>

      {loading && (
        <div className="analysis-loading">
          <Loader className="spinner" size={32} />
          <p>Analyzing portfolio performance...</p>
        </div>
      )}

      {error && (
        <div className="analysis-error">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button onClick={loadAnalysis} className="retry-btn">Retry</button>
        </div>
      )}

      {analysis && !loading && (
        <>
          <div className="portfolio-summary">
            <div className="summary-card">
              <span className="summary-label">Total Gain/Loss</span>
              <span className={`summary-value ${analysis.totalGain >= 0 ? 'positive' : 'negative'}`}>
                {analysis.totalGain >= 0 ? '+' : ''}₹{analysis.totalGain.toFixed(2)}
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Sentiment</span>
              <span className={`summary-value ${analysis.sentiment}`}>
                {analysis.sentiment?.charAt(0).toUpperCase() + analysis.sentiment?.slice(1)}
              </span>
            </div>
          </div>

          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="analysis-section">
              <h4>Portfolio Recommendations</h4>
              <div className="recommendations-list">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="recommendation-item">
                    {rec.type === 'consider_adding' ? (
                      <TrendingUp size={20} className="recommendation-icon positive" />
                    ) : (
                      <TrendingDown size={20} className="recommendation-icon negative" />
                    )}
                    <div className="recommendation-content">
                      <div className="recommendation-header">
                        <span className="recommendation-type">
                          {rec.type === 'consider_adding' ? 'CONSIDER ADDING' : 'REVIEW'}
                        </span>
                      </div>
                      <p className="recommendation-reason">{rec.reason}</p>
                      {rec.stocks && rec.stocks.length > 0 && (
                        <div className="recommended-stocks">
                          <span className="stocks-label">Stocks:</span>
                          <div className="stocks-list">
                            {rec.stocks.map((stock, i) => (
                              <span key={i} className="stock-tag">{stock}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.stockAnalyses && analysis.stockAnalyses.length > 0 && (
            <div className="analysis-section">
              <h4>Individual Stock Analysis</h4>
              <div className="stocks-analysis-grid">
                {analysis.stockAnalyses.map((stockAnalysis, index) => (
                  <div key={index} className="stock-analysis-card">
                    <div className="stock-analysis-header">
                      <span className="stock-symbol">{stockAnalysis.symbol}</span>
                      <span 
                        className={`sentiment-badge ${stockAnalysis.sentiment}`}
                      >
                        {stockAnalysis.sentiment?.replace('_', ' ')}
                      </span>
                    </div>
                    {stockAnalysis.recommendations && stockAnalysis.recommendations.length > 0 && (
                      <div className="stock-recommendation">
                        {stockAnalysis.recommendations[0].type === 'buy' && (
                          <CheckCircle size={16} className="positive" />
                        )}
                        {stockAnalysis.recommendations[0].type === 'sell' && (
                          <AlertCircle size={16} className="negative" />
                        )}
                        <span>{stockAnalysis.recommendations[0].type.toUpperCase()}</span>
                      </div>
                    )}
                    {stockAnalysis.insights && stockAnalysis.insights.length > 0 && (
                      <p className="stock-insight">{stockAnalysis.insights[0]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PortfolioAnalysis

