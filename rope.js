//############################
//Processing Rope
//############################

//Globals -------------
var Sx = 720;
var Sy = 480;

var Rad = 1.5;
var Grav = 9.8;
var Elastic = 2000;
var Att = 10;
var Points = 200;

var balls = [];
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



//Classes -------------
class Sphere {
	constructor(pos, r, mass) {
		this.pos = pos.copy();
		
		this.vel = createVector(0, 0);
		this.acc = createVector(0, 0);

		this.mass = mass;
		this.fixed = true;
	}
}

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

	do_circle(center, r, e) {
	    if(this.fixed) return;
		
	    var ds = this.pos.copy().sub(center);
	    var dist = ds.mag();
		
	    if(dist < r) {
			let k = ds.dot(this.vel) / (dist * dist);
			let p = ds.copy().mult(2 * k * e);
			this.vel.add(p);
			ds.mult(r / dist);
			this.pos = ds.add(center);
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
				stroke(e.stretch, 230, -e.stretch);
				strokeWeight(8);
				//setColor(i / size);
				line(lx, ly, e.pos.x, e.pos.y);
			}
			
			lx = e.pos.x;
			ly = e.pos.y;
			
			noStroke();
			//ellipse(e.pos.x, e.pos.y, 2*Rad, 2*Rad);
		})
	}
	
	draw_slither() {
		imageMode(CENTER);
		
		var lx = -1, ly = -1;
		var size = this.knots.length;
		
		for( let i = 0; i < size; i += 4) {
			let e = this.knots[i];
			
			let x = e.pos.x;
			let y = e.pos.y;
			
			push();
			translate(x, y);
			rotate(atan2(y - ly, x - lx));
			image(Body, 0, 0, 30, 30);
			pop();
			
			lx = x;
			ly = y;
			
		}
	
		
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

		return 50*x;
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
				e.stretch = athis.get_force(e.pos2, last.pos2, e.acc, last.acc);
			}
		})

		
		this.knots.forEach(function(e,i,a) {
			if(!e.fixed) {
				//Update positions and velocities
				e.vel.x = e.vel.x + e.acc.x * dt / 2;
				e.vel.y = e.vel.y + e.acc.y * dt / 2;

				e.pos.x = e.pos.x + e.vel.x * dt;
				e.pos.y = e.pos.y + e.vel.y * dt;

				e.vel.div(1 + Att / 10000);
				
				e.do_borders();
				
				for(let i = 0; i < balls.length; i++)
				{
					e.do_circle(balls[i].c, balls[i].r/2, -0.8);
				}
		
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
				e.vel.x += e.acc.x * dt;
				e.vel.y += e.acc.y * dt;
				
				e.pos.x += e.vel.x * dt;
				e.pos.y += e.vel.y * dt;
				
				e.vel.div(1 + Att / 10000);
				
				e.do_borders();
			}
		})
	}
}

class Ball
{
	constructor(c, r)
	{
		this.c = c;
		this.r = r;
	}
}

//Setup ---------------
var Bg = null;
var Head = null;
var Body = null;

function setup() {
	resizeCanvas(Sx, Sy);
	
	rope = new Rope(200, 60, Sx-200, 60, Points, 10);
	rope.knots[0].fixed = true;
	rope.knots[Points/2].fixed = true;
	//rope.knots[Points-1].fixed = true;
	//rope.knots[Points-1].mass = 90;

	gravity = createVector(0, Grav);

	Bg = loadImage("background.jpg");
	Head = loadImage("head.png");
	Body = loadImage("body.png");
}

//Draw ----------------
var lasttime = 0;

function draw() {
	
	var dt = millis() / 1000 - lasttime;
	lasttime += dt;
	
	gravity = createVector(0, Grav);

	fill(245);
	stroke(0);
	strokeWeight(2);
	rect(0, 0, Sx, Sy);
	
	imageMode(CORNER);	
	image(Bg, 0, 0);
	image(Bg, Bg.width, 0);

	//imageMode(CENTER);
	//image(Head, rope.knots[0].pos.x, rope.knots[0].pos.y);
	
	
	dt = 0.016;
	rope.draw_slither();
	stroke(0);
	strokeWeight(1.5);
	for(let i = 0; i < balls.length; i++) {	
		ellipse(balls[i].c.x, balls[i].c.y, balls[i].r, balls[i].r);
	}
	for(let i = 0; i < 10; i++) rope.midpoint(dt);
}

function mouseClicked() {
	if (mouseX < Sx && mouseX > 0 && mouseY < Sy && mouseY > 0) {
		var c = createVector(mouseX, mouseY);
		balls.push(new Ball(c, 20));
	}
}
