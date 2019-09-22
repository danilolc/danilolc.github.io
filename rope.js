//############################
//Processing Rope
//############################

//Globals -------------
var Sx = 720;
var Sy = 480;

var s1 = {rad: 100, px: Sx/2, py: Sy/2};

var Rad = 1.5;
var Grav = 98;
var Elastic = 2000;
var Att = 0.001;

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
	constructor(v) {
		this.pos = v.copy();
		
		this.vel = createVector(0, 0);
		this.acc = createVector(0, 0);
	
		this.pos2 = createVector(0, 0);
	
		this.fixed = false;
		this.stretch = 0;
	}

	do_borders() {
		if (this.pos.y > Sy - Rad && this.vel.y > 0) {
			this.vel.y = -this.vel.y * 0.8;
			this.pos.y = Sy - Rad;
		}
		if (this.pos.y < 0 && this.vel.y < 0) {
			this.vel.y = -this.vel.y * 0.8;
			this.pos.y = Rad;
		}
		if (this.pos.x > Sx - Rad && this.vel.x > 0) {
			this.vel.x = -this.vel.x * 0.8;
			this.pos.x = Sx - Rad;
		}
		if (this.pos.x < 0 && this.vel.x < 0) {
			this.vel.x = -this.vel.x * 0.8;
			this.pos.x = Rad;
		}
	} 
}

class Rope {
	constructor(sx, sy, ex, ey, knots) {
		var start = createVector(sx, sy);		
		var end = createVector(ex, ey);

		var d = end.copy().sub(start).div(knots - 1);
		this.delta = d.mag();

		this.K = Elastic;

		this.knots = [];
		for (let i = 0; i < knots; i++) {
			this.knots.push(new Knot(start));
			start.add(d);
		}

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
			ellipse(e.pos.x, e.pos.y, 2*Rad, 2*Rad);
		})
	}

	//Midpoint method
	midpoint(dt) {
		var athis = this;

		this.knots.forEach(function(e,i,a) {
			//Estimate a next position to calculate x''
			e.pos2.x = e.pos.x + e.vel.x * dt / 2;
			e.pos2.y = e.pos.y + e.vel.y * dt / 2;

			e.acc.set(gravity);
			
			if(i > 0) {
				//Get the last knot
				let last = a[i-1];
				
				//Calculate the vector between knots
				let d = e.pos2.copy();
				d.sub(last.pos2);
				
				//Get the X
				let dm = d.mag();
				let x = dm - athis.delta;
				
				//Make the vector length be X
				d.mult(x / dm);
				
				//F = -Kx
				d.mult(-athis.K);
				
				//Add the acc on both knots
				e.acc.add(d);
				last.acc.sub(d);
			}
		})

		
		this.knots.forEach(function(e,i,a) {
			if(!e.fixed) {
				e.vel.x = e.vel.x + e.acc.x * dt / 2;
				e.vel.y = e.vel.y + e.acc.y * dt / 2;

				e.pos.x = e.pos.x + e.vel.x * dt;
				e.pos.y = e.pos.y + e.vel.y * dt;

				e.do_borders();
			}
		})
	}

	//Euler method
	euler(dt) {
		var athis = this;
	
		//Calculate x'' on each knot
		this.knots.forEach(function(e,i,a) {

			e.acc.set(gravity);

			if(i > 0) {
				//Get the last knot
				let last = a[i-1];
				
				//Calculate the vector between knots
				let d = e.pos.copy();
				d.sub(last.pos);
				
				//Get the X
				let dm = d.mag();
				let x = dm - athis.delta;
				
				//Make the vector length be X
				d.mult(x / dm);
				
				//F = -Kx
				d.mult(-athis.K);
				
				//Add the acc on both knots
				e.acc.add(d);
				last.acc.sub(d);
				
				//Define the stretch to colorize
				e.stretch = x * 2;
	
			}
		})

		this.knots.forEach(function(e,i,a) {
			if (!e.fixed) {
				//Update positions and velocities
				e.vel.div(1 + Att);
				e.vel.x += e.acc.x * dt;
				e.vel.y += e.acc.y * dt;
				
				e.pos.x += e.vel.x * dt;
				e.pos.y += e.vel.y * dt;
				
				e.do_borders();
			}
		})
	}
}

//Setup ---------------
function setup() {
	resizeCanvas(Sx, Sy);
	
	let n = 50;
	
	rope = new Rope(100, 60, Sx-100, 60, n);
	rope.knots[0].fixed = true;
	rope.knots[n-1].fixed = true;

	gravity = createVector(0, Grav);
}

//Draw ----------------
var lasttime = 0;

function draw() {
	
	var dt = millis() / 1000 - lasttime;
	lasttime += dt;

	if(mouseIsPressed) {
		rope.knots[0].pos.x = mouseX;
		rope.knots[0].pos.y = mouseY;
	}

	fill(220, 250, 200);
	stroke(0);
	rect(0, 0, Sx, Sy);
	
	rope.draw();
	rope.midpoint(dt);
}
