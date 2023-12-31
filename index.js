// Declare the chart dimensions and margins.
const width = 640;
const height = 640;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 20;
const marginLeft = 20;

const deg = Math.PI/180;
var radiusMax = 100;

var magnitude = function(v) {
	let r = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
	if(r > radiusMax) r = radiusMax;
	return r;
}

var phase = function(v) {
	let ang = Math.atan2(v[1], v[0])/deg;
	if(ang < 0 && d3.select("#posangle").property("checked")) ang += 360;
	return ang;
}

var cartesian = function(v) {
	return [v[0]*Math.cos(v[1]*deg), v[0]*Math.sin(v[1]*deg)]
}

// Declare the x (horizontal position) scale.
const x = d3.scaleLinear()
	.domain([-radiusMax, radiusMax])
	.range([marginLeft, width - marginRight]);

// Declare the y (vertical position) scale.
const y = d3.scaleLinear()
	.domain([-radiusMax, radiusMax])
	.range([height - marginBottom, marginTop]);

const update = function(vp) {
	var vc = cartesian(vp);

	// Angle arc
	svg.selectAll(".anglearc")
		.data([vp])
		.join("path")
			.attr("class", "anglearc")
			.attr("transform", `translate(${x(0)}, ${y(0)})`)
			.attr('fill', 'gray')
			.attr("d", d => d3.arc()({
				innerRadius: 0.2*(x(d[0])-x(0))-2,
				outerRadius: 0.2*(x(d[0])-x(0))+2,
				startAngle: 90*deg,
				endAngle: (90 - d[1])*deg
			}));

	// Radius reference
	svg.selectAll(".radiusref")
		.data([vp])
		.join("path")
			.attr("class", "radiusref")
			.attr("transform", `translate(${x(0)}, ${y(0)})`)
			.attr('fill', 'lightgray')
			.attr("d", d => d3.arc()({
				innerRadius: (x(d[0])-x(0))-1,
				outerRadius: (x(d[0])-x(0))+0,
				startAngle: 0,
				endAngle: 2*Math.PI
			}));

	// Vector
	svg.selectAll(".vector")
		.data([vc])
		.join('path')
			.attr("class", "vector")
			.attr('stroke-width', '6px')
			.attr('stroke', 'blue')
			.attr('fill', 'none')
			.attr('d', d => d3.line()([[x(0), y(0)], [x(d[0]), y(d[1])]]));

	// Vector x-component
	svg.selectAll(".vectorx")
		.data([vc])
		.join('path')
			.attr("class", "vectorx")
			.attr('stroke-width', '3px')
			.attr('stroke', 'red')
			.style('stroke-dasharray', ('5,5'))
			.attr('fill', 'none')
			.attr('d', d => d3.line()([[x(0), y(0)], [x(d[0]), y(0)]]));

	// Vector y-component
	svg.selectAll(".vectory")
		.data([vc])
		.join('path')
			.attr("class", "vectory")
			.attr('stroke-width', '3px')
			.attr('stroke', 'green')
			.style('stroke-dasharray', ('5,5'))
			.attr('fill', 'none')
			.attr('d', d => d3.line()([[x(d[0]), y(0)], [x(d[0]), y(d[1])]]));
	
	var data = [
		{"Vector Property" : "Magnitude",	"Symbol" : "V",				"Formula" : "(V<sub>x</sub><sup>2</sup> + V<sub>y</sub><sup>2</sup>)<sup>1/2</sup>",	"Value" : `${vp[0]}`},
		{"Vector Property" : "Angle", 		"Symbol" : "θ",				"Formula" : "atan (V<sub>y</sub> / V<sub>x</sub>)",										"Value" : `${vp[1]}°  (= ${(vp[1]/180).toFixed(2)}π rad)`},
		{"Vector Property" : "X-component",	"Symbol" : "V<sub>x</sub>",	"Formula" : "V cos(θ)",																	"Value" : `${vc[0].toFixed(1)}`},
		{"Vector Property" : "Y-component",	"Symbol" : "V<sub>y</sub>",	"Formula" : "V sin(θ)",																	"Value" : `${vc[1].toFixed(1)}`}
	];

	table.update(data, ["Vector Property", "Symbol", "Formula", "Value"], "vprop");
}  

// Create the SVG container.
const svg = d3.select("#container").append("svg")
	.attr("width", width)
	.attr("height", height)
	.style("display", "block")
	.style("margin", "auto");

// Add the x-axis, where y = 0
svg.append("g")
	.attr("transform", `translate(0,${y(0)})`)
	.call(d3.axisBottom(x));

// Add the y-axis, where x = 0
svg.append("g")
	.attr("transform", `translate(${x(0)},0)`)
	.call(d3.axisLeft(y));

// Add vector table
table.create([], [], d3.select("#outdata"), "vprop");

// Add initial vector
update([0, 0]);

// Add radial overlay
svg.append("path")
	.attr('class', 'vin')
	.attr('id', 'rmax')
	.attr("transform", `translate(${x(0)}, ${y(0)})`)
	.attr("d", d3.arc()({
		innerRadius: 0,
		outerRadius: (x(radiusMax)-x(0)),
		startAngle: 0,
		endAngle: 2*Math.PI
	}))
	.attr('fill', 'lightgray')
	.attr('opacity', 0.2)
	.on('click', (event) => {
		var br = event.target.getBoundingClientRect();
		var ex = x.invert(event.clientX-br.left+marginLeft);
		var ey = y.invert(event.clientY-br.top+marginTop);

		var r = Math.round(magnitude([ex, ey]));
		var ang = Math.round(phase([ex, ey]));

		change([r, ang], 1000);
	});

var dr, da;
var changing = false;

const change = function(vnew, t) {
	if(changing) return;
	changing = true;
	dr = vnew[0] - vlast[0];
	da = vnew[1] - vlast[1];

	var at = d3.timer((elapsed) => {
		if(elapsed > t) {
			at.stop();
			update(vnew);
			vlast = vnew;
			changing = false;
			return;
		}

		var fr = Math.sin(elapsed/t*Math.PI/2);
		fr *= fr;
		update([(fr*dr + vlast[0]).toFixed(0), (fr*da + vlast[1]).toFixed(0)]);
	});
}

var vlast = [80,60];
update(vlast);
d3.select("#posangle").on("click", () => {
	if(vlast[1] < 0) change([vlast[0], vlast[1] + 360], 500);
	else if(vlast[1] > 180) change([vlast[0], vlast[1] - 360], 500);
});

// Append the SVG element.
//d3.select("#container").append(svg.node());
