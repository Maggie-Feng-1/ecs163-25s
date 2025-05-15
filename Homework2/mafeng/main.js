// for scaling to window browser
const width = window.innerWidth;
const height = window.innerHeight;

// heatmap charts
const heatMargin = {top: 50, right: 0, bottom: 50, left: 100};
const heatWidth = width * 0.5 - heatMargin.left - heatMargin.right;
const heatHeight = height * 0.5;
const heatlegendWidth = 20;
const heatlegendHeight = heatHeight * 0.5;

// donut chart plots
const pieMargin = {top: 50};
const pieWidth = width * 0.4;
const pieHeight = height * 0.4;
const pieRadius = Math.min(pieWidth, pieHeight) / 2; // leave space for labels

// parallel coordinate plots
const parMargin = {top: 50, right: 0, bottom: 0, left: 100};
const parWidth = width;
const parHeight = height * 0.55;
const parLegendWidth = 175;
const parLegendHeight = 10;


// // Set up dimensions and margins for the SVG container
// const heatWidth = 600, heatHeight = 400;
// const heatMargin = {top: 50, right: 0, bottom: 50, left: 100};
// const heatlegendWidth = 20;   
// const heatlegendHeight = 200;  

// const pieWidth = 400, pieHeight = 400;
// const pieMargin = {top: 50};
// const pieRadius = 350 / 2;

// const parWidth = 1500, parHeight = 500;
// const parMargin = {top: 50, right: 0, bottom: 50, left: 100};
// const parLegendWidth = 200;
// const parLegendHeight = 10;

