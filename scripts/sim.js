(function(){

    function Slow(){
      d3.selectAll(".highlighted").data()[0].slowClick();
    }

    function Set(){

    	cars.forEach(function(d,i){
	    		var x = Math.round(i/numCars * numPatches); 
		    	d.x = x;
		    	d.v = startV;
		    	d.a = 0;
		    	d.gap = numPatches / numCars;
		    	d.slow = false;
    	})
    }



    $("#pause").on("click",function(){
	    paused = !paused;

    	if(!paused){
    		$(this).html("Pause");
    		d3.timer(function(elapsed) {
    		  t = (elapsed - last)/dur * tPerm % .5;
    		  last = elapsed;
    		  redraw();
    		  return paused;
    		});
    	}else{
    		$(this).html("Play");
    	};
  		
  		// $(this).toggleClass("btn-warning");
  		$(this).toggleClass("btn-success");

    });

    $("#reset").on("click",Set);


//===============PARAMETERS===================
var margin = {top: 0, right: 20, bottom: 0, left: 20},
    width = 600 - margin.left - margin.right,
    height = 725 - margin.top - margin.bottom,
    radius = (width-150)/2,
    center = {x: width/2, y: height/2},
    durPerm = 45,
    dur = 45;

var numCars = 30,
		tPerm = 0.5,
    t = .5,
    numPatches = 1000,
    vo = 20,
    startV = 9,
    // maxV = 30, 
    sMin = 2,
    L = 14,
    T = 1.9,
    acc = 0.5,
    dec = 3;

//=============DRAWING HELPERS===============

	var format = d3.round(2);

	var tooltip = d3.select("body").append("div")   
	    .attr("class", "tooltip")               
	    .style("opacity", 0);

	var color = d3.scale.pow().exponent(0.8)
	    .domain([0,vo*0.7]) //domain of input data 1 to 38
      .range(["#2980b9", "#ecf0f1"])  //the color range
	    .interpolate(d3.interpolateHcl);

  var posColorAcc = d3.scale.pow().exponent(0.4)
  		.domain([0,1])
      .range(["#ddd", "#2ecc71"])  //the color range
      .interpolate(d3.interpolateRgb);

  var negColorAcc = d3.scale.pow().exponent(0.4)
  		.domain([-3,0])
      .range(["#e74c3c","#ddd"])  //the color range
      .interpolate(d3.interpolateRgb);

  var colorAcc = function(val){
  	return (val > 0) ?  posColorAcc(val) : negColorAcc(val);
  }

  var toRads = 2*Math.PI;
      
  var y = d3.scale.linear()
  		.domain([-7,1.5])
  		.range([0,radius + 110])
  		.clamp(true);

  var offset = 20;    

  var interiorGap = 107;

  var roadMaker = d3.svg.arc()
  	.innerRadius(radius-50)
  	.outerRadius(radius+50)
  	.startAngle(0)
  	.endAngle(2*Math.PI);

  var arc = d3.svg.arc()
      .innerRadius(function(d){
      	if(0 > d.a) return y(d.a) - interiorGap;
      	return y(0);
      })
      .outerRadius(function(d){
      	if(d.a > 0) return y(d.a);
      	return y(0) - interiorGap;
      })
      .startAngle(function(d){
      	// return 0;
      	return (-0.5*(d.gap + offset)/numPatches*0.8 + .005) * toRads;
      })
      .endAngle(function(d){
      	return (0.5*(d.gap - offset)/numPatches*0.8 - 0.005) * toRads;
      });


  var arcInner = d3.svg.arc()
      .innerRadius(radius - 25)
      .outerRadius(radius + 25)
      .startAngle(function(d){
      	return (-0.5*(d.gap + offset)/numPatches*0.8 + 0.002) * toRads;
      })
      .endAngle(function(d){
      	return (0.5*(d.gap - offset)/numPatches*0.8 - 0.002) * toRads;
      });


//=============DRAW SVG AND ROAD===============

	var sticker = d3.sticker("#car");

	var svg = d3.select("#main")
		.append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var road = svg.append("g")
			.attr("class","road");


	road.append('path')
			.attr({
				d: roadMaker,
				fill: "#293038",
				transform: "translate(" + center.x + "," + center.y + ")"
			});

	var slowScale = d3.scale.linear().domain([0,50]).range([6,1]).clamp(true)

	road.on('mousemove', function(){
				var xi = d3.mouse(this)[0] - center.x ;
				var yi = d3.mouse(this)[1] - center.y ;
				var s = Math.pow(Math.pow(xi,2) + Math.pow(yi,2),0.5) - radius;
				dur = durPerm * slowScale(Math.abs(s))
			})
			.on('mouseout', function(){
				dur = durPerm
		});

	road.append("foreignObject")
	    .attr("transform","translate(" + (center.x + - 150/2) +  "," + ( center.y +  - 45/2) + ")" )
	    .attr("width", 200)
	    .attr("height", 200)
	  .append("xhtml:div")
	    .html('<button id="slow" class="btn btn-lg btn-danger">Hit the brakes</button>');
	
	$("#slow").on("click",function(){
		Slow();
	})

	//=============DRAW LEGEND===============
// ["#e74c3c", "#2ecc71"]
	var legendData = [
		{name: "deceleration (braking)", color: "#e74c3c", type: "rect"},
		{name: "acceleration (speeding up)", color: "#2ecc71", type: "rect"}
	]

	var legend = svg.selectAll(".legend")
	    .data(legendData)
	  .enter().append("g")
	    .attr("class", "legend")
	    .attr("transform", function(d, i) { return "translate(" +width + "," + i * 25 + ")"; });

	legend.append("rect")
	    .attr("x", - 18)
	    .attr("width", 18)
	    .attr("stroke","black")
	    .attr("height", 18)
	    .style("fill", function(d){ return d.color; });

	legend.append("text")
	    .attr("x", - 24)
	    .attr("y", 9)
	    .attr("dy", ".35em")
	    .style("text-anchor", "end")
	    .text(function(d) { return d.name; });

	var carOne = svg.append("g")
		.attr("class","legend")
		.attr("transform", "translate(" + (width - 42) + "," + 50 + ")")

		carOne.append("g").call(sticker)
		.attr({
				transform: "scale(0.7)",
				fill: "#2980b9",
				stroke: 'black'
			});

	carOne.append("text")
	    .attr("x", -6)
	    .attr("y", 9)
	    .attr("dy", ".35em")
	    .style("text-anchor", "end")
	    .text("slower");

  var carTwo = svg.append("g")
  	.attr("class","legend")
  	.attr("transform", "translate(" + (width - 42) + "," + 75+ ")")

  	carTwo.append("g").call(sticker)
  	.attr({
  			transform: "scale(0.7)",
  			fill: "#ecf0f1",
  			stroke: 'black'
  		});

  carTwo.append("text")
      .attr("x", -6)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text("faster");


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
				class: function(d,i){
					return "car " + d.index.toString();
				},
				transform: function(d){
					return "rotate(" + -d.x / numPatches * 360 + ")";
				}
			})
			.on("click", function(d){
				d3.select(".highlighted").classed("highlighted", false)
					.attr('opacity',0.05)
					.attr("fill","#ecf0f1");

				d3.select(this).select(".car-arc-inner")
					.classed("highlighted", true)
					.attr("fill", "#e74c3c")
					.attr("opacity",0.4);

			})
			.on("mousemove", function(d) {      
			    tooltip.transition()        
			        .duration(200)      
			        .style("opacity", .8);      
			    tooltip .html(
			    	"velocity: " + 	d3.round(3*d.v,1) + " ft/s <br/>" +   
			    	"acceleration: " + d3.round(3*d.a,2) + " ft/s<sup>2</sup>"
			    	)  
			        .style("left", (d3.event.pageX + 10) + "px")     
			        .style("top", (d3.event.pageY - 28) + "px");    
			    })                  
			.on("mouseout", function(d) {       
			    tooltip.transition()        
			        .duration(500)      
			        .style("opacity", 0);   
			});


	var carArcInner = car.append('path')
		.attr({
			"d": arcInner,
			class: function(d,i){
				var extra = (i == 0) ? " highlighted" : "";
				return "car-arc-inner" + extra;
			},
			fill: function(d,i){return (i>0) ? "#ecf0f1": "#e74c3c"},
			opacity: function(d,i){return (i>0) ? .05: .4},
		})


	car.append('g')
		.call(sticker)
			.attr({
				class: "g-sticker",
				transform: "translate(0," + (-radius + 5 ) +") scale(.4, 0.4) rotate(180)",
				fill: function(d,i){ return color(d.v); },
			});


	var carArc = car.append('path')
		.attr({
			"d": arc,
			class: "car-arc",
			// opacity: 0.75,
			fill: function(d,i){ return colorAcc(d.a); },
			// stroke: "#666"
		});



