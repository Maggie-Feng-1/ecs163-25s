export function parallelcoordinate(data, svg, width, height, parMargin, parWidth, parHeight, parLegendWidth, parLegendHeight) {
  
   /**
   * Parallel Coordinate Plot
   * The next plot is the parallel coordinate plot of the base statistics of the pokemon.
   * I thought this would be interesting to see the trends in the base statistics for the different pokemon.
   * Pokemon lower earlier on in HP generally tend to follow lower base statistics, but ocasionally there is an outlier.
   * The coloring is based on the TOTAL base statistic, which provides the overview. 
   * Got help using the vertical parallel coordinate from observeable: https://observablehq.com/@d3/parallel-coordinates. 
   * Additional help
   */
  const nameCols = ['HP', 'Attack', 'Defense', 'Sp_Atk', 'Sp_Def', 'Speed', 'Total']; // These are the base statistics of each pokemon.
  
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
  
  // Make parallel svg container, will add the things later in the code
  const parSvg = svg.append('g')

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

  // This adds the lines to the parallel coordinates, makes sure they are before the axes creation so they are under the axes
 const pathGroup = parSvg.append('g')
    .attr('transform', 'translate(0, 20)') // shift the lines down to aline withe the axes.
    .attr('fill', 'none')
    .attr('stroke-width', 1) // Can change the stroke width
    .attr('stroke-opacity', 0.7) // Can change the opacity of each stroke line
    .selectAll('path')
    .data(data)
    .join('path')
      .attr('stroke', d => parColor(d[nameCols[6]])) // uses total column to be each stroke
      .attr('d', d => parLine(nameCols.map(key => [key, d[key]]))); // Draw the path for each key and associate base statistic number.


  // make the axes, make a new group to add to parsvg to use for prushing
  const axisGroup = parSvg.append('g')
    .selectAll('g')
    .data(nameCols)
    .join('g')
      .attr('transform', d => `translate(${parX(d)}, 20)`) // moves down the y axes, aligns with the lines
      /**
       * This function adds the rounded white edges on the axes numbers and the axes titles above.
       */
      .each(function(d) {
        d3.select(this).call(d3.axisLeft(parY.get(d))); // adds the different axes for the different base statistics
        })
      .call(g => g.append('text') // The next 5 lines adds the text for the top of the axes, makes it in the middle and makes it the current color
          .attr('y', parMargin.top - 10)
          .attr('x', 0) // controls where the name columns for each base statistic is.
          .attr('text-anchor', 'middle')
          .attr('fill', 'black') // black text
          .text(d => d))
      .call(g => g.selectAll('text') // The next lines adds the surrounding white text around the numbers along the different stat axes, allows better visibility
          .clone(true).lower()
          .attr('fill', 'black')
          .attr('stroke', 'white') // Adds the white around the text
          .attr('stroke-width', 5) // How thick the white around the text is
          .attr('stroke-linejoin', 'round')) // Makes the white shape around the text ROUNDED.
      /**
       * This function that addes the brushing.
       * Got inspiration and help with: https://observablehq.com/@d3/brushable-parallel-coordinates also did some tweaking to fix some errors of synatx with the help of chatgpt.
    
       */
      .each(function(dimension) {
        // draw the axes and the lines creating the parallel corodinates
          const scale = parY.get(dimension); // adds 
          const axis = d3.axisLeft(scale); // adds the axes
          d3.select(this).call(axis);
          d3.select(this).append('g')
            .attr('class', 'brush')
            // adds the brushing
            .call(
              d3.brushY()
                // changes the length of the avialable box selection along the axes
                .extent([[-7, parMargin.top], [8, parHeight - 100]]) // changes size of selection
                .on('brush end', brushed));
              })
    /**
     * This is the brushing function that handles what is selected and shows the section.
     */
    function brushed() {
      const active = new Map();
      // this adds the brushable aspect that selects only the ones in the box
      axisGroup.each(function(dimension) {
          const selections = d3.brushSelection(d3.select(this).select('.brush').node()); // gets the selections
          
          if (selections) {
          const [y0, y1] = selections; // gets the pixel values of the y axes
          active.set(dimension, [ 
              parY.get(dimension).invert(y1), // y-scale for the axes for the top of the brush
              parY.get(dimension).invert(y0)]); // y scale for the bottom of the brush
          }
      })
      // this changes the opactiy of the selected lines in the brush and outside of the brush
      pathGroup.attr('stroke-opacity', d => {
          for (const [dimension, [min, max]] of active.entries()) { // gets the min, max, and the dimension to make the selection on the axes.
            const val = d[dimension]; 
            if (val < min || val > max) return 0.01} // changes opacity of unhighlighted section. smaller the number the less visible.
          return 0.7; // changes opacity of the highlighted selected group.
      });
    }
    
    parSvg.on('dblclick', () => {
    // axisGroup Clear all brushes when double clicking on the axes
    // pathGroupclear all brushes when double clicking on the path lines.
    parSvg.selectAll('.brush') // also works if you double click on any of the lines.
        // can use axisGroup or pathGroup for specific double location clicking to undo the selections.
        .each(function() {
        d3.select(this).call(d3.brushY().move, null);
        });
    // call the brushed() function to apply the same brushing / selection functions.
    brushed();
    });

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
    const parlegendsvg = parSvg.append('g')
    .attr('transform', `translate(${parWidth - parLegendWidth - 40}, ${parHeight + 30})`);

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
    .attr('transform', `translate(-50, -80)`) // location of the legend bar
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
    .attr('transform', `translate(-50, -70)`)
    .call(parlegendAxis);
    // Add a label for the legend.
    parlegendsvg.append('text')
    .attr('transform', `translate(-80, -70)`) // location of text
    // .attr('transform', `translate(555, 350)`) // location of the label for the legend.
    .attr('fill', 'black')
    .attr('font-size', 10)
    .attr('font-family', 'sans-serif')
    .text(nameCols[6]); // Use the 6th in the list we had earlier.
}