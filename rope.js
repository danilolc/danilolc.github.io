//############################
//Processing Rope
//############################

//Globals -------------
var Sx = 640
var Sy = 480

var gravity;

var rope;
var rad = 3;

//Functions
function drawV(v1, v2) {
	line(v1.x, v1.y, v1.x + v2.x, v1.y + v2.y);
}

//Classes -------------
class Knot {
	constructor(x, y) {
		this.pos = createVector(x,y);
		this.vel = createVector(0.2+random(0.2),0);
		this.acc = createVector(0,0);
		this.fixed = false;
	}
}

class Rope {
	constructor(x, y, knots, size = 20, angle = 180) {
		this.knots = [];
		
		var delta = size / knots;
		for (let i = 0; i < knots; i++)
			this.knots.push(new Knot(x, y + delta*i));

	}
	
	draw() {
		//background(210);
		fill(255, 0, 0);
		
		var lx = -1, ly = -1;
		
		this.knots.forEach(function(e,i,a){
			//if (lx != -1)
			//	line(lx, ly, e.pos.x, e.pos.y);
			
			lx = e.pos.x;
			ly = e.pos.y;
			
			ellipse(e.pos.x, e.pos.y, 2*rad, 2*rad);
		})
	}
	
	update() {
		background(210);
		
		var last = null;
		
		this.knots.forEach(function(e,i,a){
			if (!e.fixed) {
				e.acc = gravity;
				e.vel.add(e.acc);
				e.pos.add(e.vel);
				
				if (last != null) {
					var delta = last.pos.copy()
					delta.sub(e.pos)
					
					//e.vel.add(delta.mult(0.001));
					
					delta.div(delta.mag())
					
					delta.mult(30);
					
					drawV(e.pos, delta)
					
				}
				
				if (e.pos.y > Sy - rad && e.vel.y > 0) {
					e.vel.y = -e.vel.y * 0.8;
					e.pos.y = Sy - rad;
				}
			}
			
			last = e;
		})
	}
}

//Setup ---------------
function setup() {
	resizeCanvas(Sx, Sy, 1);
	fill(224, 150, 0);
	
	rope = new Rope(Sx / 2, 60, 4, 400);
	rope.knots[0].fixed = true;
	
	gravity = createVector(0,0.098 / 3);
}

//Draw ----------------
function draw() {
	rope.update();
	rope.draw();
}
