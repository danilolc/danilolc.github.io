//############################
//Processing Rope
//############################

//Globals -------------
var Sx = 720;
var Sy = 480;

var Rad = 1.5;
var Grav = 98;
var Elastic = 2000;
var Att = 0.000;

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

function setColor(f) {
	if(f <= 1/6)
		stroke(0xE7,0x00,0x00);
	else if (f <= 2/6)
		stroke(0xFF,0x8C,0x00);
	else if (f <= 3/6)
		stroke(0xFF,0xEF,0x00);
	else if (f <= 4/6)
		stroke(0x00,0x81,0x1F);
	else if (f <= 5/6)
		stroke(0x00,0x44,0xFF);
	else if (f <= 6/6)
		stroke(0x76,0x00,0x89);
	strokeWeight(10);
}

function collide(knot, c, r, e) {
    if(knot.fixed) return;
	
    var ds = knot.pos.copy().sub(c);
    var dist = ds.mag();
	
    if(dist < r) {
        let k = ds.dot(knot.vel) / (dist*dist);
        let p = ds.copy().mult(2*k*e);
        knot.vel.add(p);
		ds.mult(r/dist);
		knot.pos = ds.add(c);
    }
}
//Classes -------------
class Knot {
	constructor(pos, mass) {
		this.pos = pos.copy();
		
		this.vel = createVector(0, 0);
		this.acc = createVector(0, 0);
	
		this.pos2 = createVector(0, 0);
	
		this.mass = mass;
		this.fixed = false;
		this.stretch = 0;
	}

	do_borders() {
		var c = createVector(200, 200);
		collide(this, c, 100, -0.5);
		
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
	constructor(sx, sy, ex, ey, knots, mass) {
		var start = createVector(sx, sy);		
		var end = createVector(ex, ey);

		var d = end.copy().sub(start).div(knots - 1);
		this.delta = d.mag();

		this.K = Elastic;

		this.knots = [];
		for (let i = 0; i < knots; i++) {
			this.knots.push(new Knot(start, mass / knots));
			start.add(d);
		}

	}
	
	draw() {
		var lx = -1, ly = -1;
		fill(255, 0, 0);
		
		var size = this.knots.length;
		this.knots.forEach(function(e,i,a){
			if (lx != -1) {
				stroke(e.stretch, -e.stretch,0);
				//setColor(i / size);
				line(lx, ly, e.pos.x, e.pos.y);
			}
			
			lx = e.pos.x;
			ly = e.pos.y;
			
			noStroke();
			//ellipse(e.pos.x, e.pos.y, 2*Rad, 2*Rad);
		})
	}

	get_force(p1, p2, v1, v2) {
		//Calculate the vector between knots
		let d = p1.copy();
		d.sub(p2);
		
		//Get the X
		let dm = d.mag();
		let x = dm - this.delta;
		
		//Make the vector length be X
		d.mult(x / dm);
		
		//F = -Kx
		d.mult(-this.K);
		
		//Add the force on both vectors
		v1.add(d);
		v2.sub(d);
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
				//Get the last knot and find the force
				let last = a[i-1];
				athis.get_force(e.pos2, last.pos2, e.acc, last.acc);
			}
		})

		
		this.knots.forEach(function(e,i,a) {
			if(!e.fixed) {
				//Update positions and velocities
				e.vel.div(1 + Att);
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
				//Get the last knot and find the force
				let last = a[i-1];
				athis.get_force(e.pos, last.pos, e.acc, last.acc);
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
	
	let n = 80;
	
	rope = new Rope(200, 60, Sx-200, 60, n, 10);
	rope.knots[0].fixed = true;
	//rope.knots[n-1].fixed = true;
	//rope.knots[n-1].mass = 90;

	gravity = createVector(0, Grav);
}

//Draw ----------------
var lasttime = 0;

function draw() {
	
	var dt = millis() / 1000 - lasttime;
	lasttime += dt;

	if(mouseIsPressed && mouseX > 0 && mouseX < Sx && mouseY > 0 && mouseY < Sy) {
		rope.knots[0].pos.x = mouseX;
		rope.knots[0].pos.y = mouseY;
	}

	fill(245);
	stroke(0);
	strokeWeight(4);
	rect(0, 0, Sx, Sy);
	
	dt = 0.016;
	rope.draw();
	rope.midpoint(dt);
}
