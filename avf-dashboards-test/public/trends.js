//Perform Authentication then update data 
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log("Attempting to bind: " + user.email)
        const mediadb = firebase.firestore();
        const settings = { timestampsInSnapshots: true };
        mediadb.settings(settings);
        var data = [];

        mediadb.collection("/metrics/rapid_pro/IMAQAL/").get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                const docs = { ...doc.data(), id: doc.id };
                data.push(docs);
            });
            update(data)
        });

    } else {
        window.location.replace('index.html')
    }
});

const update = (data) => {

    let operators = new Set()
    
    var dayDateFormat = d3.timeFormat("%Y-%m-%d")	

  // format the data  
  data.forEach(function (d) {
      d.datetime = new Date(d.datetime);
      d.day = dayDateFormat(new Date(d.datetime))
      d.total_received = +d.total_received
      d.total_sent = +d.total_sent
      d.total_pending = +d.total_pending
      d.total_errored = +d.total_errored
      d.NC_received = +d.operators["NC"]["received"]
      d.telegram_received= +d.operators["telegram"]["received"]
      d.golis_received= +d.operators["golis"]["received"]
      d.hormud_received= +d.operators["hormud"]["received"]
      d.nationlink_received= +d.operators["nationlink"]["received"]
      d.somnet_received= +d.operators["somnet"]["received"]
      d.somtel_received= +d.operators["somtel"]["received"]
      d.telesom_received= +d.operators["telesom"]["received"]
      d.golis_sent= +d.operators["golis"]["sent"]
      d.hormud_sent= +d.operators["hormud"]["sent"]
      d.nationlink_sent= +d.operators["nationlink"]["sent"]
      d.somnet_sent= +d.operators["somnet"]["sent"]
      d.somtel_sent= +d.operators["somtel"]["sent"]
      d.telesom_sent= +d.operators["telesom"]["sent"]
      d.telegram_sent= +d.operators["telegram"]["sent"]
      d.NC_sent = +d.operators["NC"]["sent"]
      Object.keys(d.operators).sort().forEach(function(key) {
          if (!(key in operators)) {
              operators.add(key)
          };
      });
  });

    // Sort data by date
    data.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    // Group received data by day
    var dailyTotal = d3.nest()
        .key(function(d) { return d.day; })
        .rollup(function(v) { return {
            NC_received: d3.sum(v, function(d) {return d.NC_received}),
            telegram_received: d3.sum(v, function(d) {return d.telegram_received}),
            hormud_received: d3.sum(v, function(d) {return d.hormud_received}),
            nationlink_received: d3.sum(v, function(d) {return d.nationlink_received}),
            somnet_received: d3.sum(v, function(d) {return d.somnet_received}),
            somtel_received: d3.sum(v, function(d) {return d.somtel_received}),
            telesom_received: d3.sum(v, function(d) {return d.telesom_received}),
            golis_received: d3.sum(v, function(d) {return d.golis_received}),
            total_received: d3.sum(v, function(d) {return d.total_received}),
            NC_sent: d3.sum(v, function(d) {return d.NC_sent}),
            telegram_sent: d3.sum(v, function(d) {return d.telegram_sent}),
            hormud_sent: d3.sum(v, function(d) {return d.hormud_sent}),
            nationlink_sent: d3.sum(v, function(d) {return d.nationlink_sent}),
            somnet_sent: d3.sum(v, function(d) {return d.somnet_sent}),
            somtel_sent: d3.sum(v, function(d) {return d.somtel_sent}),
            telesom_sent: d3.sum(v, function(d) {return d.telesom_sent}),
            golis_sent: d3.sum(v, function(d) {return d.golis_sent}),
            total_sent: d3.sum(v, function(d) {return d.total_sent})
        };
    })
    .entries(data);

    // Flatten nested data for stacking
    for (var entry in dailyTotal) {
        var valueList = dailyTotal[entry].value
        for (var key in valueList) {
            dailyTotal[entry][key] = valueList[key]
        }
        dailyTotal[entry]["day"] = dailyTotal[entry].key
        delete dailyTotal[entry]["value"]
        delete dailyTotal[entry]["key"]
    }

    itemsNotFormatted = dailyTotal

    function convertToCSV(objArray) {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = '';

        for (var i = 0; i < array.length; i++) {
            var line = '';
            for (var index in array[i]) {
                if (line != '') line += ','

                line += array[i][index];
            }

            str += line + '\r\n';
        }

        return str;
    }

    function exportCSVFile(headers, items, fileTitle) {
        if (headers) {
            items.unshift(headers);
        }

        // Convert Object to JSON
        var jsonObject = JSON.stringify(items);

        var csv = convertToCSV(jsonObject);

        var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, exportedFilenmae);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", exportedFilenmae);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    var headers = {
        // model: 'Phone Model'.replace(/,/g, ''), // remove commas to avoid errors
        type: "type",
        day: "Day",
        NC_received: "NC_received",
        telegram_received: "telegram_received",
        hormud_received: "hormud_received",
        nationlink_received: "nationlink_received",
        somnet_received: "somnet_received",
        somtel_received: "somtel_received",
        telesom_received: "telesom_received",
        golis_received: "golis_received",
        total_received: "total_received",
        NC_sent: "NC_sent",
        telegram_sent: "telegram_sent",
        hormud_sent: "hormud_sent",
        nationlink_sent: "nationlink_sent",
        somnet_sent: "somnet_sent",
        somtel_sent: "somtel_sent",
        telesom_sent: "telesom_sent",
        golis_sent: "golis_sent",
        total_sent: "total_sent",
    };

  var itemsFormatted = [];

  // format the data
  itemsNotFormatted.forEach((item) => {
      itemsFormatted.push({
          type: "IMAQAL",
          day: item.day,
          NC_received: item.NC_received,
          telegram_received: item.telegram_received,
          hormud_received: item.hormud_received,
          nationlink_received: item.nationlink_received,
          somnet_received: item.somnet_received,
          somtel_received: item.somtel_received,
          telesom_received: item.telesom_received,
          golis_received: item.golis_received,
          total_received: item.total_received,
          NC_sent: item.NC_sent,
          telegram_sent: item.telegram_sent,
          hormud_sent: item.hormud_sent,
          nationlink_sent: item.nationlink_sent,
          somnet_sent: item.somnet_sent,
          somtel_sent: item.somtel_sent,
          telesom_sent: item.telesom_sent,
          golis_sent: item.golis_sent,
          total_sent: item.total_sent,
          // model: item.model.replace(/,/g, ''), // remove commas to avoid errors
      });
  });

  var fileTitle = 'trends'; // or 'my-unique-title'

  document.querySelector("#download_data").addEventListener('click', function() {
    exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
  });
}


