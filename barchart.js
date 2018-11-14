// select the svg conatiner first
const svg = d3.select('.canvas')
    .append('svg')
      .attr('width',600)
      .attr('height',600);
 svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", 50)
      .attr("y", 250)
      .text("Sms(s)")

//create margins & dimensions
const margin={top:20, right:20,bottom:100,left:100};
const graphWidth= 600 - margin.left - margin.right;
const graphHeight= 600 - margin.top -margin.bottom;

const graph =svg.append('g')
  .attr('width',graphWidth)
  .attr('height',graphHeight)
  .attr('transform',`translate(${margin.left},${margin.top})`);

  //create axes groups
const xAxisGroup = graph.append('g')
  .attr(`transform`, `translate(0,${graphHeight})`)

const yAxisGroup = graph.append('g');

d3.json('sms.json').then(data => {

  //Setting the y axis scale
  const y = d3.scaleLinear()
    .domain([0,d3.max(data, d => d.sms)])
    .range([graphHeight, 0]);

  //console.log(y(600))
  //Setting the x axis scale

  const x =d3.scaleBand()
    .domain(data.map(item => item.name))
    .range([0,graphWidth])
    .paddingInner(0.2)
    .paddingOuter(0.2);

  // join the data to circs
  const rects = graph.selectAll('rect')
    .data(data);

  // add attrs to circs already in the DOM
  rects.attr('width', x.bandwidth)
    .attr("height", d => graphHeight - y(d.sms))
    .attr('fill', d=>d.fill)
    .attr('x', d => x(d.name));

  // append the enter selection to the DOM
  rects.enter()
    .append('rect')
      .attr('width', x.bandwidth)
      .attr("height", d => graphHeight - y(d.sms))
      .attr('fill', d=>d.fill)
      .attr('x', (d) => x(d.name))
      .attr('y', d => y(d.sms));

// create & call axes
const xAxis = d3.axisBottom(x)
 const yAxis = d3.axisLeft(y)
      .ticks(5)
      .tickFormat(d =>d + ' sms')
xAxisGroup.call(xAxis);
yAxisGroup.call(yAxis);

xAxisGroup.selectAll('text')
    .attr('fill', 'Black')
    .attr('transform','rotate(-40)')
    .attr('text-anchor','end')

});