int count = 0;

class Tri
{
  Tri a, b, c, d, z;
  Boolean f;
  
  Tri()
  {
    count++;
    a = null;
    b = null;
    c = null;
    d = null;
    z = null;  
    f = false;
  }
  
  void draw(float x, float y, float l)
  {
    if(f)
    {
      fill(255, 0, 0);
      rect(x - l, y - l, 2*l, 2*l);
      return;
    }
    else
    {
      fill(255, 255, 255);
      //rect(x - l, y - l, 2*l, 2*l);
    }
    l /= 2;
    if(a != null) a.draw(x - l, y - l, l);
    if(b != null) b.draw(x + l, y - l, l);
    if(c != null) c.draw(x - l, y + l, l);
    if(d != null) d.draw(x + l, y + l, l);
  }
  
}

final int DEPTH = 8;

Tri trimg(String src)
{
  PImage img = loadImage(src);
  
  if(img == null) return null;
  Tri ret = new Tri();
  
  img.loadPixels();
  if(img.width != 1 << DEPTH || img.height != 1 << DEPTH) return ret;
  for(int x = 0; x < (1 << DEPTH); x++)
  for(int y = 0; y < (1 << DEPTH); y++)
  {
    if(red(img.pixels[x + y*(1 << DEPTH)]) == 255)
    if(green(img.pixels[x + y*(1 << DEPTH)]) == 255)
    if(blue(img.pixels[x + y*(1 << DEPTH)]) == 255) continue;
    
    Tri t = ret;
    
    for(int k = DEPTH - 1; k >= 0; k--)
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
    Tri m = t.z;
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
        //count -= 4;
        continue;
      }
      
      break;
      
    }
    
    
  }
  
  
  
  println(count + " tris");
  return ret;
}


void eatri(Tri t, float cx, float cy, float l, float x, float y, float r)
{
  if(l < 1) return;
  if(t == null) return;
  
  float dx = x - cx;
  float dy = y - cy;
  
  Boolean B = false;
  Boolean hr = (x >= cx - l && x <= cx + l);
  Boolean vr = (y >= cy - l && y <= cy + l);
  Boolean a = (dx-l)*(dx-l)+(dy-l)*(dy-l) <= r*r;
  Boolean b = (dx+l)*(dx+l)+(dy-l)*(dy-l) <= r*r;
  Boolean c = (dx-l)*(dx-l)+(dy+l)*(dy+l) <= r*r;
  Boolean d = (dx+l)*(dx+l)+(dy+l)*(dy+l) <= r*r;
  
  B |= (hr && vr);
  B |= (abs(dx-l) <= r && vr);
  B |= (abs(dx+l) <= r && vr);
  B |= (abs(dy-l) <= r && hr);
  B |= (abs(dy+l) <= r && hr);
  B |= a | b | c | d;
  
  if(!B) return;
  
  if(a && b && c && d)
  {
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
  
  if(t.a == null)
  {
    t.a = new Tri();
    t.a.z = t;
    t.a.f = t.f;
  }
  if(t.b == null)
  {
    t.b = new Tri();
    t.b.z = t;
    t.b.f = t.f;
  }
  if(t.c == null)
  {
    t.c = new Tri();
    t.c.z = t;
    t.c.f = t.f;
  }
  if(t.d == null)
  {
    t.d = new Tri();
    t.d.z = t;
    t.d.f = t.f;
  }
  
  if(t.f)
  {
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
  simplify(t);
  
}

void simplify(Tri t)
{
  if(t == null) return;
  if(t.a != null) simplify(t.a);
  if(t.b != null) simplify(t.b);
  if(t.c != null) simplify(t.c);
  if(t.d != null) simplify(t.d);
  
  if(t.a != null && t.a.f)
  if(t.b != null && t.b.f)
  if(t.c != null && t.c.f)
  if(t.d != null && t.d.f)
  {
    t.f = true;
    t.a = null;
    t.b = null;
    t.c = null;
    t.d = null;
  }
   
}

Boolean collide(Tri t, float cx, float cy, float l, float x, float y)
{
  if(t == null) return false;
  
  if(x < cx - l || x > cx + l || y < cy - l || y > cy + l) return false;
  
  if(t.f) return true;
  l/= 2;
  
  Boolean b = false;
  if(t.a != null) b |= collide(t.a, cx - l, cy - l, l, x, y);
  if(t.b != null) b |= collide(t.b, cx + l, cy - l, l, x, y);
  if(t.c != null) b |= collide(t.c, cx - l, cy + l, l, x, y);
  if(t.d != null) b |= collide(t.d, cx + l, cy + l, l, x, y);
  
  return b;
}

PVector cm(Tri t, float x, float y, float l)
{
  if(t == null) return new PVector(0, 0, 0);
  if(t.f) return new PVector(x, y, 4*l*l);
  l /= 2;
  PVector a = cm(t.a, x - l, y - l, l);
  PVector b = cm(t.b, x + l, y - l, l);
  PVector c = cm(t.c, x - l, y + l, l);
  PVector d = cm(t.d, x + l, y + l, l);
  float mass = a.z+b.z+c.z+d.z;
  if(mass == 0) return new PVector(0, 0, 0);
  return new PVector(
  (a.x*a.z+b.x*b.z+c.x*c.z+d.x*d.z) / mass,
  (a.y*a.z+b.y*b.z+c.y*c.z+d.y*d.z) / mass,
  mass
  );
}

void setup()
{
  size(512, 512);
  rectMode(CORNER);
  Tri t = trimg("img.bmp");
  if(t == null) return;
  t.draw(256, 256, 256);
  PVector c = cm(t, 256, 256, 256);
  println("MAS: " + c.z);
  strokeWeight(8);
  stroke(0, 255, 0);
  point(c.x, c.y);
}

void draw()
{}
