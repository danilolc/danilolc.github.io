//############################
//Processing Rope
//############################

//Globals -------------
var Sx = 640
var Sy = 480

var gravity;

var rope;
var rad = 2;

var Grav = 0.000002;
var Speed = 10;
var Max = 0.005;

//Functions
function drawV(v1, v2) {
	line(v1.x, v1.y, v1.x + v2.x, v1.y + v2.y);
}

//Classes -------------
class Knot {
	constructor(x, y) {
		this.pos = createVector(x,y);
		this.vel = createVector(0,0);
		this.acc = createVector(0,0);
		this.fixed = false;
		this.stretch = 0;
	}
}

class Rope {
	constructor(x, y, knots, size = 20, angle = 180) {
		this.knots = [];
		this.delta = size / knots;
		
		for (let i = 0; i < knots; i++)
			this.knots.push(new Knot(x + this.delta*i, y));

	}
	
	draw() {
		background(210);
		fill(255, 0, 0);
		
		var lx = -1, ly = -1;
		
		this.knots.forEach(function(e,i,a){
			if (lx != -1) {
				stroke(e.stretch,-e.stretch,0);
				line(lx, ly, e.pos.x, e.pos.y);
			}
			
			lx = e.pos.x;
			ly = e.pos.y;
			
			noStroke();
			ellipse(e.pos.x, e.pos.y, 2*rad, 2*rad);
		})
	}
	
	update() {
		//background(210);
		
		var last = null;
		var nthis = this;
		
		this.knots.forEach(function(e,i,a){
			if (!e.fixed) {
				
				e.pos.x += e.vel.x * Speed;
				e.pos.y += e.vel.y * Speed;
				e.vel.x += e.acc.x * Speed;
				e.vel.y += e.acc.y * Speed;
				
				if (e.pos.y > Sy - rad && e.vel.y > 0) {
					e.vel.y = -e.vel.y * 0.8;
					e.pos.y = Sy - rad;
				}
				if (e.pos.y < 0 && e.vel.y < 0) {
					e.vel.y = -e.vel.y * 0.8;
					e.pos.y = rad;
				}
				if (e.pos.x > Sx - rad && e.vel.x > 0) {
					e.vel.x = -e.vel.x * 0.8;
					e.pos.x = Sx - rad;
				}
				if (e.pos.x < 0 && e.vel.x < 0) {
					e.vel.x = -e.vel.x * 0.8;
					e.pos.x = rad;
				}
			}
		})
		
		this.knots.forEach(function(e,i,a){
			//if (!e.fixed) {
				if (last == null) {
					last = e;
					return;
				}
				
				e.acc.set(gravity);
				
				var d = e.pos.copy();
				d.sub(last.pos)
				
				var dm = d.mag();
				var t = dm - nthis.delta;
				
				e.stretch = 2*t;
				
				if (t > 0) {
					let t2 = t * t;
					let a = d.copy();
					a.mult(t2*10);
					
					if(100 * dm * t2 > Max)
						a.mult(Max / (100*dm*t2));
					
					last.acc.add(a);
					e.acc.sub(a);
					
				}
				
				
			//}
			
			last = e;
		})
	}
}

//Setup ---------------
function setup() {
	resizeCanvas(Sx, Sy, 1);
	fill(224, 150, 0);
	
	let n = 10;
	
	rope = new Rope(120, 60, n, 400);
	rope.knots[0].fixed = true;
	rope.knots[n-1].fixed = true;
	
	gravity = createVector(0, Grav);
}

//Draw ----------------
function draw() {
	rope.update();
	rope.draw();
}
