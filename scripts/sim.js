//===============PARAMETERS===================
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    radius = (width-100)/2,
    center = {x: width/2, y: height/2},
    numCars = 20,
    numPatches = 1000,
    vel = numPatches/60,
    dec = -vel*0.5,
    acc = vel*0.3,
    dur = 800,
    maxVel = vel,
    carLength = 15,
    minVel = 0;

var format = d3.format(",.3r");


var color= d3.scale.linear() //function that takes numbers & returns colors
    .domain(d3.extent(d3.range(numCars))) //domain of input data 1 to 38
    .range(["#8F9CFC", "#DDE76A"])  //the color range
    .interpolate(d3.interpolateHcl); //how to fill the inbetween colors

// var color = d3.scale.category20c().domain(d3.range(numCars));

//=============DRAW SVG AND ROAD===============

var sticker = d3.sticker("#car");

var svg = d3.select("#main").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var road = svg.append('circle');

road.attr({
	r: radius,
	cx: width/2,
	cy: height/2,
	fill: "none",
	stroke: "#333",
	"stroke-width": "90px"
});

var title = svg.append("g")
	.attr("transform","translate(" + center.x + "," + center.y + ")")
	.append("text")
	.text("Traffic Waves!")
	.attr({
		"font-size":"25px",
		"font":"sans-serif",
		"text-align": "start"
	})


//=============SET UP ARRAYS===============

var	cars = d3.range(numCars).map(function(d,i){
		var loc = Math.round(i/numCars * numPatches); 
		return new Car(loc, i);
	});


//=============DRAW THE CARS===============

var gCar = svg.append("g")
	.attr('class', 'g-cars')
	.attr("transform","translate(" + center.x + "," + center.y + ")" );

var car = gCar.selectAll('cars')
	.data(cars)
	.enter()
	.append('g')
	.attr({
		class: function(d){
			return "car " + d.index.toString()
		},
		transform: function(d){
			return "rotate(" + d.loc / numPatches * 360 + ")";
		}
	});

car.append('g').call(sticker).attr({
	transform: "scale(1) rotate(95) translate(0," + radius + ")",
	fill: function(d,i){ return color(i); },
	// stroke: 'white'
})
.on("click", function(d){
	d3.select(this)
		.transition()
		.attr("fill","white")
		.ease('linear')
		.attr("fill", function(d,i){ return color(d.index);});

	d.slowClick();
});


//=============GET IT GOING===============

setInterval(redraw, dur);


//=============FUNCTIONS===============

function redraw(){

	cars.forEach(function(d){
		d.checkD();
	})

	cars.forEach(function(d){
		d.updateLoc();
	})

	car.transition()
		.duration(dur)
		.ease('linear')
		.attr("transform", function(d){
			return "rotate(" + d.loc / numPatches * 360 + ")";
		})

}


//=============CLASSES===============

function Car(location, index){
	this.loc = location;
	this.index = index;
	this.slow = false;
	this.vel = vel;
	this.moves = [vel, vel];

	this.checkD = function(){
		var next = cars[(index+1)%numCars];
		this.s = (next.loc > this.loc) ? (next.loc - this.loc) : (next.loc - this.loc + numPatches);
		this.z = this.vel * 2 + carLength;
	};

	this.updateLoc = function(){


		if(this.s < this.z){
			console.log("LOG:","dec");
			g = this.vel + dec;
			move = d3.min([d3.max([g, minVel]), maxVel]);
			this.moves.unshift(move);
		}

		if(this.s >= this.z){
			g = this.vel + acc;
			move = d3.min([d3.max([g, minVel]), this.s]);
			this.moves.unshift(move)
		}

		this.vel = this.moves.pop();
		this.loc = ((this.slow) ? this.loc : this.vel + this.loc)%numPatches;
		this.slow = false;

	};

	this.slowClick = function(){
		this.slow = true;
	};

}




