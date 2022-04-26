
var width = 800,
height = 400,
padding = 1.5, // separation between same-color circles
clusterPadding = 35, // separation between different-color circles
maxRadius = 26;

  
var svg = d3
.select("#group-chart")
.append("svg")
.attr("width", width)
.attr("height", height);

function drawGroupChart(data){
  
  const clusterMap = {};
  const clusterGroupList = data[0];
  const speakingGroupDict = data[1];
  const clusterList = [];

  clusterGroupList.forEach(sublist=>{
    let found = false;
    for(let i=0;i<clusterList.length;i++){
      for(let j=0;j<sublist.length;j++){
        if(sublist[j]!==null && clusterList[i].has(sublist[j])){
          found = true
          clusterList[i].add(...sublist)
        }
      }
    }
    if(!found){
      clusterList.push(new Set(sublist))
    }
  })
  console.log(clusterList)
  const updatedData = []
  clusterList.forEach((s,index)=>{
    s.forEach((e)=>{
      if(e!==null){
        updatedData.push({cluster: index+1, name: e})
      }
    })
  })
  updatedData.forEach(e=>{
    if(speakingGroupDict['speaking'].includes(e.name)){
      e.speaking = true
    }
  })

  updatedData.forEach(({ cluster, name }) => {
    const arr = clusterMap[cluster] || [];
    arr.push(name);
    clusterMap[cluster] = arr;
  });
  
  var n = updatedData.length, // total number of circles
    m = Object.keys(clusterMap).length; // number of distinct clusters
  
  var color = d3.scale
    .ordinal()
    .domain(d3.range(m))
    .range([
      "#2ca02c",
      "#e377c2",
      "#9ecae1",
      "#946943",
      "#d62728",
      "#9467bd",
      "#1f77b4",
      "#7f7f7f",
    ]);
  
  // The largest node for each cluster.
  var clusters = new Array(m);
  
  var nodes = updatedData.map(function (e) {
    var r = maxRadius,
      i = e.cluster;
    d = { cluster: e.cluster, radius: r, name: e.name, speaking: !!e.speaking };
    if (!clusters[i] || r > clusters[i].radius) clusters[i] = d;
    return d;
  });
  
  var force = d3.layout
    .force()
    .nodes(nodes)
    .size([width, height])
    .gravity(0.02)
    .charge(0)
    .on("tick", tick)
    .start();

    svg.selectAll("*").remove();
  
  let chartArea = svg
    .append("g")
    .attr("id", "graph")
    .attr("transform", `translate(${10},${10})`);
  
  var node = chartArea
    .append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter()
    .append("g");
  
  var circle = node
    .append("circle")
    .attr("r", function (d) {
      return d.radius;
    })
    .style("fill", function (d) {
      return color(d.cluster);
    })
    .style("opacity", function(d){
      if(d.speaking){
        return 1
      }else{
        return 0.4
      }
    })
    .attr("class", function(d) {
      if(d.speaking){
        return 'speaking'
      }
    })
    .call(force.drag);
  
  var text = node
    .append("text")
    .text(function (d) {
      return d.name;
    })
    .call(force.drag);
  
  function tick(e) {
    circle
      .each(cluster(10 * e.alpha * e.alpha))
      .each(collide(0.5))
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
  
    text
      .each(cluster(10 * e.alpha * e.alpha))
      .each(collide(0.5))
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y;
      })
      .attr("dx", "-1.35em")
      .attr("dy", ".45em");
  }
  
  // Move d to be adjacent to the cluster node.
  function cluster(alpha) {
    return function (d) {
      var cluster = clusters[d.cluster];
      if (cluster === d) return;
      var x = d.x - cluster.x,
        y = d.y - cluster.y,
        l = Math.sqrt(x * x + y * y),
        r = d.radius + cluster.radius;
      if (l != r) {
        l = ((l - r) / l) * alpha;
        d.x -= x *= l;
        d.y -= y *= l;
        cluster.x += x;
        cluster.y += y;
      }
    };
  }
  
  // Resolves collisions between d and all other circles.
  function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodes);
    return function (d) {
      var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
      quadtree.visit(function (quad, x1, y1, x2, y2) {
        if (quad.point && quad.point !== d) {
          var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r =
              d.radius +
              quad.point.radius +
              (d.cluster === quad.point.cluster ? padding : clusterPadding);
          if (l < r) {
            l = ((l - r) / l) * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }
}

