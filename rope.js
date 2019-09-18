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
var Sx = 640
var Sy = 480

var MaxS = 40;

var gravity;
var vel;
var pos;

//Setup ---------------
function setup() {
	
	gravity = createVector(0,0.098);
	vel = createVector(5,0);
	pos = createVector(0,0);
	
	resizeCanvas(Sx,Sy,1);
	noStroke();
	
	a = new Knot(10, 10);
	b = new Knot(10, 10, 30);
	
	print(a);
	print(b);
	
	fill(224, 150, 0);
	noStroke();
}

//Draw ----------------
function draw() {
	background(200);
	
	vel.add(gravity);
	pos.add(vel);
	
	if (pos.y > Sy - 20 || pos.y < 0) {
		vel.y = -vel.y * 1.1;
	}
	if (pos.x > Sx - 20 || pos.x < 0) {
		vel.x = -vel.x * 1.1;
	}
	if (vel.mag() > MaxS)
		vel.div(vel.mag() / MaxS)
	
	rect(pos.x, pos.y, 20, 20); 
}
