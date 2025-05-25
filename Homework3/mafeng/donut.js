// want to allow this function to be called in the main.js
export function piechart(data, svg, width, height, pieMargin, pieWidth, pieHeight, pieRadius, colName) {

    /**
     * The following makes the pie svg. This segments for the different body styles.
     */
    // Make the svg for the donut group.
    const piesvg = svg.append('g')
        .attr('id', 'piesvg') 
        // .attr('transform', `translate(${heatWidth + 350}, ${pieHeight + 200})`) // changes horizontal, and vertical position of chart
        .attr('transform', `translate(${width - 500}, ${height - 200})`)

    /**
     * This funciton will update to be a pie given the column name.
     * @param {*} colName The column name we want the pie chart to be updated by.
     */
    function updatePiebyColumn(colName) {
        piesvg.selectAll('*').remove(); // clears the previous chart to make for the other categories.
        
        /**
         * Pie Chart
         * This Pie chart shows the different of the named column name
         * I wanted to show the different body styles and use color and area of sorts to show the different amounts of different pokemon information.
         * Got help using the observable: https://observablehq.com/@d3/donut-chart/2.
         */
        // This looks at the unique values of different column name information and counts the number of occurances.
        const pieCounts = new Map(); // new map to count number of occurrences of each row for the column
        for (const row of data) { // look into each row of the data
            const column = row[colName]; // check if the body style is correctly matched is equal
            if (!column) continue;
            pieCounts.set(column, (pieCounts.get(column) || 0) + 1); // add one to count if it is not in a body style, make new count for body style
        }

        // This gives the counts according to the different body styles and sorts them to use later.
        const countData = Array.from(pieCounts.entries())
            .map(([colCategory, value]) => ({colCategory , value}))  // name and value to plot later
            .sort((a, b) => d3.descending(a.value, b.value)); // sort by the number of occurances, most to least

        // This makes the color scale of the donut chart, making sure there is a color for each of the sectors.
        const color = d3.scaleOrdinal() 
            .domain(countData.map(d => d.colCategory))
            .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), countData.length).reverse());

        // Make the circle according to the different values, and the size using the radius.
        const pie = d3.pie()
            .sort(null)
            .value(d => d.value);

        // Make the arc for the donut, creating the outer and inner size, makes how big the segments are.
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(pieRadius - 1);
        const outerArc = d3.arc() // uses the outside arc of the pie.
            .innerRadius(pieRadius * 0.8)
            .outerRadius(pieRadius * 0.8)

        // Adds the title for the donut chart
        piesvg.append('text')
             .attr('class', 'title')
             .attr('transform', `translate(0, -170)`)
             .attr('text-anchor', 'middle')
             .style('font-weight', 'bold')
             .style('font-size', '16px')
             .attr('font-family', 'sans-serif')
             .text(`Pie Chart: Frequency of Pokemon ${colName}`);

        const slices = piesvg.selectAll('path') 
            .data(pie(countData), d => d.data.colCategory); // key function

        slices.enter() // make the slices of the pie 
            .append('path')
            .attr('fill', d => color(d.data.colCategory))
            .attr('stroke', 'white')
            .attr('stroke-width', 0.5)
            .attr('d', d => {
                const start = { ...d, endAngle: d.startAngle };
                return arc(start);
            })
            // adds the transations of the pie slices coming in
            .transition().duration(1000)
            .attrTween('d', function(d) { // this function returns and makes the arc function of the angles everytime 
                const returnArc = d3.interpolate({ ...d, endAngle: d.startAngle }, d);
                return t => arc(returnArc(t)); //
            })
    
    /**
     * Here we make the polyline annotations for the pie chart.
     * We make the transitions to show it appear.
     * Got help from: https://d3-graph-gallery.com/graph/donut_label.html
     */
    const polyline = piesvg.selectAll('polyline')
        .data(pie(countData), d => d.data.colCategory);

    polyline.enter()
        .append('polyline')
        .attr('stroke', 'black')
        .attr('fill', 'none')
        .attr('stroke-width', 1)
        .attr('points', d => { // this gets the positinos
            const pos = arc.centroid(d); // want to get the positions of the arc
            return [pos, pos, pos]; })
        .transition() // add the transition to show the growth / animation of the polylines
        .duration(1000) // we add the trnasitions to the final position
        .attr('points', function(d) {
            const posA = arc.centroid(d); // and the centering of the line
            const posB = outerArc.centroid(d); // positino of the arc
            const posC = [...posB]; // make position of the labels
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            posC[0] = pieRadius * 1.08 * (midangle < Math.PI ? 1 : -1); // can tweak around to see length of polyline
            return [posA, posB, posC];
        });
        // add the polylines, also got help from the above mentions link
    polyline.enter()
        .append('text')
        .attr('class', 'label')
        .text(d => `${d.data.colCategory} (${d.data.value})`)
        .style('font-size', 10)
        .style('font-family', 'sans-serif')
        .style('text-anchor', d => { // this makes the break of where the angle of the polyline
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            return midangle < Math.PI ? 'start' : 'end';
        })
        .attr('transform', d => {
            const pos = outerArc.centroid(d);
            const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            pos[0] = pieRadius * 1.13 * (midangle < Math.PI ? 1 : -1); // can change he angle here
            return `translate(${pos})`; // we calulate the necessary position of the connecting line
        })
        .style('opacity', 0) // trnsantion to hide line
        .transition()
        .duration(1000)
        .style('opacity', 1); // transition to add the line
    }
    return updatePiebyColumn(colName);
}




