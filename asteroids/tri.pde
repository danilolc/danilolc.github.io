class Roc
{
  Tri t;
  float l;
  PVector pos, vel, acc, c;
  
  Roc(String src)
  {
    t = trimg(src);
    l = SIZE / 2;
    pos = new PVector();
    vel = new PVector();
    acc = new PVector();
    c = new PVector();
  }
  
  void draw()
  {
    pushMatrix();
    translate(pos.x, pos.y);
    rotate(pos.z);
    t.draw(c.x, c.y, l);
    fill(100, 255, 100);
    ellipse(0, 0, 5, 5);
    popMatrix();
    
  }
  
  void reCenter()
  {
    /*
    PVector k = new PVector(c.x, c.y, c.z);
    c = cm(t, 0, 0, l);
    k.x += c.x;
    k.y += c.y;
    pos.x += k.x * cos(-pos.z) - k.y * sin(-pos.z);
    pos.y += k.x * sin(-pos.z) + k.y * cos(-pos.z);
    */
  }
  
  void update(float dt)
  {
    pos.x += vel.x * dt + acc.x * dt*dt / 2;
    pos.y += vel.y * dt + acc.y * dt*dt / 2;
    pos.z += vel.z * dt + acc.z * dt*dt / 2;
    vel.x += acc.x*dt;
    vel.y += acc.y*dt;
    vel.z += acc.z*dt;
  }
}


final int DEPTH = 8;
final int SIZE = 1 << DEPTH;


class Tri
{
  Tri a, b, c, d, z;
  Boolean f, r;
  
  Tri()
  {
    a = null;
    b = null;
    c = null;
    d = null;
    f = false;
    r = false;
  }
  
  void draw(float x, float y, float l)
  {
    
    if(f)
    {
      stroke(170, 130, 150);
      fill(185, 122, 87);
      rect(x - l, y - l, 2*l, 2*l);
      
      return;
    }
    else
    {
      fill(255);
      //rect(x - l, y - l, 2*l, 2*l);
    }
    l /= 2;
    if(a != null) a.draw(x - l, y - l, l);
    if(b != null) b.draw(x + l, y - l, l);
    if(c != null) c.draw(x - l, y + l, l);
    if(d != null) d.draw(x + l, y + l, l);
  }
  
  void simplify()
  {
    
    if(a != null) a.simplify();
    if(b != null) b.simplify();
    if(c != null) c.simplify();
    if(d != null) d.simplify();
    
    
    if(a != null && a.f)
    if(b != null && b.f)
    if(c != null && c.f)
    if(d != null && d.f)
    {
      f = true;
      a = null;
      b = null;
      c = null;
      d = null;
    }
    
    
    if(a == null && b == null && c == null && d == null && z != null && !f)
    {
      if(z.a == this) z.a = null; else
      if(z.b == this) z.b = null; else
      if(z.c == this) z.c = null; else
      if(z.d == this) z.d = null;
    }
    
    
     
  }
  
}


Tri trimg(String str)
{
  PImage img = loadImage(str);
  if(img == null) return null;
  
  //img.loadPixels();
  if(img.width != SIZE | img.height != SIZE) return null;
  
  Tri t = new Tri();
  for(int x = 0; x < img.width; x++)
  {
    for(int y = 0; y < img.height; y++)
    {
      if(red(img.pixels[x + SIZE*y]) == 255)
      if(green(img.pixels[x + SIZE*y]) == 255)
      if(blue(img.pixels[x + SIZE*y]) == 255) continue;
    
      img.pixels[x+SIZE*y] = color(255, 0, 0);
     
      Tri k = t;
      for(int i = DEPTH - 1; i >= 0; i--)
      {
        if(((x >> i) & 1) == 0)
        {
          if(((y >> i) & 1) == 0)
          {
              if(k.a == null) 
              {
                k.a = new Tri();
                k.a.z = k;
              }
              k = k.a;
          }
          else
          {
            if(k.c == null) 
            {
                k.c = new Tri();
                k.c.z = k;
            }
            k = k.c;
          }
          
        }
        else
        {
          if(((y >> i) & 1) == 0)
          {
            if(k.b == null) 
            {
                k.b = new Tri();
                k.b.z = k;
            }
            k = k.b;
          }
          else
          {
            if(k.d == null) 
            {
                k.d = new Tri();
                k.d.z = k;
            }
            k = k.d;
          }
        }
      }
      k.f = true;
      while(true)
      {
        if(k.z == null) break;
        k = k.z;
        if(k.a == null) break;
        if(k.b == null) break;
        if(k.c == null) break;
        if(k.d == null) break;
        if(k.a.f && k.b.f && k.c.f && k.d.f)
        {
          k.a = null;
          k.b = null;
          k.c = null;
          k.d = null;
          k.f = true;
        }
        else break;
      }
    }
  }
  //img.updatePixels();
  //image(img, 0, 0);
  //simplify(t);
  return t;
}

