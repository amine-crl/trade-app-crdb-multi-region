import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header/Header';
import Cart from './components/Cart/Cart';
import About from './components/About/About';
import Stockstats from './components/StockStats/Stockstats';
import Stockchart from './components/StockChart/Stockchart';
import Buyprice from './components/StockChart/Buyprice';
import axios from 'axios';
import './App.css';

function App() {

  const [data, setData] = useState([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentchartPrice, setcurrentchartPrice] = useState(190);
  const [details , setDetails] = useState('');

  /* Backend connect */
  useEffect(() => {
    axios.get('http://localhost:5000/api/data')
      .then(response => setData(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    if (selectedStock) {
      const selectedData = data.find(item => item.symbol === selectedStock);
      if (selectedData) {
        setcurrentchartPrice(selectedData.current_price);
        setCurrentPrice(selectedData.current_price);
        setDetails(selectedData.details);
      }
    }
  }, [selectedStock, data]);

  const handleStockChange = (event) => {
    setSelectedStock(event.target.value);
    updateURL('stock',event.target.value);
  };

  const updateURL = (key, value) => {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url);
    };


  return (
    <Router>
      <div className="app-container">
        <div className="header">
            <Header />
        </div>
        <div className="chart">
          <Buyprice className="price-box" currentPrice={currentPrice}/>
          <Stockchart currentchartPrice={currentchartPrice}/>
        </div>
        <div className="app-box cart">
          <Cart 
            data={data} 
            selectedStock={selectedStock} 
            currentPrice={currentPrice} 
            onStockChange={handleStockChange} 
          />
        </div>
        <div className="about">
          <About details={details}/>
        </div>
        <div className="stats">
          <Stockstats details={details} />
        </div>
      </div>
    </Router>
  );
}

export default App;
