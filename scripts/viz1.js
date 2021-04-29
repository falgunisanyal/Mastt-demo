var width = 1250;
var height = 300;
var margin = 50;
var duration = 250;

var lineOpacity = "0.25";
var lineOpacityHover = "0.85";
var otherLinesOpacityHover = "0.1";
var lineStroke = "1.5px";
var lineStrokeHover = "2.5px";
var lineStrokeNormal = "5px";

var circleOpacity = "0.85";
var circleOpacityOnLineHover = "0.25";
var circleRadius = 3;
var circleRadiusHover = 6;

d3.json("./data/data.json").then(function(data) {
  console.log(data);
  /* Format Data */
  var parseDate = d3.timeParse("%B");
  data.forEach(function(d) {
    d.values.forEach(function(d) {
      d.date = parseDate(d.date);
      d.price = +d.price;
    });
  });

  /* Scale */
  var xScale = d3
    .scaleTime()
    .domain(d3.extent(data[1].values, d => d.date))
    .range([0, width - margin]);

  var yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data[0].values, d => d.price)])
    .range([height - margin - 10, 0]);

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  /* Add SVG */
  var svg = d3
    .select("#viz1")
    .append("svg")
    .attr("width", width + margin + "px")
    .attr("height", height + margin + "px")
    .append("g")
    .attr("transform", `translate(${margin}, ${margin})`);

  const areaGenerator = d3
    .area()
    .x(d => xScale(d.date))
    .y0(height - 50)
    .y1(d => yScale(d.price));

  /* Add line into SVG */
  var line = d3
    .line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.price));

  let lines = svg.append("g").attr("class", "lines");

  lines
    .selectAll(".line-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "line-group")
    .style("stroke-width", lineStrokeNormal)
    .on("mouseover", function(d, i) {
      svg
        .append("text")
        .attr("class", "title-text")
        .style("fill", color(i))
        .text(d.name)
        .attr("text-anchor", "middle")
        .attr("x", (width - margin) / 2)
        .attr("y", -5);
    })
    .on("mouseout", function(d) {
      svg.select(".title-text").remove();
    })
    .append("path")
    .attr("class", "line")
    .attr("id", function(d) {
      return d.name;
    })
    .attr("d", function(d) {
      if (d.name == "Commitments") {
        console.log(d.name);
        return areaGenerator(d.values);
      } else return line(d.values);
    })
    //.attr('d', d => line(d.values))
    //.attr('d', d => areaGenerator(d.values))
    .style("stroke", (d, i) => color(i))
    .style("opacity", lineOpacity)
    .on("mouseover", function(d) {
      d3.selectAll(".line").style("opacity", otherLinesOpacityHover);
      d3.selectAll(".circle").style("opacity", circleOpacityOnLineHover);
      d3.select(this)
        .style("opacity", lineOpacityHover)
        .style("stroke-width", lineStrokeHover)
        .style("cursor", "pointer");
    })
    .on("mouseout", function(d) {
      d3.selectAll(".line").style("opacity", lineOpacity);
      d3.selectAll(".circle").style("opacity", circleOpacity);
      d3.select(this)
        .style("stroke-width", lineStrokeNormal)
        .style("cursor", "none");
    });

  /* Add circles in the line */
  lines
    .selectAll("circle-group")
    .data(data)
    .enter()
    .append("g")
    .style("fill", (d, i) => color(i))
    .selectAll("circle")
    .data(d => d.values)
    .enter()
    .append("g")
    .attr("class", "circle")
    .on("mouseover", function(d) {
      d3.select(this)
        .style("cursor", "pointer")
        .append("text")
        .attr("class", "text")
        .text(`${d.price}`)
        .attr("x", d => xScale(d.date) + 5)
        .attr("y", d => yScale(d.price) - 10);
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .style("cursor", "none")
        .transition()
        .duration(duration)
        .selectAll(".text")
        .remove();
    })
    .append("circle")
    .attr("cx", d => xScale(d.date))
    .attr("cy", d => yScale(d.price))
    .attr("r", circleRadius)
    .style("opacity", circleOpacity)
    .on("mouseover", function(d) {
      d3.select(this)
        .transition()
        .duration(duration)
        .attr("r", circleRadiusHover);
    })
    .on("mouseout", function(d) {
      d3.select(this)
        .transition()
        .duration(duration)
        .attr("r", circleRadius);
    });

  /* Add Axis into SVG */
  var xAxis = d3
    .axisBottom(xScale)
    .tickFormat(d3.timeFormat("%B"))
    .ticks(11);
  var yAxis = d3.axisLeft(yScale).ticks(5);

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height - margin})`)
    .call(xAxis)

    .append("text")
    .attr("class", "xAxisLabel")
    .attr("x", width / 2)
    .attr("y", 50)
    //.attr("transform", "rotate(90)")
    .attr("fill", "#000")
    //.attr("dy", "1em")
    //.style("text-anchor", "middle")
    .text("Months");

  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)

    .append("text")
    .attr("class", "yAxisLabel")
    .attr("x", -80)
    .attr("y", -30)
    .attr("transform", "rotate(-90)")
    .attr("fill", "#000")
    //.attr("dy", "1em")
    //.style("text-anchor", "middle")
    .text("Total Value");

  var today = new Date();

  // var dd = today.getDate();    //<<===== no need
  // var mm = today.getMonth()+1; //January is 0!   //<<===== no need
  // var yyyy = today.getFullYear();  //<<===== no need

  //const month = today.toLocaleString("default", { month: "long" });
  const month = "October";

  svg
    .append("line")
    .attr("x1", xScale(parseDate(month)))
    .attr("x2", xScale(parseDate(month)))
    .attr("y1", 0)
    .attr("y2", height - margin)
    .style("stroke-width", 2)
    .style("stroke", "grey");

  var legendName = ["Budget", "Forecast", "Current Contract", "Commitments"];

  var legend = svg
    .selectAll(".legend")
    .data(legendName)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) {
      return "translate(0," + i * 20 + ")";
    });

  legend
    .append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", (d, i) => color(i));

  legend
    .append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) {
      return d;
    });
});
