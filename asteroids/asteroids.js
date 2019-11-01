//############################
//Processing Asteroids
//############################
/*
//Classes -------------


//Globals -------------
var Sx = 640;
var Sy = 480;

//Setup ---------------
function setup() {
	resizeCanvas(Sx,Sy,1);
	background(200);
}

//Draw ----------------
function draw() {
	
}
*/

var count = 0;

class Tri
{ 
  constructor()
  {
    count++;
    this.a = null;
    this.b = null;
    this.c = null;
    this.d = null;
    this.z = null;  
    this.f = false;
  }
  
  draw(x, y, l)
  {
    if(this.f)
    {
      fill(255, 0, 0);
      rect(x - l, y - l, 2*l, 2*l);
      return;
    }
    else
    {
      //fill(255, 255, 255);
      //rect(x - l, y - l, 2*l, 2*l);
    }
    l /= 2;
    if(this.a != null) this.a.draw(x - l, y - l, l);
    if(this.b != null) this.b.draw(x + l, y - l, l);
    if(this.c != null) this.c.draw(x - l, y + l, l);
    if(this.d != null) this.d.draw(x + l, y + l, l);
  }
  
}

const DEPTH = 7;
var IMG;
function preload() {
	IMG = loadImage("img.bmp");
}


function trimg(src)
{
  var img = IMG;//loadImage(src);
  
  if(img == null) return null;
  var ret = new Tri();
  
  img.loadPixels();
  
  if(img.width != 1 << DEPTH || img.height != 1 << DEPTH) return ret;
  
  for(let x = 0; x < (1 << DEPTH); x++)
  for(let y = 0; y < (1 << DEPTH); y++)
  {
	let pos = x + y*(1 << DEPTH);
	pos *= 4;
	
	if(img.pixels[pos] == 255)
    if(img.pixels[pos + 1] == 255)
    if(img.pixels[pos + 2] == 255) continue;
    
    var t = ret;
    
    for(let k = DEPTH - 1; k >= 0; k--)
    {
      if(((x >> k) & 1) == 0)
      {
        if(((y >> k) & 1) == 0)
        {
          if(t.a == null)
          {
            t.a = new Tri();
            t.a.z = t;
          }
          t = t.a;
        }
        else
        {
          if(t.c == null)
          {
            t.c = new Tri();
            t.c.z = t;
          }
          t = t.c;
        }
      }
      else
      {
        if(((y >> k) & 1) == 0)
        {
          if(t.b == null)
          {
            t.b = new Tri();
            t.b.z = t;
          }
          t = t.b;
        }
        else
        {
          if(t.d == null)
          {
            t.d = new Tri();
            t.d.z = t;
          }
          t = t.d;
        }
      }
    }
    t.f = true;
    var m = t.z;
    while(true)
    {
      if(m == null) return ret;
      if(m.a != null)
      if(m.b != null)
      if(m.c != null)
      if(m.d != null)
      if(m.a.f && m.b.f && m.c.f && m.d.f)
      { 
        m.f = true;
        m.a = null;
        m.b = null;
        m.c = null;
        m.d = null;
        m = m.z;
        count -= 4;
        continue;
      }
      
      break;
      
    }
    
    
  }
  
  
  
  //println(count + " tris");
  return ret;
}

function cm(t, x, y, l)
{
  if(t == null) return createVector(0, 0, 0);
  if(t.f) return createVector(x, y, 4*l*l);
  l /= 2;
  var a = cm(t.a, x - l, y - l, l);
  var b = cm(t.b, x + l, y - l, l);
  var c = cm(t.c, x - l, y + l, l);
  var d = cm(t.d, x + l, y + l, l);
  
  var mass = a.z+b.z+c.z+d.z;
  
  if(mass == 0) return createVector(0, 0, 0);
  
  return createVector(
  (a.x*a.z+b.x*b.z+c.x*c.z+d.x*d.z) / mass,
  (a.y*a.z+b.y*b.z+c.y*c.z+d.y*d.z) / mass,
  mass
  );
}

function setup()
{
  
  
  resizeCanvas(512, 512, 1);
  background(0);
  noStroke();
  rectMode(CORNER);
  var t = trimg("img.bmp");
  print(t);
  if(t == null) return;
  t.draw(1 << DEPTH - 1, 1 << DEPTH - 1, 1 << DEPTH - 1);
  var c = cm(t, 1 << DEPTH - 1, 1 << DEPTH - 1, 1 << DEPTH - 1);
  //println("MAS: " + c.z);
  strokeWeight(8);
  stroke(0, 255, 0);
  point(c.x, c.y);
}

function draw()
{}
