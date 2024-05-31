import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';
import Searchbar from './HeaderComponents/SearchBar/Searchbar';
import Navbar from './HeaderComponents/NavBar/Navbar';
import logo from "../../assets/logo-hum-app.png";

function Header() {
  return (
    <div className='container'>
      <div className='logo-container'>
        <img src={logo} className="logo" />
      </div>
      <div className='search'>
        <Searchbar />
      </div>
      <div className='navbar'>
        <Navbar />
      </div>
    </div>
  );
}

export default Header;
