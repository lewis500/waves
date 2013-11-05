//===============PARAMETERS===================
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    radius = (width-200)/2,
    center = {x: width/2, y: height/2},
    durPerm = 40,
    dur = 40;

var numCars = 40,
		tPerm = 0.5,
    t = .5,
    numPatches = 1000,
    vo = 25, // 5
    sMin = 2,
    L = 10,
    T = 1.5,
    acc = 0.5,
    dec = 3;

//=============FORMATTING===============

	var format = d3.format(",.3r");

	var color= d3.scale.pow().exponent(0.5)
	    .domain([0,vo*3/5]) //domain of input data 1 to 38
	    .range(["#8F9CFC", "#DDE76A"])  //the color range
	    .interpolate(d3.interpolateHcl);


//=============DRAW SVG AND ROAD===============

	var sticker = d3.sticker("#car");

	var svg = d3.select("#main").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var road = svg.append("g").attr("class","road");


	road.append('circle')
			.attr({
				r: radius,
				cx: width/2,
				cy: height/2,
				fill: "none",
				stroke: "#333",
				"stroke-width": "50px"
			});

	road.on('mouseover', function(){
				dur = durPerm * 4
			})
			.on('mouseout', function(){
				dur = durPerm
		})


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
			var x = Math.round(i/numCars * numPatches); 
			return new Car(x, i);
		});

	//=============DRAW THE CARS===============

	var gCar = road.append("g")
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
				return "rotate(" + d.x / numPatches * 360 + ")";
			}
		});

	car.append('g').call(sticker).attr({
		class: "g-sticker",
		transform: "translate(0," + (radius - 8) +") scale(.3, 0.4) ",
		fill: function(d,i){ return color(d.v); },
		// stroke: 'white'
	})
	.on("click", function(d){
		// d3.select(this)
		// 	.transition()
		// 	.attr("fill","white")
		// 	.ease('linear')
		// 	// .attr("fill", function(d,i){ return color(d.index);});

		d.slowClick();
	});

//=============GET IT GOING===============

// setInterval(redraw, dur);

var last = 0;
d3.timer(function(elapsed) {
  t = (elapsed - last)/dur * tPerm;
  last = elapsed;
  redraw();
});


//=============FUNCTIONS===============
function redraw(){

	cars.forEach(function(d){
		d.choose();
	})

	cars.forEach(function(d){
		d.update();
	})

	car.attr("transform", function(d){
				return "rotate(" + d.x / numPatches * 360 + ")";
			})

	d3.selectAll(".g-sticker").attr("fill", function(d) { return color(d.v); })

}


//=============CLASSES===============

function Car(xo, index){

	this.index = index;
	this.x = xo;
	this.v = 10;
	this.a = 0;

	this.slow = false;

	var getS = function(x){
		var n = cars[(index+1)%numCars];
		var g = (n.x > x) ? (n.x - x) : (n.x - x + numPatches);
		this.s = g-L;
		return g - L;
	};

	this.update = function(){

		var a = this.a,
			x = this.x,
			v = this.v;

		v = v + a * t;
		xNew = x + v*t + 0.5*a*Math.pow(t,2);

		this.x = xNew % numPatches;
		this.v = d3.max([v,0]);

	}

	this.slowClick = function(){
		console.log("LOG:","me too");
		this.slow =  true;
	}

	this.choose = function(){
		var n = cars[(index+1)%numCars];
		var v = this.v,
			x = this.x,
			s = getS(x),
			delV = v - n.v,
			si = v*T + v*delV/(2*Math.pow(acc*dec,0.5)),
			ss = sMin + d3.max([si, 0]),
			a = acc*(1 -  Math.pow((v/vo),4) - Math.pow((ss / s),2) );
	
		if(this.slow) this.v = this.v*0.75;

		this.a = a;

		// this.pedals.unshift(a);
		this.slow = false;

	};

}