// set the dimensions and margins of the graph
var margin = {top: 30, right: 50, bottom: 30, left: 50},
    width = 1250 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// parse the date / time
var parseTime = d3.timeParse("%d-%b-%y");

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the lines
var valueline = d3.line().x(d => x(d.Day)).y(d => y(d.NC_received));
var valueline2 = d3.line().x(d => x(d.Day)).y(d => y(d.telegram_received));
var valueline3 = d3.line().x(d => x(d.Day)).y(d => y(d.hormud_received));
var valueline4 = d3.line().x(d => x(d.Day)).y(d => y(d.golis_received));
var valueline5 = d3.line().x(d => x(d.Day)).y(d => y(d.nationlink_received));
var valueline6 = d3.line().x(d => x(d.Day)).y(d => y(d.somnet_received));
var valueline7 = d3.line().x(d => x(d.Day)).y(d => y(d.somtel_received));
var valueline8 = d3.line().x(d => x(d.Day)).y(d => y(d.telesom_received));

// define the lines
var sent = d3.line().x(d => x(d.Day)).y(d => y(d.NC_sent));
var sent2 = d3.line().x(d => x(d.Day)).y(d => y(d.telegram_sent));
var sent3 = d3.line().x(d => x(d.Day)).y(d => y(d.hormud_sent));
var sent4 = d3.line().x(d => x(d.Day)).y(d => y(d.golis_sent));
var sent5 = d3.line().x(d => x(d.Day)).y(d => y(d.nationlink_sent));
var sent6 = d3.line().x(d => x(d.Day)).y(d => y(d.somnet_sent));
var sent7 = d3.line().x(d => x(d.Day)).y(d => y(d.somtel_sent));
var sent8 = d3.line().x(d => x(d.Day)).y(d => y(d.telesom_sent));

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var svg2 = d3.select("#chart2").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");


