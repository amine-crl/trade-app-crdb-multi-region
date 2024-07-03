import React, { useState } from 'react';
import './cart.css';
import config from "../../config.json";
import axios from 'axios';

function Cart({ data, selectedStock, currentPrice, onStockChange }) {
    const [orderType, setOrderType] = useState(0);
    const [shares, setShares] = useState('');
    const [estimatedCost, setEstimatedCost] = useState(0);
    const [buttonColor, setButtonColor] = useState('#4a38be'); 
    const submitUrl = `http://${config.host}:${config.port}/api/submitOrder`;

    const handleOrderTypeChange = (e) => {
        setOrderType(e.target.value);
        updateURL('orderType', e.target.value);
      };

    const handleSharesChange = (e) => {
        const value = e.target.value;
        setShares(value);
        const cost = value * currentPrice;
        setEstimatedCost(cost.toFixed(2));
        updateURL('shares', value);
        updateURL('estimatedCost', cost.toFixed(2));
      };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const params = {
          stock: selectedStock,
          orderType,
          shares,
          currentPrice,
          estimatedCost,
        };
        try {
            setButtonColor('#0dd1a7');
            const response = await axios.post(submitUrl, params);
            console.log('Order submitted:', response.data);
            setOrderType('');
            setShares('');
            setEstimatedCost('');
            setTimeout(() => {setButtonColor('#4a38be');},1000);
          } catch (error) {
            console.error('Error submitting order:', error);
          }
        };
    
    const updateURL = (key, value) => {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, '', url);
        };

  return (
    <div className='cart-container'>
        <div className='title'>Buy {selectedStock}</div>
            <form className='form-group' onSubmit={handleSubmit}>
                <div className='label-box'>
                    <label className="label" for="order-type">Stock</label>
                        <select className="select" id="order-type" name="order-type" value={selectedStock} onChange={onStockChange}>
                            {data.map((item,index) => (
                                <option key={index} value={item.symbol}>{item.symbol}</option>
                            ))}
                        </select>
                </div>
                <div className='label-box'>
                    <label className="label" for="order-type">Order Type</label>
                        <select className="select" id="order-type" name="order-type" value={orderType} onChange={handleOrderTypeChange}>
                            <option value="buy">BUY</option>
                            <option value="sell">SELL</option>
                        </select>
                </div>
                <div className='label-box'>
                    <label className="label" for="order-type">Shares</label>
                    <input id="shares" name="shares" value={shares} onChange={handleSharesChange} />
                </div>
                <div className='bottom-box'>
                    <label className="label" for="order-type">Market Price</label>
                    <div className="label">{currentPrice}</div>
                </div>
                <div className='est-box'>
                    <label className="label" htmlFor="estimated-cost">Estimated Cost</label>
                    <div className="label">${estimatedCost}</div>
                </div>
                <div className='button-box'>
                    <button type="submit" className='button submit-label' style={{ backgroundColor: buttonColor }}>Submit Order</button>
                </div>
            </form>
     </div>
  );
}

export default Cart;
