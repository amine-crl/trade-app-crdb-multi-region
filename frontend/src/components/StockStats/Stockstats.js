import React from 'react';
import './stockstats.css';

function StockStats({details}) {
  return (
    <div class="statistics-container">
        <div class="statistics-title">Key statistics</div>
            <div class="statistics-grid">
                <div class="stat-item">
                    <strong>Market cap</strong>
                    <span>{details.market_cap}</span>
                </div>
                <div class="stat-item">
                    <strong>Price-Earnings ratio</strong>
                    <span>{details.pe_ratio}</span>
                </div>
                <div class="stat-item">
                    <strong>Dividend yield</strong>
                    <span>{details.dividend_yield}</span>
                </div>
                <div class="stat-item">
                    <strong>Average volume</strong>
                    <span>{details.average_volume}</span>
                </div>
                <div class="stat-item">
                    <strong>High today</strong>
                    <span>{details.high_today}</span>
                </div>
                <div class="stat-item">
                    <strong>Low today</strong>
                    <span>{details.low_today}</span>
                </div>
                <div class="stat-item">
                    <strong>Open price</strong>
                    <span>{details.open_price}</span>
                </div>
                <div class="stat-item">
                    <strong>Volume</strong>
                    <span>{details.volume}</span>
                </div>
                <div class="stat-item">
                    <strong>52 Week high</strong>
                    <span>{details.high_52_week}</span>
                </div>
                <div class="stat-item">
                    <strong>52 Week low</strong>
                    <span>{details.low_52_week}</span>
                </div>
            </div>
        </div>
  );
}

export default StockStats;
