import React from 'react';
import './about.css';

function About({details}) {
  return (
    <div class="about-container">
        <div class="about-box title">About</div>
        <div class="about-box company-desc">
            {details.description} <a href="https://google.com"> Show more </a>
        </div>
        <div class="about-box company-stats">
            <div>
                <strong>CEO</strong>
                <span>{details.ceo}</span>
            </div>
            <div>
                <strong>Employees</strong>
                <span>{details.employees}</span>
            </div>
            <div>
                <strong>Headquarters</strong>
                <span>{details.headquarters}</span>
            </div>
            <div>
                <strong>Founded</strong>
                <span>{details.founded}</span>
            </div>
        </div>
    </div>

  );
}

export default About;
