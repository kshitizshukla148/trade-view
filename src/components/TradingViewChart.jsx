import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { stocksAPI } from '../utils/api';
import './TradingViewChart.css';

function TradingViewChart({ symbol }) {
  const chartContainerRef = useRef();
  const chart = useRef();
  const candlestickSeries = useRef();
  const [loading, setLoading] = useState(true);

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
    loadChartData();

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

  const loadChartData = async () => {
    try {
      setLoading(true);
      const response = await stocksAPI.getHistory(symbol, '1d', '1mo');
      const data = response.data.map(item => ({
        time: item.time / 1000, // Convert to seconds
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      if (candlestickSeries.current) {
        candlestickSeries.current.setData(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading chart data:', error);
      setLoading(false);
    }
  };

  // Update chart with real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      loadChartData();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <div className="tradingview-chart-container">
      {loading && <div className="chart-loading">Loading chart data...</div>}
      <div ref={chartContainerRef} className="chart-wrapper" />
    </div>
  );
}

export default TradingViewChart;

