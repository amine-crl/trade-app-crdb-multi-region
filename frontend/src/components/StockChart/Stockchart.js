import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const Stockchart = ({ currentchartPrice, selectedStock }) => {
  const d3Container = useRef(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    const generateData = () => {
      
      if (isNaN(currentchartPrice) || currentchartPrice <= 0) {
        console.error('Invalid currentchartPrice:', currentchartPrice);
        return [];
      }

      const length = 50;

      const newData = Array.from({ length }, (_, i) => {
        const randomFactor = (Math.random() - 0.5) * 2;
        /* randomness to targer number */
        const targetvalue = currentchartPrice - (0.00 * currentchartPrice);
        const value = targetvalue + randomFactor;

        if (isNaN(value)) {
          console.error('NaN detected at step', i, {
            randomFactor,
            value,
            currentchartPrice,
          });
        }

        return {
          time: i,
          value: value,
        };
      });
      return newData;
    };

    const newData = generateData();
    setData(newData);
  }, [currentchartPrice, selectedStock]);

  useEffect(() => {
    if (d3Container.current && data.length > 0) {
      d3.select(d3Container.current).selectAll('*').remove();

      const margin = { top: 20, right: 30, bottom: 50, left: 40 };
      const width = 1000 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const svg = d3.select(d3Container.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.time)])
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.value) - 5, d3.max(data, d => d.value) + 5])
        .nice()
        .range([height, 0]);

      svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10))
        .append('text')
        .attr('x', width / 2)
        .attr('y', margin.bottom - 10)
        .attr('fill', 'black')
        .text('Time');

      svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).ticks(5).tickSize(-width))
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick:not(:first-of-type) line')
          .attr('stroke-opacity', 0.1)
          .attr('stroke-dasharray', '2,2'))
        .call(g => g.selectAll('.tick text').attr('x', -10).attr('dy', -4));

      const line = d3.line()
        .x(d => x(d.time))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'blue')
        .attr('stroke-width', 2.5)
        .attr('d', line);
    }
  }, [data]);

  return (
    <svg
      className="d3-component"
      ref={d3Container}
    />
  );
};

export default Stockchart;
