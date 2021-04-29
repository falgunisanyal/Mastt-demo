d3.json("./data/data3.json").then(data => {
  console.log(data);
  data = preProcessor(data);

  draw(data);
});

function draw(data) {
  var color = ["gold", "lightblue", "brown", "lightgreen", "darkblue", "darkviolet"];
  var label = ["Program", "Project", "Read Only", "Standard", "Project Admin", "Organization Admin"];

  var svg = d3
    .select("#viz3")
    .append("svg")
    .attr("width", 960)
    .attr("height", 500);

  var tooltip = d3
    .select("#viz3")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  var legend = svg
    .selectAll(".legend")
    .data(label)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) {
      return "translate(0," + i * 20 + ")";
    });

  legend
    .append("rect")
    .attr("x", 960 - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", (d, i) => color[i]);

  legend
    .append("text")
    .attr("x", 960 - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) {
      return d;
    });

  var simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3
        .forceLink()
        .id(d => {
          return d.id;
        })
        .distance(10)
      //.strenght(0.75)
    )
    .force("charge", d3.forceManyBody().strength(-350))
    .force("collide", d3.forceCollide().radius(30))
    .force("center", d3.forceCenter(480, 300));

  var link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("path")
    .data(data.links)
    .enter()
    .append("svg:path")
    .attr("stroke-width", function(d) {
      return d.weight + "px";
    });

  link.style("fill", "none").style("stroke", "grey");

  var node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(data.nodes)
    .enter()
    .append("g")
    .style("transform-origin", "50% 50%")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  node
    .append("circle")
    .attr("r", d => {
      if (d.type == 0 || d.type == 1) {
        return d.weight;
      } else {
        return 15;
      }
    })
    .attr("fill", d => {
      return color[d.type];
    })
    .attr("stroke", "grey")
    .style("stroke-width", "2px");

  node
    .append("text")
    .attr("class", "nodelabel")
    .attr("x", d => {
      if (d.type == 0 || d.type == 1) {
        return 0;
      } else {
        return -20;
      }
    })
    .attr("font-weight", "bold")
    .attr("text-anchor", "end")
    .style("background-color", "white")
    .style("border-style", "solid")
    .style("border-width", "2px")
    .text(function(d) {
      return d.name;
    });

  simulation.nodes(data.nodes).on("tick", ticked);
  simulation.force("link").links(data.links);

  function ticked() {
    link.attr("d", function(d) {
      var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = 0;
      return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    });

    /*node.selectAll('circle')
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });*/

    node
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
      .on("mouseover", function(d) {
        tooltip
          .transition()
          .duration(100)
          .style("opacity", 1);

        tooltip
          .html(function() {
            if (d.type == 0 || d.type == 1) {
              return d.name;
            } else {
              return d.name + "<br/> Permission: " + label[d.type] + "<br/> Average Activity: " + d.weight + "Hrs";
            }
          })
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 40 + "px");
      })
      .on("mouseout", function(d) {
        tooltip
          .transition()
          .duration(500)
          .style("opacity", 0);
      });
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

function preProcessor(data) {
  var maxValue = -1;

  data.links.forEach(element => {
    if (element.weight > maxValue) {
      maxValue = element.weight;
    }
  });

  var strokeSize = d3
    .scaleLinear()
    .domain([0, maxValue])
    .rangeRound([1, 10]);

  data.links.forEach(element => {
    element.weight = strokeSize(element.weight);
  });

  return data;
}