// opening the file to work on
d3.csv('pokemon.csv').then(function(data) {

    /**
     * Heatmap
     * The heatmap will show the count for the different type 1 and type 2 pokemon combinations. 
     * I choose to do this because I think it would be interesting to see truly how many combinations there are. 
     * As we see, there are less than I thought, and many pokemon have only one type. However, it does how the more common combinations, which are higher in count.
     */

    /**
     * This checks if there is a type 2 for each pokemon, if the pokemon does not have a type 2, we fill it in to indicate there is no type 2. */
    data.forEach(d => {
        if (d.Type_2 === '') d.Type_2 = '(No Type 2)';});

    /**
     * The following gives us the unique types for type 1 and type 2 for each pokemon. */
    const types1 = Array.from(new Set(data.map(d => d.Type_1))).sort(); // gives unique values of the type1 col, has 18
    // console.log(types1)
    const types2 = Array.from(new Set(data.map(d => d.Type_2))).sort(); // gives 19 unique values of type2, including no type 2

    /**
     * This function counts the number of occurances for each combination between two columns.
     * @param {*} data This is the csv file
     * @param {*} column1 This is the second column we want to check for combinations
     * @param {*} column2 This is the second column we want to check for combinations in
     * @returns A list of the different combinations of the columns and the count of each combination.
     */
    function countCombinations(data, column1, column2) {
        const combinations = {}; // making an empty to store the combinations
        for (const row of data) { // want to go into each row
          const type1 = row[column1]; // get the string in the first column
          const type2 = row[column2]; // get the string in the second column
          const combination = `${type1}-${type2}`; // make a new combination
          combinations[combination] = (combinations[combination] || 0) + 1; // add combination to existing one, or create a new combination
        }
        return combinations; // the list of combinations and its occurances
      }
    const countCombos = countCombinations(data, 'Type_1', 'Type_2'); //  call the function and get the count of occurances for each combination of pokemon types
    // console.log(countCombos);

    /**
     * The following makes the heat map data. We want to connect each type 1 and type 2 combination and count how many pokemons have the combination.
     */
    // from the count combos, we want to separate the string to get the different types
    const heatmapData = Object.entries(countCombos).map(([key, count]) => {
        const [type1, type2] = key.split('-'); // split based on the dash we made earlier to count
            return {type1, type2, count}; // return them all as separate items 
      });
   
    /** Create the svg for the plots */
    const svg = d3.select('svg')
    .attr('width', width)  // can customize the width to fit to screen.
    .attr('height', height);   // can increase to make vertical scrolling

    /**
     * For the following, I got help from https://d3-graph-gallery.com/graph/heatmap_tooltip.html.
     * This guided me to creating the heatmap.
     */
    
    // Create the x scale for the heat map
    const xScale = d3.scaleBand()
      .range([heatMargin.left, heatWidth - heatMargin.right])
      .domain(types1)
      .padding(0.05); // gaps between the scalings
    // Adds the x scale for the heat map and can change position of where the scale is
    svg.append('g')
      .attr('transform', 'translate(50, 725)') // change position of x scale
      .call(d3.axisBottom(xScale))
    // Rotates the x axis labels for better visibility
    svg.selectAll('text')
        .attr('transform', 'rotate(-45)') // rotating the text
        .style('text-anchor', 'end') // makes sure the text is at the end of the anchor of the x axis scale
        .attr('dx', '-0.8em') // changes the horizontal position of the labels by a tiny bit
        .attr('dy', '0.15em'); // changes the vertical position of the labels by a tiny bit, prevents it from overlapping from x axis
    // Adds the axis title for the x scale the axis names and can change the position
    svg.append('text')
        .attr('class', 'x axis-label')
        .attr('transform', 'translate(400, 775)')
        .attr('text-anchor', 'middle')
        .text('Type 1')
        .attr('style', 'max-width: 100%; font: 12px sans-serif;');

    // Create the y scale for the heat map
    const yScale = d3.scaleBand()
      .range([heatMargin.top, heatHeight - heatMargin.bottom])
      .domain(types2)
      .padding(0.05); // gaps between the scalings
    // Adds the y scale for the heat map and can change the position of where the scale is
    svg.append('g')
      .attr('transform', 'translate(150, 375)') // change position of y scale 
      .call(d3.axisLeft(yScale))
    // Adds the axis title for the y scale names and can change the position
    svg.append('text')
        .attr('class', 'y axis-label')
        .attr('transform', `rotate(-90)`) // roate the y axis title
        .attr('x', -600) // since rotated, this changes the y position of the axis title
        .attr('y', 80) // since rotated, this changes the x position of the axis title
        .attr('text-anchor', 'middle') // makes sure the text is in the middle height of the graph
        .text('Type 2')
        .attr('style', 'max-width: 100%; font: 12px sans-serif;');

    // Adds the title for the overall visualization.
    svg.append('text')
      .attr('class', 'title')
      .attr('transform', `translate(400, 415)`)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('font-size', '16px')
        .attr('font-family', 'sans-serif')
        .text('Frequency of Pokemon Type Combinations: Type 1 vs. Type 2');

    /**
     * This adds the color scale of the heatmaps.
     * The more count of each type 1 and type 2 combination, the darker the color.
     */
    const colorScale = d3.scaleLinear()
        .domain([0, d3.max(heatmapData, d => d.count)])  // min to max counts, max with highest count, min for lowest counts
        .range(['white', '#0d8a08']) // make the color scale from white to dark green

    // This creates the squares for the heat map
    svg.selectAll()
        .data(heatmapData)
        .enter()
        .append('rect')
        .attr('transform', `translate(50, 375)`) // Change position and location of the squares
        .attr('x', d => xScale(d.type1)) // Use the x scale we created earlier for the squares as well
        .attr('y', d => yScale(d.type2)) // Use the y scale we created earlier for the squares as well
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('fill', d => colorScale(d.count)) // Fill the squares with the color scales according to count.
        .attr('class', 'cell');

    // This adds the count of each type combination according to the squares.
    svg.selectAll('text.count')
      .data(heatmapData)
      .enter()
      .append('text')
      .attr('transform', `translate(50, 375)`) // location of the count text
      .attr('class', 'count')
      .attr('x', d => xScale(d.type1) + xScale.bandwidth() / 2) // location of text, x
      .attr('y', d => yScale(d.type2) + yScale.bandwidth() / 2) // location of text, y
      .attr('text-anchor', 'middle') // centers text, x position
      .attr('dominant-baseline', 'central') // centers text, y position
      .attr('fill', 'black')  // black text
      .attr('style', 'max-width: 100%; font: 10px sans-serif;')
      .text(d => d.count); // Text is the number of count for specific type 1 and type 2 combination 

    /**
     * This compares the different counts of type combinations and gets the highest number to use in the legend bar/
     */
    const heatmaxCount = d3.max(heatmapData, d => d.count); // get max count for the legend bar
    /**
     * This creates the legend svg and can change the position and location of the legend bar.
     * Got help following this link: https://gist.github.com/vialabdusp/9b6dce37101c30ab80d0bf378fe5e583.
     */
    const heatlegendSvg = d3.select('svg') // creating the legend and location of the legend
        .append('g')
        .attr('transform', 'translate(620, 50)'); 
    // Creating the linear gradient for the legend, how to format the gradient and the way it flows
    const linearGradient = heatlegendSvg.append('defs') // defining the gradient for the legend svg we created.
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1x', '0%')
      .attr('y1', '100%') // makes color continuous from up to down, the following.
      .attr('x2', '0%') // makes the color continuous from the left to right side of the legend color scale
    // Creating the color scheme of the linear gradient 
    linearGradient.selectAll('stop')
      .data([
          { offset: '0%', color: 'white'}, // Gradient from white
          { offset: '100%', color: '#0d8a08'} // Gradient from green
      ])
      .enter()
      .append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);
    // Creates the rectangular shape for the legend.
    heatlegendSvg.append('rect') 
      .attr('transform', 'translate(80, 375)') // position of the legend 
      .attr('width', heatlegendWidth)
      .attr('height', heatlegendHeight)
      .style('fill', 'url(#legend-gradient)'); // fills the rectangle with the continuous gradient
    // Create the scale for the legend color gradient
    const heatlegendScale = d3.scaleLinear()
        .domain([0, heatmaxCount])
        .range([heatlegendHeight, 0]);  // top to bottom
    // Create the axis for the legend, 5 ticks
    const heatlegendAxis = d3.axisRight(heatlegendScale).ticks(5);
    // Adds the axis for the legend, location of legend axis
    heatlegendSvg.append('g')
        .attr('transform', 'translate(100, 375)') // position of the legend axis
        .call(heatlegendAxis);


  /**
   * Parallel Coordinate Plot
   * The next plot is the parallel coordinate plot of the base statistics of the pokemon.
   * I thought this would be interesting to see the trends in the base statistics for the different pokemon.
   * Pokemon lower earlier on in HP generally tend to follow lower base statistics, but ocasionally there is an outlier.
   * The coloring is based on the TOTAL base statistic, which provides the overview. 
   * Got help using the vertical parallel coordinate from observeable: https://observablehq.com/@d3/parallel-coordinates. 
   * Additional help
   */
  nameCols = ['HP', 'Attack', 'Defense', 'Sp_Atk', 'Sp_Def', 'Speed', 'Total']; // These are the base statistics of each pokemon.
  // Create the x scale for the parallel coordinate
  const parX = d3.scalePoint()
    .domain(nameCols)
    .range([parMargin.left, parWidth - parMargin.right - 100]); // change to fit into page, shows how much of the graph is seen.
  
  // Create the y scale for the parallel coordinate
  const parY = new Map(
    nameCols.map(key => [key, d3.scaleLinear()
      .domain(d3.extent(data, d => +d[key])) // to get the numerics of each column: use +d
      .range([parHeight - parMargin.bottom - 100, parMargin.top])]) // changes how vertically long the graph, 
  );
  
  // Make parallel svg container
  const parSvg = svg.append('g')
    // .attr('transform', `translate(-10, 0)`) // moves vertical and horizontal of graph
    // .attr('width', width)
    // .attr('height', height);
  
  // Make the parallel coordinate color scale. We are using the rainbow color scale and want to use it in terms of the 'Total' base statistic.
   const parColor = d3.scaleSequential(d3.interpolateRainbow)
    .domain(d3.extent(data, d => d[nameCols[6]]));

  /**
   *  Make the parallel lines for each key and value of the column names. This generates one point per key, making the lines for each row.
   */
  const parLine = d3.line()
    .defined(([, value]) => value != null)
    .x(([key]) => parX(key))
    .y(([key, value]) => parY.get(key)(value));

  // This adds the lines to the parallel coordinates
  parSvg.append('g')
    .attr('transform', 'translate(0, 20)') // Moves the lines down
    .attr('fill', 'none')
    .attr('stroke-width', 1) // Can change the stroke width
    .attr('stroke-opacity', 0.7) // Can change the opacity of each stroke line
    .selectAll('path')
    .data(data)
    .join('path')
      .attr('stroke', d => parColor(d[nameCols[6]])) // Color the lines using statistic 'Total' 
      .attr('d', d => parLine(nameCols.map(key => [key, d[key]]))); // Draw the path for each key and associate base statistic number.
    // .append('title')
    //   .text(d => d.name); 

  // This adds the axes and the texts for the axes.
  parSvg.append('g')
    .selectAll('g')
    .data(nameCols)
    .join('g')
      .attr('transform', d => `translate(${parX(d)}, 20)`) // moves down the y axes, aligns with the lines
      .each(function(d) {
        d3.select(this).call(d3.axisLeft(parY.get(d))); // adds the different axes for the different base statistics
      })
      .call(g => g.append('text') // The next 5 lines adds the text for the top of the axes, makes it in the middle and makes it the current color
        .attr('y', parMargin.top - 10)
        .attr('x', 0) // controls where the name columns for each base statistic is.
        .attr('text-anchor', 'middle')
        .attr('fill', 'currentColor')
        .text(d => d))
      .call(g => g.selectAll('text') // The next lines adds the surrounding white text around the numbers along the different stat axes, allows better visibility
        .clone(true).lower()
        .attr('fill', 'none')
        .attr('stroke', 'white') // Adds the white around the text
        .attr('stroke-width', 6) // How thick the white around the text is
        .attr('stroke-linejoin', 'round')); // Makes the white shape around the text ROUNDED.
    
    // This adds the title for the parallel coordinate.
    parSvg.append('text')
      .attr('class', 'title')
      .attr('x', parWidth / 2)
        .attr('y', parMargin.top - 10)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('font-size', '16px')
        .attr('font-family', 'sans-serif')
        .text('Parallel Coordinate of Pokemon Base Statistics');

/**
 * The following makes the legend for the parallel coordinate plot.
 */
const parlegendsvg = d3.select('svg')
  .append('g')
  .attr('transform', `translate(${height - parHeight + 250}, ${parMargin.top - 10})`); // location of legend

// Making the rainbow gradient for the legend
const rainbowGradient = parlegendsvg.append('defs')
  .append('linearGradient')
  .attr('id', 'rainbow-gradient') // use the rainbow we used for the plot
  .attr('x1', '0%') // the following four lines make it so it shows the rainbow gradient, using the full x2 axis, showing the range.
  .attr('y1', '0%')
  .attr('x2', '100%') // make horiztonal linear gradient
  .attr('y2', '0%');

const [parMinScore, parMaxScore] = parColor.domain(); // Get the minimum and maximum score for the color domain we used for the the axes on 'Total' in parColor.

// Adds the gradient and make the color rainbow.
rainbowGradient.selectAll('stop')
  .data(d3.range(10))
  .enter()
  .append('stop')
  .attr('offset', d => `${(d / 10) * 100}%`) // for the rainbow colors, divide by 10
  .attr('stop-color', d => parColor(parMinScore + (d / 10) * (parMaxScore - parMinScore))); // divide by 10 for the rainbow
// Add the rectangle of the legend and the rainbow gradient.
parlegendsvg.append('rect')
  .attr('transform', `translate(580, 340)`) // location of the legend bar
  .attr('width', parLegendWidth)
  .attr('height', parLegendHeight)
  .style('fill', 'url(#rainbow-gradient)');
// Add the parallel coordinate axis scale
const parlegendScale = d3.scaleLinear()
  .domain([parMinScore, parMaxScore]) // Use the minimum and maximum score of the 'Total' column to range our legend.
  .range([0, parLegendWidth]);
// Add the ticks to the legend axis scale.
const parlegendAxis = d3.axisBottom(parlegendScale).ticks(5); // bottom axis, and 5 ticks
// Location of the legend axis scale.
parlegendsvg.append('g')
  .attr('transform', `translate(580, 350)`)
  .call(parlegendAxis);
// Add a label for the legend.
parlegendsvg.append('text')
.attr('transform', `translate(${height - 35}, ${parHeight - 90})`) // location of text
  // .attr('transform', `translate(555, 350)`) // location of the label for the legend.
  .attr('fill', 'black')
  .attr('font-size', 10)
  .attr('font-family', 'sans-serif')
  .text(nameCols[6]); // Use the 6th in the list we had earlier.


/**
 * Donut Chart
 * This donut chart shows the different body styles and the count of each body style for the list of pokemon.
 * I wanted to show the different body styles and use color and area of sorts to show the different amounts of different pokemon body styles.
 * Got help using the observable: https://observablehq.com/@d3/donut-chart/2.
 */
  // This looks at the unique values of different body style and counts the number of occurances.
  const pieCounts = new Map(); // new map to count number of occurrences of each body style
  for (const row of data) { // look into each row of the data
    const bodyStyle = row.Body_Style; // check if the body style is correctly matched is equal
    if (!bodyStyle) continue;
    pieCounts.set(bodyStyle, (pieCounts.get(bodyStyle) || 0) + 1); // add one to count if it is not in a body style, make new count for body style
  }
  // This gives the counts according to the different body styles and sorts them to use later.
  const countData = Array.from(pieCounts.entries())
      .map(([Body_Style, value]) => ({ Body_Style, value}))  // name and value to plot later
    .sort((a, b) => d3.descending(a.value, b.value)); // sort by the number of occurances, most to least
  // console.log(countData)

  // This makes the color scale of the donut chart, making sure there is a color for each of the sectors.
  const color = d3.scaleOrdinal() 
  .domain(countData.map(d => d.Body_Style))
  .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), countData.length).reverse());

  // Make the circle according to the different values, and the size using the radius.
  const pie = d3.pie()
  .sort(null)
  .padAngle(1 / pieRadius)
  .value(d => d.value);
  // Make the arc for the donut, creating the outer and inner size, makes how big the segments are.
  const arc = d3.arc()
  .innerRadius(pieRadius * 0.57) // how big the segments are
  .outerRadius(pieRadius - 1);
  // Gets the different counts for the pie chart.
  const arcs = pie(countData);

  /**
   * The following makes the donut svg. This segments for the different body styles.
   */
  // Make the svg for the donut group.
  const piesvg = svg.append('g')
    // .attr('transform', `translate(${heatWidth + 350}, ${pieHeight + 200})`) // changes horizontal, and vertical position of chart
    .attr('transform', `translate(${width - 500}, ${height - 200})`)
  // Adds each portion path for each value of the body style, adds the CIRCLE with cut sectors.
  piesvg.append('g')
    .attr('stroke', 'white')
    .selectAll()
    .data(arcs) // use the arcs for the different counts.
    .join('path')
      .attr('fill', d => color(d.data.Body_Style)) // Body style for fill colors of each pie part
      .attr('d', arc)
  // Adds the text of each sector of the pie
  piesvg.append('g')
    .attr('text-anchor', 'middle')
    .selectAll()
    .data(arcs)
    .join('text')
    .filter(d => (d.endAngle - d.startAngle) > 0.155)  // change number to see how much of the sectors will be shown visually through text.
    .attr('transform', d => `translate(${arc.centroid(d)})`) // Centers the donut here.
    .call(text => text.append('tspan') // The following next 5 lines adds the text for the different body style.
        .attr('y', '-0.5em') // making the text higher
        .attr('font-weight', 'bold')
        .attr('font-size', 10) // makes body style text size , can adjust
        .attr('font-family', 'sans-serif')
          .text(d => d.data.Body_Style))
    .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.05).append('tspan') // Adds the text for the number of body styles of the given style
         .attr('x', 0)
         .attr('y', '0.7em') // lower the number of the body styles so it doesn't overlap with type text
         .attr('font-size', 9)
         .attr('font-family', 'sans-serif')
         .text(d => d.data.value.toLocaleString('en-US'))); // make the # of body styles as a string, not integer
  
// Adds the title for the donut chart
piesvg.append('text')
  .attr('class', 'title')
  // .attr('transform', `translate(${width}, ${pieMargin.top - 200})`)
  .attr('transform', `translate(0, -170)`)
  .attr('text-anchor', 'middle')
  .style('font-weight', 'bold')
  .style('font-size', '16px')
  .attr('font-family', 'sans-serif')
  .text('Count of Different Pokemon Body Styles');

});

