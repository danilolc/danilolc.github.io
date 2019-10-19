//############################
//Processing Rope
//############################

//Globals -------------
var Sx = 720;
var Sy = 480;

var Grav = 9.8;
var Elastic = 2000;
var Points = 200;
var Tam = 300;
var Att = 10;
var Itt = 30;
var Mode = "Normal";
var Method = "Midpoint";
var Input = "PutBalls";

var Rad = 1.5;

var balls = [];
var gravity = null;
var rope = null;

//Functions
function drawV(v1, v2, u = false, magn = 10) {
	
	var a = v2.copy();
	var b = a.len();
	
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
	strokeWeight(13);
}



//Classes -------------
class Sphere {
	constructor(pos, r, mass) {
		this.pos = pos.copy();
		
		this.vel = new Vet2(0, 0);
		this.acc = new Vet2(0, 0);

		this.mass = mass;
		this.fixed = true;
	}
}

class Knot {
	constructor(pos, mass) {
		this.pos = pos.copy();
		
		this.vel = new Vet2(0, 0);
		this.acc = new Vet2(0, 0);
	
		this.pos2 = new Vet2(0, 0);
	
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
		
	    var ds = this.pos.$sub(center);
	    var dist = ds.len();
		
	    if(dist < r) {
			let k = ds.dot(this.vel) / (dist * dist);
			let p = ds.$mult(2 * k * e);
			
			ds.mult(r / dist);
			ds.sum(center);
			
			this.vel.sum(p);
			this.pos.set(ds);
	    }
	}

}

class Rope {
	constructor(sx, sy, ex, ey, knots, mass) {
		var start = new Vet2(sx, sy);		
		var end = new Vet2(ex, ey);

		var d = end.$sub(start);
		this.size = d.len();
		this.delta = this.size / (knots - 1);
		this.K = Elastic;
		
		d.div(knots - 1);

		this.knots = [];
		for (let i = 0; i < knots; i++) {
			this.knots.push(new Knot(start, mass / knots));
			start.sum(d);
		}
	}
	
	nexter(x, y) {
		var dist = -1;
		var v = new Vet2(x, y);
		
		this.knots.forEach(function(e,i,a){
			//TODO - get the rope point that is nexter than point v
		})
	}
	
	draw() {
		var lx = -1, ly = -1;
		fill(255, 0, 0);
		
		var size = this.knots.length;
		this.knots.forEach(function(e,i,a){
			if (lx != -1) {
				if (Mode == "Normal") {
					let x = e.stretch;
					stroke(25*x*x-255, 255-50*x, 190);
					strokeWeight(8);
				}
				else if (Mode == "Pd")
					setColor(i / size);
				else if (Mode == "Pontos") {
					stroke(0);
					strokeWeight(1);					
				}
					
				line(lx, ly, e.pos.x, e.pos.y);
			}
			
			lx = e.pos.x;
			ly = e.pos.y;
			
			noStroke();
			if (Mode == "Pontos")
				ellipse(e.pos.x, e.pos.y, 2*Rad, 2*Rad);
		})
	}
	
	draw_slither() {
		imageMode(CENTER);
		
		var points = this.knots.length;
		
		let interval = int(points / (this.size / 7));
		if (interval < 1)
			interval = 1;
		
		this.size = 0;
		let i = 0;
		while(true) {
			let e = this.knots[i];
			
			i += interval;
			if (i >= points) break;
			
			let next = this.knots[i];
			
			let x = e.pos.x;
			let y = e.pos.y;
			
			let nx = next.pos.x;
			let ny = next.pos.y;
			
			this.size += next.pos.dist(e.pos);
			
			push();
			translate(x, y);
			rotate(atan2(ny - y, nx - x));
			
			if (i >= points - interval)
				image(Head, 0, 0, 30, 30);
			else
				image(Body, 0, 0, 30, 30);
			pop();
			
		}			

		
	}

	get_force(p1, p2, v1, v2) {
		//Calculate the vector between knots
		let d = p1.$sub(p2);
		
		//Get the X
		let dl = d.len();
		if (dl == 0) return 0;
		
		let x = dl - this.delta;
		
		//Make the vector length be X
		d.mult(x / dl);
		
		//F = -Kx
		d.mult(-this.K);
		
		//Add the force on both vectors
		v1.sum(d);
		v2.sub(d);

		return x;
	}

