const Margin = { top: 40, right: 60, bottom: 50, left: 70 };
const Width = 800 - Margin.right - Margin.left;
const Height = 450 - Margin.top - Margin.bottom;
// append the svg obgect to the demograph class of the page
// moves the svg object to the top left Margin
var surveygraph = d3.select(".surveygraph").append("svg")
   .attr("width", Width + Margin.left + Margin.right)
    .attr("height", Height + Margin.top + Margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + Margin.left + "," + Margin.top + ")"); 
          //Formating TimeStamp  
var timeFormat = d3.timeFormat("%m-%d-%y %H:%M:%S");
// scales
const x = d3.scaleTime().range([0, Width]);
const y = d3.scaleLinear().range([Height, 0]);
// d3 line path generator
// define the 1st line
const valueline = d3.line()
  .curve(d3.curveBasis)	
  .x(function(d){ return x(new Date(d.Date))})
  .y(function(d) { return y(d.Qn1); });
// define the 2nd line
const valueline2 = d3.line()
  .curve(d3.curveBasis)
  .x(function(d){ return x(new Date(d.Date))})
  .y(function(d) { return y(d.Qn2); });
// line path element
const Qn1path = surveygraph.append('path');
const Qn2path = surveygraph.append('path');
// update realtime data from firestore 
const update = (data) => {
     //format the data  
  data.forEach(function(d) {
      d.Date= new Date(d.Date).toString();
      d.Qn1 = +d.Qn1;
      d.Qn2 = +d.Qn2;
  }); 
  data.sort((a,b) => new Date(a.Date) - new Date(b.Date));
  // set scale domains
  //x.domain(d3.extent(data, function(d) { return d.Date; }));
  x.domain(d3.extent(data, d => new Date(d.Date)));
  y.domain([0, d3.max(data, function(d) {return Math.max(d.Qn1, d.Qn2); })]);
  // update path data
        //line 1
      Qn1path.data([data])
        .attr("class", "line")
        .attr("d", valueline);    
        //line 2
      Qn2path.data([data])
        .attr("class", "line")
        .style("stroke", "red")
        .attr("d", valueline2);
    // Add the X Axis
    surveygraph.append("g")
      .attr("transform", "translate(0," + Height + ")")
      .call(d3.axisBottom(x)
      .ticks(5)
        .tickFormat(timeFormat));
    // X axis label
    surveygraph.append("text")             
      .attr("transform",
              "translate(" + (Width/2) + " ," + 
                          (Height + Margin.top + 10) + ")")
      .style("text-anchor", "middle")
      .text("Date(D:M:Y:T)");    
    // Add the Y Axis
    surveygraph.append("g")
      .attr("class", "axisSteelBlue")
      .call(d3.axisLeft(y));  
    //Y axis Label
    surveygraph.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - Margin.left)
      .attr("x",0 - (Height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Sms(s)");
        //Qn2 Line label
    surveygraph.append("text")
      .attr("transform", "translate("+(Width+3)+","+ y(data[4].Qn2)+")")
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("fill", "red")
      .text("Qn2");
        //Qn1 Line label
    surveygraph.append("text")
      .attr("transform", "translate("+(Width+3)+","+ y(data[4].Qn1)+")")
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("fill", "steelblue")
      .text("Qn1");
      // Graph title
    surveygraph.append("text")
        .attr("x", (Width / 2))				
        .attr("y", 0 - (Margin.top / 2))
        .attr("text-anchor", "middle")	
        .style("font-size", "20px") 
        .style("text-decoration", "bold") 	
        .text("MAAP Survey Questions Response");
};
// fetching data from firestore in real time
var data = [];
  dashdb.collection('surveyresponse').onSnapshot(res => {
    //retrieve all the document changes
    res.docChanges().forEach(change => {
      //spreading the properties of the changed data into the new document
      const doc = {...change.doc.data(), id: change.doc.id};
      //updating data for each change type 
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

