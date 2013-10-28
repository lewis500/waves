



//===============DRAW THE ROAD===================
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 900 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    radius = (width-200)/2,
    center = {x: width/2, y: height/2},
    vel = .05*Math.PI;

var svg = d3.select("#main").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var road = svg.append('circle');

function cartize(ang){
	return {x: (Math.cos(ang) * radius + center.x), y: (center.y - Math.sin(ang) * radius) }
}

road.attr({
	r: radius,
	cx: width/2,
	cy: height/2,
	fill: "none",
	stroke: "#333",
	"stroke-width": "50px"
});

function Car(location, index){
	this.loc = location;
	this.cart = cartize(this.loc);
	this.index = index;

	this.checkD = function(){
		var next = carsArray[index + 1],
			s = next.loc - this.loc;
	}	

	this.updateLoc = function(){
		this.loc += vel;
		this.cart = cartize(this.loc);
	}

}

var numCars = 25,
	carsArray = d3.range(numCars).map(function(d,i){
		var loc = 2*Math.PI / numCars * (i+1); 
		return new Car(loc, i);
	});


var gCars = svg.append("g")
	.attr('class', 'g-cars');

var cars = gCars.selectAll('cars')
	.data(carsArray)
	.enter()
	.append('rect');


cars.attr({
	width: 10,
	height: 20,
	x: -5,
	y: -10,
	fill: "coral",
	stroke: 'white',
	transform: function(d){
		return "translate(" + d.cart.x  + "," + d.cart.y + ") rotate(" + (-d.loc / (2*Math.PI) * 360) + ")";
	}
});

function redraw(){

	carsArray.forEach(function(d){
		d.updateLoc();
	})

	cars.transition()
		.duration(600)
		.ease('linear')
		.attr("transform", function(d){
			return "translate(" + d.cart.x  + "," + d.cart.y  + ") rotate(" + (-d.loc / (2*Math.PI) * 360) + ")";
		})

}


setInterval(redraw, 600)