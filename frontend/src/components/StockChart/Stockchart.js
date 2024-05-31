import React, { useRef,  } from 'react';
import * as d3 from 'd3';

const Stockchart = ({ currentchartPrice }) => {
  const d3Container = useRef(null);

  if (d3Container.current) {
    // Clear the container to ensure no duplicate elements
    d3.select(d3Container.current).selectAll('*').remove();

    // Generate 100 data points with a clear pattern
    const targetFinalValue = currentchartPrice;
    const length = 1825;
    const initialPrevNum = currentchartPrice-(.35*currentchartPrice);
    let prev_num = initialPrevNum;

    const data = Array.from({ length }, (_, i) => {
      // Calculate the remaining steps and the current progress
      const remainingSteps = length - i;
      const progress = (prev_num - initialPrevNum) / (targetFinalValue - initialPrevNum);

      // Adjust the random factor to steer towards the targetFinalValue
      const randomFactor = (Math.random() - 0.5) * 2;
      const adjustment = (1 - progress) * (targetFinalValue - prev_num) / remainingSteps;

      const value = prev_num + randomFactor + adjustment;
      prev_num = value;

      return {
        time: i,
        value: value,
      };
    });

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
      .attr('stroke', d3.hsl(74, 56, 190))
      .attr('stroke-width', 2.5)
      .attr('d', line);
  }

  return (
    <svg
      className="d3-component"
      ref={d3Container}
    />
  );
};

export default Stockchart;
