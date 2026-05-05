import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { stocksAPI } from '../utils/api';
import './TradingViewChart.css';

const timeframeOptions = [
  { key: '1m', label: '1m', apiInterval: '1m', range: '1d' },
  { key: '5m', label: '5m', apiInterval: '5m', range: '5d' },
  { key: '10m', label: '10m', apiInterval: '10m', range: '5d' },
  { key: '1h', label: '1h', apiInterval: '1h', range: '1mo' },
  { key: '1d', label: '1d', apiInterval: '1d', range: '1y' }
];

function TradingViewChart({ symbol }) {
  const chartContainerRef = useRef();
  const chart = useRef();
  const candlestickSeries = useRef();
  const [loading, setLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState('1d');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    chart.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0e27' },
        textColor: '#a0aec0',
      },
      grid: {
        vertLines: { color: '#2d3748' },
        horzLines: { color: '#2d3748' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Create candlestick series
    candlestickSeries.current = chart.current.addCandlestickSeries({
      upColor: '#00d4aa',
      downColor: '#e74c3c',
      borderVisible: false,
      wickUpColor: '#00d4aa',
      wickDownColor: '#e74c3c',
    });

    // Load historical data
    loadChartData(activeTimeframe);

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart.current) {
        chart.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart.current) {
        chart.current.remove();
      }
    };
  }, [symbol]);

  const loadChartData = async (timeframeKey) => {
    try {
      setLoading(true);
      const selectedTimeframe = timeframeOptions.find((option) => option.key === timeframeKey) || timeframeOptions[4];
      const response = await stocksAPI.getHistory(symbol, selectedTimeframe.apiInterval, selectedTimeframe.range);
      const data = response.data.map(item => ({
        time: item.time / 1000, // Convert to seconds
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      if (candlestickSeries.current) {
        candlestickSeries.current.setData(data);
        chart.current.timeScale().fitContent();
      }
      setLoading(false);
    } catch (error) {
      try {
        const fallbackResponse = await stocksAPI.getHistory(symbol, '1d', '1mo');
        const fallbackData = fallbackResponse.data.map(item => ({
          time: item.time / 1000,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        if (candlestickSeries.current) {
          candlestickSeries.current.setData(fallbackData);
          chart.current.timeScale().fitContent();
        }
      } catch (fallbackError) {
        console.error('Error loading chart data:', fallbackError);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (candlestickSeries.current) {
      loadChartData(activeTimeframe);
    }
  }, [activeTimeframe, symbol]);

  // Update chart with real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      loadChartData(activeTimeframe);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [symbol, activeTimeframe]);

  return (
    <div className="tradingview-chart-container">
      <div className="chart-timeframe-controls">
        {timeframeOptions.map((option) => (
          <button
            key={option.key}
            className={`timeframe-btn ${activeTimeframe === option.key ? 'active' : ''}`}
            onClick={() => setActiveTimeframe(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {loading && <div className="chart-loading">Loading chart data...</div>}
      <div ref={chartContainerRef} className="chart-wrapper" />
    </div>
  );
}

export default TradingViewChart;

