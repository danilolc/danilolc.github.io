class Knot {
	constructor() {
		this.x = x;
		this.y = y;
		this.vx = 0;
		this.vy = 0;
		
		this.d = d;
	}
}

class Rope {
	constructor() {
		this.knots = [];
		
	}
	
}


function setup() {
	resizeCanvas(640,480,1);
	background(100);
	
}

var i = 0;

function draw() {
	background(100);
	i+= 0.1;
	rect(20*i, i*i, 20, 20); 
}