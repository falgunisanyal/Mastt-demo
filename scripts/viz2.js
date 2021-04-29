$(document).ready(() => {
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/claim",
    async: "false",
    success: response => {
      var data = response.data;
      data = preprocessor(data);
      //console.log(response.data);
      draw(data);
    },
    error: () => {
      d3.json("./data/data2.json").then(data => {
        data = preprocessor(data);
        //console.log(data);
        draw(data);
      });
    }
  });
});

d3.json("data2.json").then(data => {});

const date = new Date();

function draw(data) {
  var color = ["lightgrey", "#80bfff", "yellow", "orange", "lightgreen", "red"];
  var label = ["Draft", "Submitted", "Approved", "Late Approved", "Paid", "Rejected"];

  var svg = d3
    .select("#viz2")
    .append("svg")
    .attr("width", 1024)
    .attr("height", 400);

  var tooltip = d3
    .select("#viz2")
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

  var horizontalLine = svg
    .append("line")
    .attr("x1", 12)
    .attr("x2", 990)
    .attr("y1", 300)
    .attr("y2", 300)
    .attr("stroke-linecap", "round")
    .attr("stroke", "grey")
    .style("stroke-width", 4);

  for (i = 1; i < 5; i++) {
    svg
      .append("line")
      .attr("x1", i * 200)
      .attr("x2", i * 200)
      .attr("y1", 150)
      .attr("y2", 350)
      .attr("stroke-linecap", "round")
      .attr("stroke", "grey")
      .style("stroke-width", 4);
  }

  svg
    .append("text")
    .attr("x", 500)
    .attr("y", 380)
    .attr("text-anchor", "middle")
    .text("Claims Overview")
    .style("font-weight", "bold")
    .style("font-size", "16px");

  var draftNodes = [];
  var submittedNodes = [];
  var approvedNodes = [];
  var paidNodes = [];
  var rejectedNodes = [];

  data.forEach(element => {
    switch (element.status) {
      case "DRAFT":
        draftNodes.push(element);
        break;
      case "SUBMITTED":
        submittedNodes.push(element);
        break;
      case "APPROVED":
        approvedNodes.push(element);
        break;
      case "PAID":
        paidNodes.push(element);
        break;
      case "REJECTED":
        rejectedNodes.push(element);
        break;
    }
  });

  drawChart("Draft", svg, draftNodes, 0, "blue", tooltip);
  drawChart("Submitted", svg, submittedNodes, 1, "yellow", tooltip);
  drawChart("Approved", svg, approvedNodes, 2, "orange", tooltip);
  drawChart("Paid", svg, paidNodes, 3, "green", tooltip);
  drawChart("Rejected", svg, rejectedNodes, 4, "red", tooltip);
}

function drawChart(title, svg, data, type, color, tooltip) {
  svg
    .append("text")
    .attr("class", "fixedLabel")
    .attr("x", function() {
      return type * 200 + 100;
    })
    .attr("y", 320)
    .attr("text-anchor", "middle")
    .text(function(d) {
      return title + ": " + data.length;
    })
    .style("font-weight", "bold");

  var simulation = d3
    .forceSimulation()
    .force(
      "collide",
      d3
        .forceCollide()
        .radius(20)
        .iterations(1)
    )
    .force("charge", d3.forceManyBody().strength(0.01))
    .force("center", d3.forceCenter(type * 200 + 100, 200));

  var node = svg
    .selectAll(".node")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "nodes")
    .attr("r", 10);

  node
    .append("image")
    .attr("xlink:href", function(d) {
      var updatedAt = Date.parse(d.updatedAt);
      var dateDiff = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - updatedAt) / (1000 * 60 * 60 * 24));

      if (d.status == "APPROVED") {
        if (dateDiff > 10) {
          return "./resources/claim-late.png";
        } else {
          return "./resources/claim-approved.png";
        }
      } else if (d.status == "DRAFT") {
        return "./resources/claim-draft.png";
      } else if (d.status == "SUBMITTED") {
        return "./resources/claim-submitted.png";
      } else if (d.status == "PAID") {
        return "./resources/claim-paid.png";
      } else {
        return "./resources/claim-rejected.png";
      }
    })
    .attr("x", function(d) {
      return d.cx;
    })
    .attr("y", function(d) {
      return d.cy;
    })
    .attr("width", function(d) {
      return d.size + 10 + "px";
    })
    .attr("height", function(d) {
      return d.size + 10 + "px";
    });

  var ticked = function() {
    node
      .attr("cx", function(d) {
        return d.x;
      })
      .attr("cy", function(d) {
        return d.y;
      })
      .attr("x", function(d) {
        return d.cx;
      })
      .attr("y", function(d) {
        return d.cy;
      })
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
      .on("mouseover", function(d) {
        tooltip
          .transition()
          .duration(100)
          .style("opacity", 1);
        tooltip
          .html("Title: " + d.title + "<br/> Date: " + d.createdAt + "<br/> Amount: " + d.amount)
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 80 + "px");
      })
      .on("mouseout", function(d) {
        tooltip
          .transition()
          .duration(500)
          .style("opacity", 0);
      });
  };

  simulation.nodes(data).on("tick", ticked);

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

function preprocessor(data) {
  var maxValue = -1;

  data.forEach(element => {
    if (element.amount > maxValue) {
      maxValue = element.amount;
    }
  });

  var rscale = d3
    .scaleLinear()
    .domain([0, maxValue])
    .rangeRound([3, 40]);

  data.forEach(element => {
    element.size = rscale(element.amount);
  });

  return data;
}