//=============GET IT GOING===============

// setInterval(redraw, dur);
var paused = false;
var last = 0;
var numLoop = 0;

d3.timer(function(elapsed) {
  t = (elapsed - last)/dur * tPerm % .5;
  // T = 10*t;
  numLoop++
  last = elapsed;
  redraw();

  return paused;
});


//=============FUNCTIONS===============



function redraw(){
	
	cars.forEach(function(d){
		d.choose();
	});

	cars.forEach(function(d){
		d.update();
	});


	carArc.attr("d",arc);

	carArcInner.attr("d",arcInner);

	car.attr("transform", function(d){
				return "rotate(" + d.x / numPatches * 360 + ")";
			});

	d3.selectAll(".g-sticker")
		.attr("fill", function(d) { return color(d.v); });

	carArc.attr("fill", function(d) { return colorAcc(d.a); });

}


//=============CLASSES===============

function Car(xo, index){

	this.index = index;
	this.x = xo;
	this.v = startV;
	this.a = 0;
	this.gap = numPatches / numCars;

	this.slow = false;

	this.getS = function(x){
		var n = cars[(index+1)%numCars];
		var g = (n.x > x) ? (n.x - x) : (n.x - x + numPatches);
		this.s = g-L;
		var p = (cars[(index-1)]) ? cars[(index-1)] : cars[numCars - 1];
		this.gap = (p.x < x) ? (x - p.x) : (x - p.x + numPatches);
		return g - L;
	};

	this.update = function(){

		var a = this.a,
			x = this.x,
			v = this.v;

		vNew = v + a * t;
		xNew = x + v*t + 0.5*a*Math.pow(t,2);

		this.x = xNew % numPatches;
		this.v = d3.min([d3.max([vNew,0]),vo]);
		if(this.v == vo) this.a = 0;

		var n = cars[(index+1)%numCars];
		if(this.x > n.x && (this.x - n.x < numPatches/2)){
			this.x = n.x- L - sMin;
			this.v = 0;
		}


	}

	this.slowClick = function(){
		this.slow = d3.range(15);
		// this.slow =  true;
	}

	this.choose = function(){
		var n = cars[(index+1)%numCars];
		var v = this.v,
			x = this.x,
			s = this.getS(x),
			delV = v - n.v,
			si = v*T + v*delV/(2*Math.pow(acc*dec,0.5)),
			ss = sMin + d3.max([si, 0]),
			a = acc*(1 -  Math.pow((v/vo),4) - Math.pow((ss / s),2) );
	
		// if(this.slow) this.v = this.v*0.75;

		this.a = a;

		if(this.slow.length > 0) {
			this.a = -1;
			// this.v = 
			this.slow.pop();
		}

	};

}

})()