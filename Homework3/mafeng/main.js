/**
 * The parallel coordinate plot will allow you to see each pokemons base statisitics. 
 * There is a brushing interaction for the user to select on the axes what domain of statisics they want to see.
 * I wanted to show this because selecting where to focus on can lessen the stress of the overall parallel coordinate, and allow focus.
 * Users can also double click to undo their selections.
 * 
 * The heatmap has the zoom and pan. This allows the user to get a closer look at the heatmap because it's quite large.
 * The dynamics of the axes also move with the zoomin and out.
 * 
 * The bar chart and pie chart allows the user to click a dropdown. The user can select how they want to see the visualization.
 * Also they get to go inbetween more categories. I selected Generation and Color because those columns seemed to categorical.
 * They weren't continuous numbers, so knowing the frequency of each category tells a bit about the overall pokemon family.
 * The transition is switching from between the two charts and the animation of the charts. 
 * This is a view change which is helpful for the user by looking at length and area channels.
 */


import { heatmap } from './heatmap.js';
import { piechart } from './donut.js';
import { parallelcoordinate } from './parallel.js';
import { barchart } from './bar.js'; 

const width = window.innerWidth;
const height = window.innerHeight;

// heatmap charts
const heatMargin = {top: 50, right: 0, bottom: 50, left: 100};
const heatWidth = width * 0.5 - heatMargin.left - heatMargin.right;
const heatHeight = height * 0.5;
const heatlegendWidth = 20;
const heatlegendHeight = heatHeight * 0.5;

// donut chart plots
const pieMargin = {top: 100, bottom: 50};
const pieWidth = width * 0.3;
const pieHeight = height * 0.3;
const pieRadius = Math.min(pieWidth, pieHeight) / 2; // leave space for labels

// parallel coordinate plots
const parMargin = {top: 50, right: 0, bottom: 0, left: 100};
const parWidth = width;
const parHeight = height * 0.55;
const parLegendWidth = 175;
const parLegendHeight = 10;

// create the svg outsid eof the function to be called into the other graphs.
const svg = d3.select('svg')
  .attr('id', 'heatmap')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .attr('preserveAspectRatio', 'xMidYMid meet');

d3.csv('pokemon.csv').then(data => {

  // call the heatmap and parallel functions.
  heatmap(data, svg, width, height, heatMargin, heatWidth, heatHeight, heatlegendHeight, heatlegendWidth); 
  parallelcoordinate(data, svg, width, height, parMargin, parWidth, parHeight, parLegendWidth, parLegendHeight);

  // store hte current chart and catagory for when we need to update on the interaction / animation
  let currChart = 'Bar Chart';
  let currCategory = 'Generation';
  // this will be the element moves later on, we will call the id of the respective container.
  const genBtn = document.getElementById('gen-btn');
  const colorBtn = document.getElementById('color-btn');
  const chartSelect = document.getElementById('chart-selector');

  /**
   * This function will remove the previously selected buttons repective graph.
   * THen it will update to the current selected chart and category depending on the users button clicks and selections.
   */
  function updateChart() {
    // making the transition 
    svg.selectAll('#barsvg, #piesvg')
      .transition()
      .duration(400) // fade out 400 duration
      .style('opacity', 0) // fade to 0
      .remove();

    // make the wait for the transition to fade in the graph
    setTimeout(() => {
      let group; // make a new variable to store the group
      // store the group knowing which selection the user picks
      if (currChart === 'Bar Chart') {
        group = barchart(data, svg, width, height, heatWidth, heatHeight, currCategory);} 
      else { group = piechart(data, svg, width, height, pieMargin, pieWidth, pieHeight, pieRadius, currCategory);}
      
      // make the fade in for the newly stored group that user selected
      group.style('opacity', 0)
        .transition()
        .duration(400) // new group added in 400 duration
        .style('opacity', 1);
    }, 400);} // applies 400 duration

    // make a new event for when users change the category they click on
    chartSelect.addEventListener('change', (e) => {
      currChart = e.target.value; // store the current chart and keep that
      updateChart();}); // call the function we made earlier
    genBtn.addEventListener('click', () => {
      currCategory = 'Generation'; // store current cetagory and will update according to category.
      updateChart();});
    colorBtn.addEventListener('click', () => {
      currCategory = 'Color';
      updateChart();});

      // this clears the previous chart before updating the new one.
      svg.select('#piesvg').remove();
      svg.select('#barsvg').remove();

  updateChart(); // initalize the charts
});