// Get the data
d3.csv("trends.csv", function(error, data) {
  if (error) throw error;

  // format the data
  data.forEach(function(d) {
    d.Day = new Date(d.Day);
    d.NC_received = +d.NC_received;
    d.telegram_received = +d.telegram_received;
    d.hormud_received = +d.hormud_received;
    d.golis_received = +d.golis_received;
    d.nationlink_received = +d.nationlink_received;
    d.somnet_received = +d.somnet_received;
    d.somtel_received = +d.somtel_received;
    d.telesom_received = +d.telesom_received;
  });

  // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return d.Day; }));
  y.domain([0, d3.max(data, function(d) {
      return Math.max(d.NC_received, d.telegram_received,
        d.hormud_received, d.golis_received, d.nationlink_received, d.somnet_received,
        d.somtel_received, d.telesom_received); })]);

  // Add the valuelines path.
  svg.append("path").data([data]).style("stroke", "black").attr("class", "line").attr("d", valueline);
  svg.append("path").data([data]).attr("class", "line").style("stroke", "red").attr("d", valueline2);
  svg.append("path").data([data]).attr("class", "line").style("stroke", "blue").attr("d", valueline3);
  svg.append("path").data([data]).attr("class", "line").style("stroke", "green").attr("d", valueline4);
  svg.append("path").data([data]).attr("class", "line").style("stroke", "brown").attr("d", valueline5);
  svg.append("path").data([data]).attr("class", "line").style("stroke", "yellow").attr("d", valueline6);
  svg.append("path").data([data]).attr("class", "line").style("stroke", "purple").attr("d", valueline7);
  svg.append("path").data([data]).attr("class", "line").style("stroke", "orange").attr("d", valueline8);
  // Total incoming Sms(s) graph title
  svg.append("text").attr("x", (width / 2)).attr("y", 0 - (margin.top / 2)).attr("text-anchor", "middle")
  .style("font-size", "20px")
  .style("text-decoration", "bold")
  .text("IMAQAL - Total Incoming Messages(s)"); 

  // Add the X Axis
  svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x));

  // Add the Y Axis
  svg.append("g").call(d3.axisLeft(y));

    // Handmade legend
    svg.append("circle").attr("cx",1100).attr("cy",40).attr("r", 8).style("fill", "black")
    svg.append("circle").attr("cx",1100).attr("cy",60).attr("r", 8).style("fill", "red")
    svg.append("circle").attr("cx",1100).attr("cy",80).attr("r", 8).style("fill", "blue")
    svg.append("circle").attr("cx",1100).attr("cy",100).attr("r", 8).style("fill", "green")
    svg.append("circle").attr("cx",1100).attr("cy",120).attr("r", 8).style("fill", "brown")
    svg.append("circle").attr("cx",1100).attr("cy",140).attr("r", 8).style("fill", "yellow")
    svg.append("circle").attr("cx",1100).attr("cy",160).attr("r", 8).style("fill", "purple")
    svg.append("circle").attr("cx",1100).attr("cy",180).attr("r", 8).style("fill", "orange")
    svg.append("text").attr("x", 1010).attr("y", 45).text("NC").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 1010).attr("y", 65).text("telegram").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 1010).attr("y", 85).text("hormud").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 1010).attr("y", 105).text("golis").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 1010).attr("y", 125).text("nationlink").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 1010).attr("y", 145).text("somnet").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 1010).attr("y", 165).text("somtel").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 1010).attr("y", 185).text("telesom").style("font-size", "15px").attr("alignment-baseline","middle")

});