void eatri(Tri t, float cx, float cy, float l, float x, float y, float r)
{
  if(2*l < 1) return;
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
    //t.a.f = t.f;
  }
  if(t.b == null)
  {
    t.b = new Tri();
    t.b.z = t;
    //t.b.f = t.f;
  }
  if(t.c == null)
  {
    t.c = new Tri();
    t.c.z = t;
    //t.c.f = t.f;
  }
  if(t.d == null)
  {
    t.d = new Tri();
    t.d.z = t;
    //t.d.f = t.f;
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
  
}

PVector cm(Tri t, float x, float y, float l)
{
  if(t == null) return new PVector(0, 0, 0);
  
  if(t.f) return new PVector(x, y, 4*l*l);
  PVector cma = cm(t.a, x - l/2, y - l/2, l/2);
  PVector cmb = cm(t.b, x + l/2, y - l/2, l/2);
  PVector cmc = cm(t.c, x - l/2, y + l/2, l/2);
  PVector cmd = cm(t.d, x + l/2, y + l/2, l/2);
  float mass = cma.z+cmb.z+cmc.z+cmd.z;
  if(mass == 0) return new PVector(0, 0, 0);
  return new PVector(
  (cma.x*cma.z + cmb.x*cmb.z + cmc.x*cmc.z + cmd.x*cmd.z) / mass,
  (cma.y*cma.z + cmb.y*cmb.z + cmc.y*cmc.z + cmd.y*cmd.z) / mass,
  mass
  );
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

Tri trixyt = null;
int trixyi = 0;
Boolean trixy(Tri t, int x, int y)
{
  if(t == null) return false;
  
  for(trixyi = DEPTH - 1; trixyi >= 0; trixyi--)
  {
    trixyt = t;
    if(t == null) return false;
    if(t.f) return true;
    
    if(((x >> trixyi) & 1) == 0)
    {
      if(((y >> trixyi) & 1) == 0)
      {
        t = t.a;
      }
      else
      {
        t = t.c;
      }
    }
    else
    {
      if(((y >> trixyi) & 1) == 0)
      {
        t = t.b;
      }
      else
      {
        t = t.d;
      }
    }
  }
  if(t == null) return false;
  if(t.f) return true;
  return false;
}

void wash(Tri t)
{
  if(t == null) return;
  t.r = false;
  if(t.a != null) wash(t.a);
  if(t.b != null) wash(t.b);
  if(t.c != null) wash(t.c);
  if(t.d != null) wash(t.d);
}

void carve(Roc roc, float x, float y, float r)
{
  x -= roc.pos.x;
  y -= roc.pos.y;
  eatri(roc.t, 0, 0, roc.l, x * cos(-roc.pos.z) - y * sin(-roc.pos.z) - roc.c.x, x * sin(-roc.pos.z) + y * cos(-roc.pos.z) - roc.c.y, r);
  roc.t.simplify();
}

void rocbomb(Roc roc, float X, float Y)
{
  float x = X - roc.pos.x;
  float y = Y - roc.pos.y;

  if(collide(r.t, 0, 0, r.l, x * cos(-roc.pos.z) - y * sin(-roc.pos.z) - roc.c.x, x * sin(-roc.pos.z) + y * cos(-roc.pos.z) - roc.c.y))
  {
    carve(roc, X, Y, 40);
    roc.reCenter();
    bomb = null;
  }
}

Roc r = null;
void setup()
{
  size(512, 512);
  //fullScreen();
  noStroke();
  rectMode(CORNER);
  background(0);
  r = new Roc("img.png");
  r.l = 300;
  if(r.t == null) exit();
  r.reCenter();
}

PVector bomb = null;

void draw()
{
  background(0);
  r.pos = new PVector(256, 256, (float)millis() / 1000);
  
  
  if(bomb != null)
  {
    bomb.y += bomb.z;
    bomb.z += 0.2;
    fill(255, 0, 100);
    ellipse(bomb.x, bomb.y, 15, 15);
    rocbomb(r, bomb.x, bomb.y);
  }
  if(mousePressed) bomb = new PVector(mouseX, mouseY, 0);
  
  r.draw();
}
