//############################
//Processing Asteroids
//############################

class Tri {
  constructor() {
    this.a = null;
    this.b = null;
    this.c = null;
    this.d = null;
    this.z = null;

    this.f = false;
    this.r = false;
  }
  
  draw(x, y, l) {
    if(this.f) {
      if(this.r) fill(0, 0, 255);
      else fill(255, 0, 0);
      rect(x - l, y - l, 2*l, 2*l);
      return;
    } else {
      //fill(255);
      //rect(x - l, y - l, 2*l, 2*l);
    }
    l /= 2;
    if(this.a != null) this.a.draw(x - l, y - l, l);
    if(this.b != null) this.b.draw(x + l, y - l, l);
    if(this.c != null) this.c.draw(x - l, y + l, l);
    if(this.d != null) this.d.draw(x + l, y + l, l);
  }

  simplify() {
    
    if(this.a != null) this.a.simplify();
    if(this.b != null) this.b.simplify();
    if(this.c != null) this.c.simplify();
    if(this.d != null) this.d.simplify();
    
    if(this.a != null && this.a.f)
    if(this.b != null && this.b.f)
    if(this.c != null && this.c.f)
    if(this.d != null && this.d.f) {
      this.f = true;
      this.a = null;
      this.b = null;
      this.c = null;
      this.d = null;
    }
  
    if(this.a == null)
    if(this.b == null)
    if(this.c == null)
    if(this.d == null)
    if(this.z != null)
    if(!this.f) {
      if(this.z.a == this) this.z.a = null; else
      if(this.z.b == this) this.z.b = null; else
      if(this.z.c == this) this.z.c = null; else
      if(this.z.d == this) this.z.d = null;
    }
  }
}

class Roc {
  
  constructor(img) {
    this.img = img;
    this.t = trimg(img);
    this.l = SIZE / 2;
    
    this.rot = 0;
    this.omg = 0;
    this.alp = 0;
    
    this.pos = createVector(0, 0);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);

    this.cm = createVector(0, 0);
  }
  
  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rot);
    translate(-this.cm.x, -this.cm.y);
    this.t.draw(0, 0, this.l);
    //image(this.img, 0, 0);
    pop();
  }
}


function eatri(t, cx, cy, l, x, y, r) {
  if(2*l < 1) return;
  if(t == null) return;
  
  var dx = x - cx;
  var dy = y - cy;
  
  var B = false;
  var hr = (x >= cx - l && x <= cx + l);
  var vr = (y >= cy - l && y <= cy + l);
  var a = (dx-l)*(dx-l)+(dy-l)*(dy-l) <= r*r;
  var b = (dx+l)*(dx+l)+(dy-l)*(dy-l) <= r*r;
  var c = (dx-l)*(dx-l)+(dy+l)*(dy+l) <= r*r;
  var d = (dx+l)*(dx+l)+(dy+l)*(dy+l) <= r*r;
  
  B |= (hr && vr);
  B |= (abs(dx-l) <= r && vr);
  B |= (abs(dx+l) <= r && vr);
  B |= (abs(dy-l) <= r && hr);
  B |= (abs(dy+l) <= r && hr);
  B |= a | b | c | d;
  
  if(!B) return;
  
  if(a && b && c && d) {
    if(t.z == null) return;
    fill(255, 255, 0);
    //rect(cx - l, cy - l, 2*l, 2*l);
    if(t.z.a == t) t.z.a = null; else
    if(t.z.b == t) t.z.b = null; else
    if(t.z.c == t) t.z.c = null; else
    if(t.z.d == t) t.z.d = null;
    
    return;
  }
  
  //fill(255, 0, 255);
  //rect(cx - l, cy - l, 2*l, 2*l);
  
  if(t.a == null) {
    t.a = new Tri();
    t.a.z = t;
    //t.a.f = t.f;
  }
  if(t.b == null) {
    t.b = new Tri();
    t.b.z = t;
    //t.b.f = t.f;
  }
  if(t.c == null) {
    t.c = new Tri();
    t.c.z = t;
    //t.c.f = t.f;
  }
  if(t.d == null) {
    t.d = new Tri();
    t.d.z = t;
    //t.d.f = t.f;
  }
  
  if(t.f) {
    t.f = false;
    t.a.f = true;
    t.b.f = true;
    t.c.f = true;
    t.d.f = true;
  }
  
  l /= 2;
  
  eatri(t.a, cx - l, cy - l, l, x, y, r);
  eatri(t.b, cx + l, cy - l, l, x, y, r);
  eatri(t.c, cx - l, cy + l, l, x, y, r);
  eatri(t.d, cx + l, cy + l, l, x, y, r);
}



const DEPTH = 8;
const SIZE = 1 << DEPTH;

var IMG;
function preload() {
	IMG = loadImage("img.bmp");
}

