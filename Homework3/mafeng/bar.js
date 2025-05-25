// want to allow this function to be called in the main.js
export function barchart(data, svg, width, height, heatWidth, heatHeight, colName) {

    const barsvg = svg.append('g')
        .attr('id', 'barsvg') 
         .attr('transform', `translate(${heatWidth + 140}, ${heatHeight + 100})`); // position and location of the graph
    
    /**
     * This funciton will update to be a bar chart given the column name.
     * @param {*} colName The column name we want the bar chart to be updated by.
     */     
    function updateBarbyColumn(colName) {
        barsvg.selectAll('*').remove(); //
    
        const barCounts = new Map(); // new map to count number of occurrences of each row for the column
            for (const row of data) { // look into each row of the data
                const column = row[colName]; // check if the body style is correctly matched is equal
                if (!column) continue;
                barCounts.set(column, (barCounts.get(column) || 0) + 1); // add one to count if it is not in a body style, make new count for body style
            }

        // This gives the counts according to the different body styles and sorts them to use later.
        const countData = Array.from(barCounts.entries())
            .map(([colCategory, value]) => ({colCategory , value}))  // name and value to plot later
            .sort((a, b) => d3.descending(a.value, b.value)); //
            // console.log(countData)

        const color = d3.scaleOrdinal() 
                // .domain(countData.map(d => d.colCategory))
                .domain([0, d3.max(countData, d => d.value)])  
                .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), countData.length).reverse());

        const yScale = d3.scaleBand()
            .domain(countData.map(d => d.colCategory))
            .range([0, heatHeight * 0.5]) // changes how tall the graph is
            .padding(0.2);

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(countData, d => d.value)]) // from 0 to the max count
            .range([0, heatWidth * 0.7]);  // changes how wide the graph is

        // make a new const for the bars
        const bars = barsvg.selectAll('.bar')
            .data(countData)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('y', (d, i) => yScale(d.colCategory))
            .attr('width', 0) // Start width at 0 for animation
            .attr('height', yScale.bandwidth())
            .attr('fill', d => color(d.value))
            .style('stroke', 'white')
            .transition()
            .duration(1000)
            .attr('width', d => xScale(d.value)); // transition the bar growth

         /** Transitions for the Bars*/
        // This transitions the bars to the length of which the count frequency is
        bars.transition()
            .duration(1000)
            .attr('width', d => xScale(d.value));

        // create x axis
        const xAxis = d3.axisBottom(xScale)
            .ticks(5)
            .tickFormat(d3.format(".0f"));
        // creatr y axis 
        const yAxis = d3.axisLeft(yScale);

        // x axis group and location
        barsvg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${heatHeight * 0.5})`) // Position the x-axis at the bottom of the chart
            .call(xAxis);

        // y axis group and location
        barsvg.append('g')
            .attr('transform', `translate(0,  0)`)
            .call(d3.axisLeft(yScale)); 

         // x axis title
        barsvg.append('text')
            // .transition('all 1s ease-out;')
            // .duration(1000)
            .attr('transform', `translate(${(heatWidth * 0.7) / 2}, ${heatHeight * 0.4 + 70})`) 
            .attr('text-anchor', 'middle')
            .text('Frequency')
            .style('font-size', 12)
            .attr('font-family', 'sans-serif');
        // y axis title
        barsvg.append('text')
            .attr('transform', `translate(${(heatWidth * 0.7) - 450}, ${heatHeight * 0.4 - 165})`) // Position label above the y-axis
            .attr('text-anchor', 'middle')
            .text(`${colName}`)
            .style('font-size', 12)
            .attr('font-family', 'sans-serif');
        // title 
        barsvg.append('text')
            .attr('class', 'title')
            .attr('transform', `translate(${(heatWidth * 0.7) / 2}, ${heatHeight * 0.4 - 180})`)
            .attr('text-anchor', 'middle')
            .style('font-weight', 'bold')
            .style('font-size', '16px')
            .attr('font-family', 'sans-serif')
            .text(`Bar Chart: Frequency of Pokemon ${colName}`);
    }

    return updateBarbyColumn(colName);
}
