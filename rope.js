//############################
//Processing Rope
//############################

//Classes -------------
class Knot {
	constructor(x, y, d = 20) {
		this.x = x;
		this.y = y;
		this.vx = 0;
		this.vy = 0;
		
		this.d = d;
	}
}

class Rope {
	constructor(x, y, knots, size = 20, angle = 180) {
		this.knots = [];
		
	}
	
}

//Globals -------------
g = [];
g.p = 0;

//Setup ---------------
function setup() {
	resizeCanvas(640,480,1);
	noStroke();
	
	a = new Knot(10, 10);
	b = new Knot(10, 10, 30);
	
	print(a);
	print(b);
}

//Draw ----------------
function draw() {
	background(100);
	
	g.p += 0.1;
	
	fill(204, 102, 0);
	noStroke();
	rect(20*g.p, g.p*g.p, 20, 20); 
	
	noFill();
	stroke(0, 0, 0);
	bezier(85, 20, 10*sin(g.p), 10, 90, 90, 15, 80);
}
