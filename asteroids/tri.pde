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
