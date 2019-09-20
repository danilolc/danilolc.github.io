//############################
//Processing Rope
//############################

//Globals -------------
var Sx = 720;
var Sy = 480;

var Rad = 1.5;
var Grav = 0.00002;

var gravity = null;
var rope = null;

//Functions
function drawV(v1, v2, u = false, magn = 10) {
	
	var a = v2.copy();
	var b = a.mag();
	
	if (b == 0)
		return;
	if(u)
		a.div(b);
	else
		a.mult(magn);
	
	stroke(0,0,255);
	line(v1.x, v1.y, v1.x + a.x, v1.y + a.y);
	
}

//Classes -------------
class Knot {
	constructor(x, y) {
		this.pos = createVector(x, y);
		this.vel = createVector(0, 0);
		this.acc = createVector(0, 0);
		this.fixed = false;
		this.stretch = 0;
	}
}

class Rope {
	constructor(x, y, knots, size = 20, angle = 180) {
		this.knots = [];
		this.delta = size / (knots - 1);
		
		for (let i = 0; i < knots; i++)
			this.knots.push(new Knot(x + this.delta*i, y));

	}
	
	draw() {
		var lx = -1, ly = -1;
		fill(255, 0, 0);
		
		this.knots.forEach(function(e,i,a){
			if (lx != -1) {
				stroke(e.stretch, -e.stretch,0);
				line(lx, ly, e.pos.x, e.pos.y);
			}
			
			lx = e.pos.x;
			ly = e.pos.y;
			
			noStroke();
			//ellipse(e.pos.x, e.pos.y, 2*Rad, 2*Rad);
		})
	}
	
	update() {
		var delta = this.delta;
		
		this.knots.forEach(function(e,i,a){
			if (!e.fixed) {
				
				//Update positions and velocities
				e.pos.x += e.vel.x;
				e.pos.y += e.vel.y;
				e.vel.x += e.acc.x;
				e.vel.y += e.acc.y;
				
				//Reset gravity
				e.acc.set(gravity);
		
				//Do borders
				if (e.pos.y > Sy - Rad && e.vel.y > 0) {
					e.vel.y = -e.vel.y * 0.8;
					e.pos.y = Sy - Rad;
				}
				if (e.pos.y < 0 && e.vel.y < 0) {
					e.vel.y = -e.vel.y * 0.8;
					e.pos.y = Rad;
				}
				if (e.pos.x > Sx - Rad && e.vel.x > 0) {
					e.vel.x = -e.vel.x * 0.8;
					e.pos.x = Sx - Rad;
				}
				if (e.pos.x < 0 && e.vel.x < 0) {
					e.vel.x = -e.vel.x * 0.8;
					e.pos.x = Rad;
				}

				
			}
			
			//Calculate forces based on current position
			if(i > 0) {
				//Get the last knot
				let last = a[i-1];
				
				//Calculate the vector between knots
				let d = e.pos.copy();
				d.sub(last.pos);
				
				//Get the X
				let dm = d.mag();
				let x = dm - delta;
				
				//Make the vector length be X
				d.mult(x / dm);
				
				//F = -Kx
				let K = 0.0002;
				d.mult(-K);
				
				//Add the acc on both knots
				e.acc.add(d);
				last.acc.sub(d);
				
				//Define the stretch to colorize
				e.stretch = x * 2;
				
			}
		})
	}
}

//Setup ---------------
function setup() {
	resizeCanvas(Sx, Sy, 1);
	
	let n = 60;
	
	rope = new Rope(120, 60, n, Sx-240);
	rope.knots[0].fixed = true;
	rope.knots[n-1].fixed = true;
	
	gravity = createVector(0, Grav);
}

//Draw ----------------
function draw() {
	if(mouseIsPressed)
		setup();
	
	//rope.knots[0].pos.x = mouseX;
	//rope.knots[0].pos.y = mouseY;

	background(220);
	noFill();
	stroke(0);
	rect(0, 0, Sx, Sy);
	
	rope.draw();
	for (var i = 0; i < 20; i++) rope.update();

}