function trimg(img){

  if(img == null) return null;
  var ret = new Tri();
  
  img.loadPixels();
  
  if(img.width != SIZE || img.height != SIZE) return ret;
  
  for(let x = 0; x < SIZE; x++)
  for(let y = 0; y < SIZE; y++) {
    
    let pos = x + y*SIZE;
	  pos *= 4;
	
	  if(img.pixels[pos] == 255)
      if(img.pixels[pos + 1] == 255)
        if(img.pixels[pos + 2] == 255) {
          img.pixels[pos + 3] = 0;
          continue;
        }
    
    var t = ret;
    
    for(let k = DEPTH - 1; k >= 0; k--) {
      if(((x >> k) & 1) == 0) {
        if(((y >> k) & 1) == 0) {
          if(t.a == null) {
            t.a = new Tri();
            t.a.z = t;
          }
          t = t.a;
        
        } else {
          if(t.c == null) {
            t.c = new Tri();
            t.c.z = t;
          }
          t = t.c;
        }
      } else {
        if(((y >> k) & 1) == 0) {
          if(t.b == null) {
            t.b = new Tri();
            t.b.z = t;
          }
          t = t.b;
        } else {
          if(t.d == null) {
            t.d = new Tri();
            t.d.z = t;
          }
          t = t.d;
        }
      }
    }
    t.f = true;
    var m = t.z;

    //Simplify
    while(true) {
      if(m == null) return ret;
      
      if(m.a != null)
      if(m.b != null)
      if(m.c != null)
      if(m.d != null)
      if(m.a.f && m.b.f && m.c.f && m.d.f) { 
        m.f = true;
        m.a = null;
        m.b = null;
        m.c = null;
        m.d = null;
        m = m.z;
        continue;
      }
      
      break; 
    }  
  }
  
  img.updatePixels();

  return ret;
}

function cm(t, x, y, l){

  if(t == null) return createVector(0, 0, 0);
  if(t.f) return createVector(x, y, 4*l*l);
  
  l /= 2;
  
  var a = cm(t.a, x - l, y - l, l);
  var b = cm(t.b, x + l, y - l, l);
  var c = cm(t.c, x - l, y + l, l);
  var d = cm(t.d, x + l, y + l, l);
  
  var mass = a.z + b.z + c.z + d.z;
  if(mass == 0) return createVector(0, 0, 0);
  
  var mx = a.x*a.z + b.x*b.z + c.x*c.z + d.x*d.z;
  var my = a.y*a.z + b.y*b.z + c.y*c.z + d.y*d.z;
  return createVector(mx / mass, my / mass, mass);
}

function collide(t, cx, cy, l, x, y) {
  if(t == null) return false;
  
  if(x < cx - l || x > cx + l || y < cy - l || y > cy + l) return false;
  
  if(t.f) return true;
  l/= 2;
  
  var b = false;
  if(t.a != null) b |= collide(t.a, cx - l, cy - l, l, x, y);
  if(t.b != null) b |= collide(t.b, cx + l, cy - l, l, x, y);
  if(t.c != null) b |= collide(t.c, cx - l, cy + l, l, x, y);
  if(t.d != null) b |= collide(t.d, cx + l, cy + l, l, x, y);
  
  return b;
}

var trixyt = null;
var trixyi = 0;

function trixy(t, x, y) {
  if(t == null) return false;
  
  for(trixyi = DEPTH - 1; trixyi >= 0; trixyi--) {
    trixyt = t;
    if(t == null) return false;
    if(t.f) return true;
    
    if(((x >> trixyi) & 1) == 0) {
      if(((y >> trixyi) & 1) == 0)
        t = t.a;
      else
        t = t.c;
    
    } else {
      if(((y >> trixyi) & 1) == 0)
        t = t.b;
      else
        t = t.d;
    }
  }
  
  if(t == null) return false;
  if(t.f) return true;
  
  return false;
}


function wash(t) {
  if(t == null) return;
  t.r = false;
  if(t.a != null) wash(t.a);
  if(t.b != null) wash(t.b);
  if(t.c != null) wash(t.c);
  if(t.d != null) wash(t.d);
}

function carve(roc, x, y, r) {
  x -= roc.pos.x;
  y -= roc.pos.y;
  eatri(roc.t, 0, 0, roc.l, x * cos(-roc.rot) - y * sin(-roc.rot), x * sin(-roc.rot) + y * cos(-roc.rot), r);
  roc.t.simplify();
}

var c = null;
var r = null;

function setup() {
  resizeCanvas(512, 512, 1);
  //noStroke();
  rectMode(CORNER);
  //smooth(4);
  
  r = new Roc(IMG);
  if(r == null) return;
  
  //println("MAS: " + c.z);
  //strokeWeight(6);
  stroke(0, 255, 0);
  
}

var a = 0;

function draw(){
  r.pos = createVector(256, 256);
  r.rot = millis() / 1000;
  if(mouseIsPressed) carve(r, mouseX, mouseY, 20);
  background(0);
  r.draw();
}
