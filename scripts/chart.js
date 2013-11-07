var numCars = 7,
    tPerm = 0.5,
    t = .5,
    numPatches = 500,
    vo = 15,
    sMin = 2,
    L = 10,
    T = 1.5,
    acc = 1,
    dec = 3,
    timeScale = 100;

var cars = d3.range(numCars).map(function(d,i){
    var x = i*20; 
    return new Car(x, i);
  });


var l = cars[cars.length -1];

_.map(d3.range(timeScale),function(d){

  cars.slice(0, cars.length -1).forEach(function(c,i){

      var n = cars[c.index+1],
        x = c.x,
        v = c.v;

      var s = n.x - c.x - L,
        delV = v - n.v,
        si = v*T + v*delV/(2*Math.pow(acc*dec,0.5)),
        ss = sMin + d3.max([si, 0]),
        a = acc*(1 -  Math.pow((v/vo),4) - Math.pow((ss / s),2) );

      vNew = v + a * t;
      xNew = x + v*t + 0.5*a*Math.pow(t,2);

      c.v = vNew;
      c.x = xNew;
      c.a = a;
      c.s = s;

    c.hist.push({
      x: c.x,
      time: d,
      v: c.v,
      a: c.a,
      s: c.s
    });
  })

  // if(20  < d < 30){
  //   l.a = -0.1
  //   l.v+= l.a*t
  //   l.x+=l.v*t + 0.5*l.a*Math.pow(t,2);
  // }else if(30  < d < 40){
  //   l.a = 0.1
  //   l.v+= l.a*t
  //   l.x+= l.v*t + 0.5*l.a*Math.pow(t,2);
  // }else{
    l.x += l.v * t;
  // }

})


Chart('v');

Chart('s');

// Chart('x');


function Chart(measure){

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var color = d3.scale.category10();

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d[measure]); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

x.domain([0,timeScale]);


y.domain([0,d3.max(
    _.flatten(
      cars.slice(0, cars.length - 1)
        .map(function(v){
          return v.hist.map(function(d){ return d[measure]; })
        })
      )
  )]);

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
    .text(measure);

var gCar = svg.selectAll(".city")
    .data(cars)
  .enter().append("g")
    .attr("class", "city");

gCar.append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.hist); })
    .style("stroke", function(d,i) { return color(i); });

}



function Car(xo, index){

  this.index = index;
  this.x = xo;
  this.v = 10;
  this.a = 0;
  this.slow = false;
  this.hist = [];

}

