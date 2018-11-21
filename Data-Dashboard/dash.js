const margin = { top: 40, right: 60, bottom: 50, left: 70 };
const width = 800 - margin.right - margin.left;
const height = 450 - margin.top - margin.bottom;


//Formating TimeStamp  
var timeFormat = d3.timeFormat("%m-%d-%y %H:%M:%S");


// append the svg obgect to the class canvas1 of the page
// moves the svg object to the top left margin

var svg = d3.select(".canvas1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


// scales
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// update function
const update = (data) => {
     //format the data
  data.forEach(function(d) {
    d.Date = +d.Date.toDate();
    d.male = +d.male;
    d.female = +d.female;
  });
  

  data.sort((a,b) => new Date(a.Date) - new Date(b.Date));

  // set scale domains
  x.domain(d3.extent(data, function(d) { return d.Date; }));
  y.domain([0, d3.max(data, function(d) {return Math.max(d.male, d.female); })]);


  // d3 line path generator
// define the 1st line
const valueline = d3.line()
//.curve(d3.curveCardinal)
.x(function(d) { return x(d.Date); })
.y(function(d) { return y(d.male); });

// define the 2nd line
const valueline2 = d3.line()
//.curve(d3.curveCardinal)
.x(function(d) { return x(d.Date); })
.y(function(d) { return y(d.female); });

  // update path data
        //line 1
    svg.append('path')
        .data([data])
        .attr("class", "line")
        .attr("d", valueline);
    
        //line 2
    svg.append('path')
        .data([data])
        .attr("class", "line")
        .style("stroke", "red")
        .attr("d", valueline2);

    // Add the X Axis
  svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x)
  .ticks(5)
    .tickFormat(timeFormat));
    // X axis label
    svg.append("text")             
    .attr("transform",
            "translate(" + (width/2) + " ," + 
                        (height + margin.top + 10) + ")")
    .style("text-anchor", "middle")
    .text("Date(D:M:Y:T)");
    
    // Add the Y Axis
  svg.append("g")
    .attr("class", "axisSteelBlue")
    .call(d3.axisLeft(y));
  
  //Y axis Label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Sms(s)");
        const yAxis = d3.axisLeft(y)
            .ticks(4)


        //Female Line label
      svg.append("text")
      .attr("transform", "translate("+(width+3)+","+ y(data[7].female)+")")
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("fill", "red")
      .text("Female");
        //Male Line label
      svg.append("text")
      .attr("transform", "translate("+(width+3)+","+ y(data[7].male)+")")
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .style("fill", "steelblue")
      .text("Male");

      // Graph title
        svg.append("text")
        .attr("x", (width / 2))				
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")	
        .style("font-size", "20px") 
        .style("text-decoration", "bold") 	
        .text("Gender SMS Response vs Time");
};

// data and firestore
var data = [];

dashdb.collection('smsresponse').onSnapshot(res => {

  res.docChanges().forEach(change => {

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