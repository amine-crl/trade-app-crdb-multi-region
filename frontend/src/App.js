import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header/Header';
import Cart from './components/Cart/Cart';
import About from './components/About/About';
import Stockstats from './components/StockStats/Stockstats';
import Stockchart from './components/StockChart/Stockchart';
import Buyprice from './components/StockChart/Buyprice';
import config from "./config.json";
import axios from 'axios';
import './App.css';
const Decimal = require('decimal.js');

function App() {

  const [data, setData] = useState([]);
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [selectedStockName, setSelectedStockName] = useState('Apple Inc.');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentchartPrice, setcurrentchartPrice] = useState(190);
  const [details , setDetails] = useState('');
  const getUrl = `http://${config.host}:${config.port}/api/data`;

  /* Backend connect */
  /* useEffect(() => {
    axios.get('http://localhost:5000/api/data')
      .then(response => setData(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);*/

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(getUrl);
        setData(response.data);
        // Find the price of the selected stock
        const selectedStockData = response.data.find(stock => stock.symbol === selectedStock);
        if (selectedStockData) {
          const convertedCurrentPrice = new Decimal(selectedStockData.current_price);
          let newPrice;
          newPrice = convertedCurrentPrice
          setcurrentchartPrice(newPrice.toFixed(2));
          setSelectedStockName(selectedStockData.name)
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Fetch data initially
    fetchData();

    // Set up interval to fetch data every 1 seconds
    const interval = setInterval(fetchData, 500);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [selectedStock]);

  useEffect(() => {
    if (selectedStock) {
      const selectedData = data.find(item => item.symbol === selectedStock);
      if (selectedData) {
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
          <Buyprice className="price-box" currentPrice={currentchartPrice} selectedStockName={selectedStockName}/>
          <Stockchart currentchartPrice={currentchartPrice} selectedStock={selectedStock}/>
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
