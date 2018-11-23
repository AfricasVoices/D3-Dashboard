// append the svg obgect to the demograph class of the page
// moves the svg object to the top left Margin

var statusgraph = d3.select(".statusgraph").append("svg")
   .attr("width", Width + Margin.left + Margin.right)
    .attr("height", Height + Margin.top + Margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + Margin.left + "," + Margin.top + ")"); 


//Formating TimeStamp  
var timeFormat = d3.timeFormat("%H:%M:%S");

  // d3 line path generator
// define the 1st line
const statusline = d3.line()
.curve(d3.curveBasis)	
.x(function(d){ return x(new Date(d.Date))})
.y(function(d) { return y(d.systemup); });

// define the 2nd line
const statusline2 = d3.line()
.curve(d3.curveBasis)
.x(function(d){ return x(new Date(d.Date))})
.y(function(d) { return y(d.systemdown); });

// line path element
const systemuppath = statusgraph.append('path');
const systemdownpath = statusgraph.append('path');

// update function
const systemupdate = (systemdata) => {

     //format the data
systemdata.forEach(function(d) {
  d.Date= new Date(d.Date).toString();
    d.systemup = +d.systemup;
    d.systemdown = +d.systemdown;
  });

  //console.log(systemdata)
 

  systemdata.sort((a,b) => new Date(a.Date) - new Date(b.Date));

  // set scale domains
  x.domain(d3.extent(systemdata, d => new Date(d.Date)));
  y.domain([0, d3.max(systemdata, function(d) {return Math.max(d.systemdown, d.systemup); })]);

  // update path data
        //System Up line 
    systemuppath.data([systemdata])
        .attr("class", "line")
        .attr("d", statusline);
    
        //system Down line
    systemdownpath.data([systemdata])
        .attr("class", "line")
        .style("stroke", "red")
        .attr("d", statusline2);

    // Add the X Axis
statusgraph.append("g")
  .attr("transform", "translate(0," + Height + ")")
  .call(d3.axisBottom(x)
  .ticks(5)
    .tickFormat(timeFormat));
    // X axis label
    statusgraph.append("text")             
    .attr("transform",
            "translate(" + (Width/2) + " ," + 
                        (Height + Margin.top + 10) + ")")
    .style("text-anchor", "middle")
    .text("Date(D:M:Y:T)");
    
    // Add the Y Axis
    statusgraph.append("g")
    .attr("class", "axisSteelBlue")
    .call(d3.axisLeft(y));
  
  //Y axis Label
  statusgraph.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - Margin.left)
        .attr("x",0 - (Height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Status");

        //Female Line label
    statusgraph.append("text")
      .attr("transform", "translate("+(Width+3)+","+ y(systemdata[7].systemdown)+")")
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("fill", "red")
      .text("Down");
        //Male Line label
    statusgraph.append("text")
      .attr("transform", "translate("+(Width+3)+","+ y(systemdata[7].systemup)+")")
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("fill", "steelblue")
      .text("Up");

      // Graph title
    statusgraph.append("text")
        .attr("x", (Width / 2))				
        .attr("y", 0 - (Margin.top / 2))
        .attr("text-anchor", "middle")	
        .style("font-size", "20px") 
        .style("text-decoration", "bold") 	
        .text("System Uptime Graph");

       // Graph title
       statusgraph.append("text")
       .attr("x", (Width / 2))				
       .attr("y", 0 - (Margin.top / 2))
       .attr("text-anchor", "middle")	
       .style("font-size", "20px") 
       .style("text-decoration", "bold") 	
       .text("System Uptime Graph");

   
   var svgContainer = d3.select(".statuscircle")
       .append("svg")
           .attr("width", 400)
           .attr("height", 400);

   //Draw the Circle
   var circle = svgContainer.append("circle")
       .attr("cx", 100)
       .attr("cy", 100)
       .attr("r", 50)
       .attr('fill','green')

};

// data and firestore
var systemdata = [];

dashdb.collection('system status').onSnapshot(res => {

  res.docChanges().forEach(change => {

    const doc = {...change.doc.data(), id: change.doc.id};

    switch (change.type) {
      case 'added':
        systemdata.push(doc);
        break;
      case 'modified':
        const index = systemdata.findIndex(item => item.id == doc.id);
        systemdata[index] = doc;
        break;
      case 'removed':
        systemdata = systemdata.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }

  });

  systemupdate(systemdata);

});

