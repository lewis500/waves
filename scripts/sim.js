



//===============DRAW THE ROAD===================
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    radius = (width-200)/2,
    center = {x: width/2, y: height/2},
    numCars = 20,
    vel = .05*Math.PI,
    dec = -.01 * Math.PI,
    acc = .0025 * Math.PI,
    tol = 2*Math.PI / (numCars + 1 );

var format = d3.format(",.3r")

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

var	carsArray = d3.range(numCars).map(function(d,i){
		var loc = 2*Math.PI / numCars * (i); 
		return new Car(loc, i);
	});

var a = carsArray;

function Car(location, index){
	this.loc = location;
	this.cart = cartize(this.loc);
	this.index = index;
	this.slow = 0;
	this.vel = vel;

	this.checkD = function(){
		var next = carsArray[index+1] || carsArray[0];
		this.s = (next.loc > this.loc) ? (next.loc - this.loc) : (next.loc - this.loc + 2*Math.PI)
	};

	this.updateLoc = function(){

		var s = this.s,
			c = 0;

		if(s < tol){
			c = dec;
		}

		if(s >= tol){
			c = acc;
		}

		var move = d3.max([d3.min([this.vel + c + this.slow, vel]),0]);
		this.loc = (move + this.loc)%(2*Math.PI);
		this.cart = cartize(this.loc);
		this.slow = 0;
		this.vel = move;
	};

	this.getVel = function(){
		return this.vel;
	}

	this.slowClick = function(){
		this.slow = -.03*Math.PI;
	}

}


var gCar = svg.append("g")
	.attr('class', 'g-cars');

var car = gCar.selectAll('cars')
	.data(carsArray)
	.enter()
	.append('g')
	.attr({
		class: function(d){
			return "car " + d.index.toString()
		},
		transform: function(d){
			return "translate(" + d.cart.x  + "," + d.cart.y + ") rotate(" + -d.loc / (Math.PI * 2 ) * 360 + ")";
		}
	});


var color = d3.scale.category20c().domain(d3.range(numCars))

car.append('rect').attr({
	width: 20,
	height: 20,
	x: -10,
	y: -10,
	fill: function(d,i){ return color(i); },
	stroke: 'white'
})
.on("click", function(d){
	d.slowClick();
});

// setTimeout(function(){

// 	car.append("text")
// 		.attr({
// 			fill: "black",
// 			dx: "3em",
// 			dy: 0
// 		})
// 		.text(function(d){
// 			return d.index.toString() + "     " + format(d.getVel());
// 		})
	
// }, 800)

var dur = 900;

function redraw(){

	carsArray.forEach(function(d){
		d.checkD();
	})

	carsArray.forEach(function(d){
		d.updateLoc();
	})

	car.transition()
		.duration(dur)
		.ease('linear')		.attr("transform", function(d){
			return "translate(" + d.cart.x  + "," + d.cart.y  + ") rotate(" + -d.loc / (Math.PI * 2 ) * 360 + ")";
		});

	// car.selectAll('text')
	// 	.transition()
	// 	.text(function(d){
	// 		return d.index.toString() + " " + format(d.getVel());
	// 	})

}


setInterval(redraw, dur)