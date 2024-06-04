import React from 'react';
import './buyprice.css';

function Buyprice({ currentPrice, selectedStockName }) {

  return (
    <div className="price-box1">
        {selectedStockName} {} ${currentPrice}
    </div>
  );
}

export default Buyprice;