// Get the data
d3.csv("trends.csv", function(error, data) {
    if (error) throw error;
  
    // format the data
    data.forEach(function(d) {
        d.Day = new Date(d.Day);
        d.NC_sent = +d.NC_sent;
        d.telegram_sent = +d.telegram_sent;
        d.hormud_sent = +d.hormud_sent;
        d.golis_sent = +d.golis_sent;
        d.nationlink_sent = +d.nationlink_sent;
        d.somnet_sent = +d.somnet_sent;
        d.somtel_sent = +d.somtel_sent;
        d.telesom_sent = +d.telesom_sent;
    });
  
    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.Day; }));
    y.domain([0, d3.max(data, function(d) {
        return Math.max(d.NC_sent, d.telegram_sent,
          d.hormud_sent, d.golis_sent, d.nationlink_sent, d.somnet_sent,
          d.somtel_sent, d.telesom_sent); })]);
  
    // Add the valuelines path.
    svg2.append("path").data([data]).style("stroke", "black").attr("class", "line").attr("d", sent);
    svg2.append("path").data([data]).attr("class", "line").style("stroke", "red").attr("d", sent2);
    svg2.append("path").data([data]).attr("class", "line").style("stroke", "blue").attr("d", sent3);
    svg2.append("path").data([data]).attr("class", "line").style("stroke", "green").attr("d", sent4);
    svg2.append("path").data([data]).attr("class", "line").style("stroke", "brown").attr("d", sent5);
    svg2.append("path").data([data]).attr("class", "line").style("stroke", "yellow").attr("d", sent6);
    svg2.append("path").data([data]).attr("class", "line").style("stroke", "purple").attr("d", sent7);
    svg2.append("path").data([data]).attr("class", "line").style("stroke", "orange").attr("d", sent8);
  
    // Add the X Axis
    svg2.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x));
  
    // Add the Y Axis
    svg2.append("g").call(d3.axisLeft(y));
  
      // Handmade legend
      svg2.append("circle").attr("cx",1100).attr("cy",40).attr("r", 8).style("fill", "black")
      svg2.append("circle").attr("cx",1100).attr("cy",60).attr("r", 8).style("fill", "red")
      svg2.append("circle").attr("cx",1100).attr("cy",80).attr("r", 8).style("fill", "blue")
      svg2.append("circle").attr("cx",1100).attr("cy",100).attr("r", 8).style("fill", "green")
      svg2.append("circle").attr("cx",1100).attr("cy",120).attr("r", 8).style("fill", "brown")
      svg2.append("circle").attr("cx",1100).attr("cy",140).attr("r", 8).style("fill", "yellow")
      svg2.append("circle").attr("cx",1100).attr("cy",160).attr("r", 8).style("fill", "purple")
      svg2.append("circle").attr("cx",1100).attr("cy",180).attr("r", 8).style("fill", "orange")
      svg2.append("text").attr("x", 1010).attr("y", 45).text("NC").style("font-size", "15px").attr("alignment-baseline","middle")
      svg2.append("text").attr("x", 1010).attr("y", 65).text("telegram").style("font-size", "15px").attr("alignment-baseline","middle")
      svg2.append("text").attr("x", 1010).attr("y", 85).text("hormud").style("font-size", "15px").attr("alignment-baseline","middle")
      svg2.append("text").attr("x", 1010).attr("y", 105).text("golis").style("font-size", "15px").attr("alignment-baseline","middle")
      svg2.append("text").attr("x", 1010).attr("y", 125).text("nationlink").style("font-size", "15px").attr("alignment-baseline","middle")
      svg2.append("text").attr("x", 1010).attr("y", 145).text("somnet").style("font-size", "15px").attr("alignment-baseline","middle")
      svg2.append("text").attr("x", 1010).attr("y", 165).text("somtel").style("font-size", "15px").attr("alignment-baseline","middle")
      svg2.append("text").attr("x", 1010).attr("y", 185).text("telesom").style("font-size", "15px").attr("alignment-baseline","middle")
      // Total incoming Sms(s) graph title
    svg2.append("text").attr("x", (width / 2)).attr("y", 0 - (margin.top / 2)).attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("text-decoration", "bold")
    .text("IMAQAL - Total Outgoing Messages(s)"); 
  
  });