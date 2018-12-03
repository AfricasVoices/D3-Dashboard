// select the svg container first
const svg = d3.select('.canvas')
  .append('svg')
    .attr('width', 600)
    .attr('height', 600);
//create the Y label
svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", 50)
    .attr("y", 250)
    .text("Sms(s)") 
// create margins & dimensions
const margin = {top: 20, right: 20, bottom: 100, left: 100};
const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;
const graph = svg.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left}, ${margin.top})`);
// create axes groups
const xAxisGroup = graph.append('g')
  .attr('transform', `translate(0, ${graphHeight})`)
xAxisGroup.selectAll('text')
  .attr('fill', d => d.fill)
  .attr('transform', 'rotate(-40)')
  .attr('text-anchor', 'end');
const yAxisGroup = graph.append('g');
const y = d3.scaleLinear()
    .range([graphHeight, 0]);
const x = d3.scaleBand()
  .range([0, graphWidth])
  .paddingInner(0.2)
  .paddingOuter(0.2);
// create & call axes
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y)
  .ticks(5)
  .tickFormat(d => d + ' sms');
  const t =d3.transition().duration(1500)
// the update function
const update = (data) => {
  // 1. join the data to rects
  const rects = graph.selectAll('rect')
    .data(data);
  //2. remove unwanted rects
  rects.exit().remove();
  //3. update the domains
  y.domain([0, d3.max(data, d => d.sms)]);
  x.domain(data.map(item => item.survey));
  //4. add attrs to rects already in the DOM
  rects.attr('width', x.bandwidth)
    .attr('fill', d => d.fill)
    .attr('x', d => x(d.survey))
    //Transition animation for data update
    .transition().duration(500)
        .attr('height',d => graphHeight - y(d.sms))
        .attr('y', d => y(d.sms)); 
  //4.1 append the enter selection to the DOM
  rects.enter()
    .append('rect')
      .attr('width', 0)
      .attr('height',d => 0)
      .attr('fill', d => d.fill)
      .attr('x', (d) => x(d.survey))
      .attr('y',d =>graphHeight)
      //Transition refactor & Merge
      .merge(rects)
      .transition(t)
        .attrTween('width',widthTween)
        .attr("height", d => graphHeight - y(d.sms))
        .attr('y', d => y(d.sms));
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
};
//5. Configure to update in realtime from firestore
var data = [];
//setting up a realtime listener for smsfeedback collection
smsdb.collection('smsfeedback').onSnapshot(res => {
  res.docChanges().forEach(change => {
    //change spread operator gets the data for each change in the doc
    const doc = {...change.doc.data(), id: change.doc.id};
    switch (change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex(item => item.id == doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }
  });
  update(data);
});
//Tween transition
const widthTween = (d) => {
    let i =d3.interpolate(0, x.bandwidth());
    return function (t){
        return i(t);
    }
};
