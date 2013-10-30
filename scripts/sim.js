//===============PARAMETERS===================
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    radius = (width-100)/2,
    center = {x: width/2, y: height/2},
    numCars = 20,
    numPatches = 5000,
    tol = numPatches/numCars,
    vel = numPatches/400,
    dec = -vel*0.3,
    acc = vel*0.10,
    dur = 50,
    maxVel = vel*1.25,
    minVel = vel*0.15;

var format = d3.format(",.3r");

var color = d3.scale.category20c().domain(d3.range(numCars));

//=============DRAW SVG AND ROAD===============

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
	"stroke-width": "50px"
});

//=============SET UP ARRAYS===============

var	cars = d3.range(numCars).map(function(d,i){
		var loc = Math.round(i/numCars * numPatches); 
		return new Car(loc, i);
	});


//=============DRAW THE CARS===============

var gCar = svg.append("g")
	.attr('class', 'g-cars');

var car = gCar.selectAll('cars')
	.data(cars)
	.enter()
	.append('g')
	.attr({
		class: function(d){
			return "car " + d.index.toString()
		},
		transform: function(d){
			return "translate(" + d.cart.x  + "," + d.cart.y + ") rotate(" + -d.loc / numPatches * 360 + ")";
		}
	});


car.append('image').attr({
	"xlink:href": "styles/car.svg",
	width: 30,
	height: 40,
	x: -20,
	y: -20,
	transform: "rotate(90)",
	fill: function(d,i){ return color(i); },
	// stroke: 'white'
})
.on("click", function(d){
	d.slowClick();
});


//=============GET IT GOING===============

setInterval(redraw, dur);


//=============FUNCTIONS===============

function cartize(patch){

	var ang = patch/numPatches * 2 * Math.PI;

	return {x: (Math.cos(ang) * radius + center.x), y: (center.y - Math.sin(ang) * radius) };

}


function redraw(){

	cars.forEach(function(d){
		d.checkD();
	})

	cars.forEach(function(d){
		d.updateLoc();
	})

	car.transition()
		.duration(dur)
		.ease('linear')		.attr("transform", function(d){
			return "translate(" + d.cart.x  + "," + d.cart.y  + ") rotate(" + -d.loc / numPatches * 360 + ")";
		});
}


//=============CLASSES===============

function Car(location, index){
	this.loc = location;
	this.cart = cartize(this.loc);
	this.index = index;
	this.slow = false;
	this.vel = vel;
	this.moves = [vel, vel, vel, vel];

	this.checkD = function(){
		var next = cars[(index+1)%numCars];
		this.s = (next.loc > this.loc) ? (next.loc - this.loc) : (next.loc - this.loc + numPatches);
		this.nextVel = next.vel;
	};

	this.updateLoc = function(){

		var s = this.s,
			c = 0;

		var g = 0;
		var move = 0;



		if(s <= tol){
			if(this.nextVel < this.vel){
				g = this.vel + dec;
				move = d3.min([d3.max([g,minVel]), maxVel]);
				this.vel = this.moves.pop();
				this.moves.unshift(move);
			}else{
				g = this.vel;
				move = d3.min([d3.max([g,minVel]), maxVel]);
				this.vel = this.moves.pop();
				this.moves.unshift(move);
			}
		}

		if(s > tol){
			g = this.vel + acc;
			move = d3.min([d3.max([g,minVel]), maxVel]);
			this.vel = move;
			this.moves = [vel, vel, vel, vel];
		}

		if(s< 4){
			this.vel = 0;
			this.moves = [0, 0, 0];
		}

		if(this.slow) {
			this.vel = -10;
		}

		this.loc = (this.vel + this.loc)%numPatches;
		this.cart = cartize(this.loc);
		this.slow = false;
	};

	this.getVel = function(){
		return this.vel;
	};

	this.slowClick = function(){
		this.slow = true;
	};

}

