import React from 'react';
import './buyprice.css';

function Buyprice({ currentPrice }) {

  return (
    <div className="price-box1">
        Buy Price : {currentPrice}
    </div>
  );
}

export default Buyprice;
