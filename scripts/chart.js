var numCars = 7,
    tPerm = 0.5,
    t = .5,
    numPatches = 400,
    vo = 20,
    sMin = 2,
    L = 10,
    T = 2,
    acc = 0.5,
    dec = 3;

var cars = d3.range(numCars).map(function(d,i){
    var x = Math.round(i/numCars * numPatches); 
    return new Car(x, i);
  });

d3.range(1000).forEach(function(d){

  cars.forEach(function(v,i){

    var n = cars[i+1],
      x = v.x,
      v = v.v;

    var s = n.x - v.x - L,
      delV = v - n.v,
      si = v*T + v*delV/(2*Math.pow(acc*dec,0.5)),
      ss = sMin + d3.max([si, 0]),
      a = acc*(1 -  Math.pow((v/vo),4) - Math.pow((ss / s),2) );

    vNew = v + a * t;
    xNew = x + v*t + 0.5*a*Math.pow(t,2);

    v.v = vNew;
    v.x = xNew;
    v.a = a;

    v.hist.push({
      x: x,
      time: d,
      v: v,
      a: a,
      s: s,
      delV: delV
    })

  })

})


var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.v); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

x.domain(1000);
y.domain([0,30]);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Price ($)");

var gCar = svg.selectAll(".city")
    .data(cars)
  .enter().append("g")
    .attr("class", "city");

gCar.append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.hist); });
    // .style("stroke", function(d) { return color(d.name); });

function Car(xo, index){

  this.index = index;
  this.x = xo;
  this.v = 25;
  this.a = 0;
  this.slow = false;
  this.hist = [];

}






svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line);
