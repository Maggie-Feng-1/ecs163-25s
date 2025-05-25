// want to allow this function to be called in the main.js
export function heatmap(data, svg, width, height, heatMargin, heatWidth, heatHeight, heatlegendHeight, heatlegendWidth) {
    /**
     * Heatmap
     * The heatmap will show the count for the different type 1 and type 2 pokemon combinations. 
     * I choose to do this because I think it would be interesting to see truly how many combinations there are. 
     * As we see, there are less than I thought, and many pokemon have only one type. However, it does how the more common combinations, which are higher in count.
     */
    // /*** This checks if there is a type 2 for each pokemon, if the pokemon does not have a type 2, we fill it in to indicate there is no type 2. */
    data.forEach(d => {
        if (d.Type_2 === '') d.Type_2 = '(No Type 2)';});

    /**
     * The following gives us the unique types for type 1 and type 2 for each pokemon. */
    const types1 = Array.from(new Set(data.map(d => d.Type_1))).sort(); // gives unique values of the type1 col, has 18
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
    
    /**
     * The following makes the heat map data. We want to connect each type 1 and type 2 combination and count how many pokemons have the combination.
     */
    // from the count combos, we want to separate the string to get the different types
    const heatmapData = Object.entries(countCombos).map(([key, count]) => {
        const [type1, type2] = key.split('-'); // split based on the dash we made earlier to count
            return {type1, type2, count}; // return them all as separate items 
      });

    /**
     * Make the separate svg to add to the svg. The heatmap svg.
     * Originally got the code and had chatgpt help me reformat to fit into the svg container. It was a bit challenging.
     * However, adding the separate svg was helpful when opening on a separate computer browser.
     */
      const heatsvg = svg.append('g')
        .attr('transform', `translate(${heatMargin.left}, ${ height - heatHeight })`);

      // this contains the zooming within the rectangle so there is no overflow of zooming for the user to view.
      heatsvg.append('defs')
        .append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', heatWidth - heatMargin.left - heatMargin.right)  // adjusted width of the zoomable are the viewer can see
        .attr('height', heatHeight - heatMargin.left + 20 ); 
      // make a clipping group so we can cut off the overflow as well
      const clipped = heatsvg.append('g')
        .attr('clip-path', 'url(#clip)')
      // make a chart group to know the viewable heatmap charts the cells.
      const cells = clipped.append('g');
      // the zoom in items are the charted cells group
      cells.selectAll('rect')
        .data(heatmapData)
        .enter()
        .append('rect')

      // store the original lengths of the axis, this will allow us to tranform it as well.
      const originalXRange = [0, heatWidth - heatMargin.left];
      const originalYRange = [0, heatHeight - heatMargin.top - 30];

      // create the x and y scales using the orignal length
      const xScale = d3.scaleBand()
        .domain(types1) // the objects of the axis
        .range(originalXRange) // how long the axis is
        .padding(0.05);
      const yScale = d3.scaleBand()
        .domain(types2)
        .range(originalYRange)
        .padding(0.05);

      const colorScale = d3.scaleLinear() // changed color to red, scale our legend
        .domain([0, d3.max(heatmapData, d => d.count)]) // higher count is a darker color
        .range(['white', 'rgb(249, 0, 0)']);

      // adds cells to the zoomable group
      cells.selectAll('.cell')
          .data(heatmapData)
          .enter()
          .append('rect')
          .attr('class', 'cell')
          .attr('x', d => xScale(d.type1)) // assign 
          .attr('y', d => yScale(d.type2))
          .attr('width', xScale.bandwidth()) // make the bins
          .attr('height', yScale.bandwidth())
          .attr('fill', d => colorScale(d.count))
          .attr('stroke', 'white')
          .attr('stroke-width', 1);

      // adds the count numbers on the cells to the zoomable group
      cells.selectAll('text.count')
          .data(heatmapData)
          .enter()
          .append('text')
          .attr('x', d => xScale(d.type1) + xScale.bandwidth() / 2) // location of text, x
          .attr('y', d => yScale(d.type2) + yScale.bandwidth() / 2) // location of text, y
          .attr('text-anchor', 'middle') // centers text, x position
          .attr('dominant-baseline', 'central') // centers text, y position
          .attr('fill', 'black')  // black text
          .attr('style', 'max-width: 100%; font: 10px sans-serif;')
          .text(d => d.count) // Text is the number of count for specific type 1 and type 2 combination ;

// x axis label
    heatsvg.append('text')
      .attr('class', 'x axis-label')
      .attr('transform', `translate(${(heatWidth - heatMargin.left - heatMargin.right) / 2}, ${heatHeight - heatMargin.top - heatMargin.bottom + 70})`)
      .attr('text-anchor', 'middle')
      .text('Type 1')
      .attr('style', 'max-width: 100%; font: 12px sans-serif;');
// y axis label
    heatsvg.append('text')
      .attr('class', 'y axis-label')
      .attr('transform', `rotate(-90)`) // rotate the y axis title
      .attr('x', -((heatHeight - heatMargin.top - heatMargin.bottom) / 2)) // since rotated, this changes the y position of the axis title
      .attr('y', -50) // since rotated, this changes the x position of the axis title
      .attr('text-anchor', 'middle') // makes sure the text is in the middle height of the graph
      .text('Type 2')
      .attr('style', 'max-width: 100%; font: 12px sans-serif;');

  // graph title
  heatsvg.append('text')
      .attr('class', 'title')
      .attr('transform', `translate(${(heatWidth - heatMargin.left - heatMargin.right) / 2}, -10)`)
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .attr('font-size', 16)
      .attr('font-family', 'sans-serif')
      .text('Frequency of Pokemon Type Combinations: Type 1 vs. Type 2');

// add x axis 
const xAxis = heatsvg.append('g')
    .attr('transform', `translate(0,${heatHeight - 80})`)
    .call(d3.axisBottom(xScale))

// rotate the x axis text
  xAxis.selectAll('text')
    .attr('transform', 'rotate(-45)') // rotating the text
    .style('text-anchor', 'end') // makes sure the text is at the end of the anchor of the x axis scale
    .attr('dx', '-0.8em') // changes the horizontal position of the labels by a tiny bit
    .attr('dy', '0.15em'); 

// add y axis
const yAxis = heatsvg.append('g')
    .attr('transform', `translate(0, 0)`)
    .call(d3.axisLeft(yScale));

// make zoom with boundaries and zooming limitations.
const zoom = d3.zoom()
    .scaleExtent([1, 10])  // how far we let them zoom in, keep 1 to not go beyond the heatmap
    // .translateExtent([[0, 0], [0, 0]])  // // prevents user from panning / locks within heatmap area
    .translateExtent([[0, 0], [heatWidth, heatHeight]]) // the location of the topleft corner
    .extent([[0, 0], [heatWidth, heatHeight]]) 
    .on('zoom', updateZoom); // call zoomed function

// make the zoomable area
heatsvg.append('rect')
    .attr('width', heatWidth - 100) // this changes the recntagle area of which user can zoom in
    .attr('height', heatHeight - 80)
    .style('fill', 'none')
    .style('pointer-events', 'all') // uses the pointer and the zoomin
    .call(zoom); // call zoom function.

/**
 * This function will update the zoom of the cells and the axes.
 * Got some help from the link: https://d3-graph-gallery.com/graph/interactivity_zoom.html and syntax fixing with the help of Chatgpt
 */
function updateZoom(){
   const transform = d3.event.transform; // set the transformation as a variable for easy use.

  cells.attr('transform', transform); // update CElls based on the zoom event.

  // rescale x based on the type1 domains, but keep the original range we had earlier for zoom out.
  // same for y, but we use type2 on the y axis.
  const newX = transform.rescaleX(d3.scaleLinear().domain([0, types1.length]).range(originalXRange));
  const newY = transform.rescaleY(d3.scaleLinear().domain([0, types2.length]).range(originalYRange));

  // add constraints of how far the axes can go for transformation
  const [xMin, xMax] = [newX.invert(0),  newX.invert(heatWidth - heatMargin.left + 100)] // prevents the axis from overflow on top and on the different graphs
  const [yMin,  yMax] = [newY.invert(0), newY.invert(heatHeight - heatMargin.top + 50)]  // top boundary prevents from going into the heatmap // bottom boundary prevent overflow

  // get the labels of the type 1 according to the position and zoom in, then updates the axes
  const xTicks = d3.range(types1.length) // uses the length
    .map(i => ({ pos: newX(i + 0.5), label: types1[i] })) // gets the labels according to position
    .filter(d => d.pos >= 0 && d.pos <= heatWidth);
  // want to get the position of the of where we are zoominging in
  const yTicks = d3.range(types2.length)
    .map(i => ({ pos: newY(i + 0.5), label: types2[i] }))
    .filter(d => d.pos >= 0 && d.pos <=  0.1 + heatHeight);

  // update the axes using the visible axis ticks and changing the domain of them.
  xAxis.call(
    d3.axisBottom(newX.copy() // make new copy to not override oriignal X, because we want to maintain and invert it.
                      .domain([Math.max(xMin, 0), Math.min(xMax, types1.length)])) // constrain the domain within range
      .tickValues(xTicks.map((d, i) => newX.invert(d.pos + 0.5))) // match transform domain
      .tickFormat((_, i) => xTicks[i].label)
  );
  // same thing for y axis
  yAxis.call(
    d3.axisLeft(newY.copy() // 
                    .domain([Math.max(yMin, 0), Math.min(yMax, types2.length)])) // constrain the domain within range
      .tickValues(yTicks.map((d, i) => newY.invert(d.pos + 0.5)))
      .tickFormat((_, i) => yTicks[i].label)
  );
    xAxis.selectAll('text')
    .attr('transform', 'rotate(-45)') // rotating the text
    .style('text-anchor', 'end') // makes sure the text is at the end of the anchor of the x axis scale
    .attr('dx', '-0.8em') // changes the horizontal position of the labels by a tiny bit
    .attr('dy', '0.15em');

}
    
    /**
     * This compares the different counts of type combinations and gets the highest number to use in the legend bar
     */
    const heatmaxCount = d3.max(heatmapData, d => d.count); // get max count for the legend bar

    /**
     * This creates the legend svg and can change the position and location of the legend bar.
     * Got help following this link: https://gist.github.com/vialabdusp/9b6dce37101c30ab80d0bf378fe5e583.
     */
    const heatlegendSvg = heatsvg.append('g') // this adds the legend to the heat svg, so they stay as grouped
      .attr('transform', `translate(${heatWidth - heatMargin.left + 10 }, 0)`); // relative to heatmap group

    // Creating the linear gradient for the legend
    const linearGradient = heatlegendSvg.append('defs')
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%') // makes the gradient vertical up to down
      .attr('x2', '0%')
      .attr('y2', '0%');

    //  the color scheme of the linear gradient 
    linearGradient.selectAll('stop')
      .data([
        { offset: '0%', color: 'white' }, // Gradient from white
        { offset: '100%', color: 'rgb(249, 0, 0)'}]) // make the color scale from white to dark green
      .enter()
      .append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

    //the rectangular shape for the legend.
    heatlegendSvg.append('rect')
      .attr('width', heatlegendWidth)
      .attr('height', heatlegendHeight)
      .style('fill', 'url(#legend-gradient)');

    // scale For the legend, add the legend 
    const heatlegendScale = d3.scaleLinear()
      .domain([0, heatmaxCount])
      .range([heatlegendHeight, 0]);

    const heatlegendAxis = d3.axisRight(heatlegendScale).ticks(5);

    // Adds the axis for the legend
    heatlegendSvg.append('g')
      .attr('transform', `translate(${heatlegendWidth}, 0)`)
      .call(heatlegendAxis);

}