	//Midpoint method
	midpoint(dt) {
		var athis = this;

		this.knots.forEach(function(e,i,a) {
			//Estimate a next position to calculate x''
			e.pos2.set(e.pos);
			e.pos2.sumK(e.vel, dt / 2);

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
				e.vel.sumK(e.acc, dt / 2);

				e.pos.sumK(e.acc, dt);

				e.vel.div(1 + Att / 10000);
				
				e.do_borders();
				for(let i = 0; i < balls.length; i++)
					if (balls[i].active)
						e.do_circle(balls[i].c, balls[i].r, -0.8);
		
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
				e.vel.sumK(e.acc, dt);

				e.pos.sumK(e.vel, dt);
				
				e.vel.div(1 + Att / 10000);
				
				e.do_borders();
				for(let i = 0; i < balls.length; i++)
					if (balls[i].active)
						e.do_circle(balls[i].c, balls[i].r, -0.8);
			}
		})
	}
}

class Ball {
	constructor(c, r) {
		this.c = c;
		this.r = r;
		this.active = true;
	}
}

//Setup ---------------
var Bg = null;
var Head = null;
var Body = null;

var mouseBall = -1;
var ballputting = -1;

var mouseIsIn = () => (mouseX < Sx && mouseX > 0 && mouseY < Sy && mouseY > 0);

function set_mouseball() {
	if (mouseBall == -1) {
		let c = new Vet2(mouseX, mouseY);
		let ball = new Ball(c, 20);
		ball.active = mouseIsPressed;
		balls.push(ball);
		mouseBall = balls.length - 1;
	}
}

function setup_circles() {
	balls = [];
	mouseBall = -1;
	set_mouseball();
}

function setup() {
	resizeCanvas(Sx, Sy);
	
	rope = new Rope((Sx - Tam) / 2, 60, (Sx + Tam) / 2, 60, Points, 10);
	set_mouseball();
	
	if (Input == "PutBalls" || Input == "MouseRope") {
		rope.knots[0].fixed = true;
		rope.knots[Points-1].fixed = true;
	} else if (Input == "MouseBall") {
		rope.knots[0].fixed = true;
		rope.knots[int(Points) / 2].fixed = true;
	}

	gravity = new Vet2(0, Grav);

	//Bg = loadImage("../background.jpg");
	//Head = loadImage("../head.png");
	//Body = loadImage("../body.png");
}

//Draw ----------------
var lasttime = 0;

function draw() {
	
	balls[mouseBall].active = false;
	if (Input == "MouseRope") {
		if (mouseIsPressed && mouseIsIn()) {
			rope.knots[Points-1].pos.x = mouseX;
			rope.knots[Points-1].pos.y = mouseY;
		}
	} else if (Input == "MouseBall") {
		balls[mouseBall].c.x = mouseX;
		balls[mouseBall].c.y = mouseY;
		balls[mouseBall].active = mouseIsPressed;
	} else if (Input == "PutBalls") {
		if (ballputting != -1) {
			balls[ballputting].c.x = mouseX;
			balls[ballputting].c.y = mouseY;
			if (!mouseIsPressed)
				ballputting = -1;
		}
	}

	//CALCULATE
	
	var dt = millis() / 1000 - lasttime;
	lasttime += dt;
	
	gravity = new Vet2(0, Grav);
	
	dt = 0.016;
	if (Method == "Midpoint")
		for (let i = 0; i < Itt; i++) rope.midpoint(dt);
	else if (Method == "Euler")
		for (let i = 0; i < Itt; i++) rope.euler(dt);

	//DRAW
	
	fill(245);
	noStroke();
	rect(0, 0, Sx, Sy);
	
	if (Mode == "Normal" || Mode == "Pd" || Mode == "Pontos") {
		rope.draw();
		
		stroke(0);
		strokeWeight(1.5);
		fill(65,184,37);
		for(let i = 0; i < balls.length; i++)
			if (balls[i].active)
				ellipse(balls[i].c.x, balls[i].c.y, balls[i].r * 2, balls[i].r * 2);
	}
	else if (Mode == "Slither") {
		imageMode(CORNER);	
		image(Bg, 0, 0);
		image(Bg, Bg.width, 0);		
		rope.draw_slither();
		
		stroke(0);
		strokeWeight(2);
		fill(255,255,255);
		for(let i = 0; i < balls.length; i++)
			if (balls[i].active)
				ellipse(balls[i].c.x, balls[i].c.y, balls[i].r * 2, balls[i].r * 2);
	}

}

function mousePressed() {
	if (Input == "PutBalls" && mouseIsIn()) {
		var c = new Vet2(mouseX, mouseY);
		balls.push(new Ball(c, 15));
		ballputting = balls.length - 1;
	}
}
