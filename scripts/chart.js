(function(){

var sticker = d3.sticker("#car");

var numCars = 8,
  t = .5,
  numPatches = 500,
  timeScale = 100;

//parameters of driving
var vo = 40,
  vd = vo*0.7,
  lag = 4,
  c = 0.36;

var cars = d3.range(numCars).map(function(d,i){
    var x = i*150; 
    return new Car(x, i);
  });

var l = cars[cars.length -1];
var whenItStarts = 10;

var which = 0;

calc();

Chart('v');

Road();

// Chart('s');
// Chart('a');
// Chart('x');

var changeDots;

function calc(){

  d3.range(timeScale).map(function(time){

    cars.slice(0, cars.length -1).forEach(function(d,i){
        var a = d.choices.pop();
        d.a = a;
        d.v += a*t;
        d.x+= d.v*t + 0.5*a*Math.pow(t,2);
    })

    if(time == whenItStarts) l.v = vd;

    l.x += l.v * t;

    cars.slice(0, cars.length -1).forEach(function(d,i){
        var n = cars[d.index+1],
          s = n.x - d.x,
          delV = n.v - d.v,
          newA = c * delV; 

        d.s = s;

        d.choices.unshift(newA);

        d.hist.push({
          x: d.x,
          time: time,
          v: d.v,
          a: d.a,
          s: d.s,
          delV: delV,
          asdf: newA,
          choices: d.choices
        });
      })

    l.hist.push({
      x: l.x,
      time: time,
      v: l.v,
      a: 0
    })

  });

}


function Chart(measure){
  var labels = {s: "headway", v: "speed", a: "acceleration"}

  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 620 - margin.left - margin.right,
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

  var svg = d3.select("#velocity").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain([0, timeScale])

  y.domain(d3.extent(
      _.flatten(
        cars
          .map(function(v){
            return v.hist.map(function(d){ return d[measure]; })
          })
        )
    ));

  y.domain( [y.domain()[0]*0.9,  y.domain()[1]*1.1])

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      // .attr("transform", "rotate(-91)")
      // .attr("y", 10)
      .attr("dy", "-1em")
      .attr("x", width)
      .attr("dx","-1em")
      .style("text-anchor", "end")
      .text("time");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      // .attr("transform", "rotate(-91)")
      .attr("y", 10)
      // .attr("dy", ".71em")
      // .attr("x", "15px")
      .attr("dx","4em")
      .style("text-anchor", "end")
      .text(labels[measure]);

  var gCar = svg.selectAll(".g-car")
      .data(cars)
    .enter().append("g")
      .attr("class", "g-car");

  gCar.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.hist); })
      .style("stroke", function(d,i) { return d3.rgb(color(i)).brighter(0.5); });

  var dot = gCar.append("circle")
      .attr({
        r: 5,
        stroke: "#eee",
        class: 'dot',
        fill: function(d,i){ return d3.rgb(color(i)).brighter(0.5); },
        transform: function(d) {
          var p = [x(which), y(d.hist[which].v)];
          return "translate(" + p[0] + "," + p[1] + ")";
        }
      });

  changeDots = function(r){
    dot.attr(
      "transform", function(d) {
        var p = [x(r), y(d.hist[r].v)];
        return "translate(" + p[0] + "," + p[1] + ")";
      }
    );
  }; //end changedots defn

}


function Road(){

  var margin = {top: 0, right: 20, bottom: 10, left: 50},
      width = 620 - margin.left - margin.right,
      height = 50 - margin.top - margin.bottom;

  var x = d3.scale.linear()
      .range([margin.left, width]);

  x.domain(d3.extent(
      _.flatten(
        cars
          .map(function(v){
            return v.hist.map(function(d){ return d.x; })
          })
        )
    ));

  var color = d3.scale.category10();

  var svg = d3.select("#road").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var road = svg.append("rect")
      .attr({
        width: width,
        height: height,
        fill: "black",
        rx: 5
      })

  var car = svg.append("g")
    // .attr("transform","translate(50,0)")
    .selectAll('cars')
    .data(cars)
      .enter()
    .append('g')
    .call(sticker)
    .attr({
      class: "car",
      fill: function(d,i){return d3.rgb(color(i)).brighter(0.5);},
      transform: function(d){ 
        return "translate(" + x(d.hist[which].x) + "," + 10 +") scale(-.4, 0.4) rotate(0)";
      }
    });


    var sliderCall = d3.slider().on("slide", redraw).axis( d3.svg.axis().ticks(10) );

    d3.select('#slider1')
        .style({
          width: width + "px",
          "margin-left": margin.left + "px"
        })

    d3.select('#slider1').call(sliderCall);

    function redraw(event, newWhich){
      which = newWhich;


      car.attr("transform",function(d){ 
        return "translate(" + x(d.hist[which].x) + "," + 10 +") scale(-.4, 0.4) rotate(0)";
      });

      changeDots(which);
    }

    var gCar = d3.selectAll(".g-car");

    var offset = 0;

}


function Car(xo, index){

  this.index = index;
  this.x = xo;
  this.v = vo;
  this.a = 0;
  this.slow = false;
  this.hist = [];
  this.choices = d3.range(lag).map(function(d,i){ return 0; });

}

})()