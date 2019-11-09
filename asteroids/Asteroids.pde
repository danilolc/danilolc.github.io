PImage p;
int w = 0;
int h = 0;

void setup()
{
  p = loadImage("a0.bmp");
  if(p == null) exit();
  size(512, 512);
  
  w = p.width;
  h = p.height;
  
  border();
  
  strokeWeight(3);
  
  //noSmooth();
  calccmmm();
  
}

void border()
{
  for(int x = 1; x < w-1; x++) for(int y = 1; y < h-1; y++)
  {
    if(p.pixels[x+w*y] != color(0, 0, 0)) continue;
    if(p.pixels[x+w*y+1] == color(255, 255, 255)) p.pixels[x+w*y] = color(255, 0, 255); else
    if(p.pixels[x+w*y-1] == color(255, 255, 255)) p.pixels[x+w*y] = color(255, 0, 255); else
    if(p.pixels[x+w*(y+1)] == color(255, 255, 255)) p.pixels[x+w*y] = color(255, 0, 255); else
    if(p.pixels[x+w*(y-1)] == color(255, 255, 255)) p.pixels[x+w*y] = color(255, 0, 255); else continue;
  }
  p.updatePixels();
}

void eat(int x, int y, int r)
{
  PVector cmt = new PVector(0, 0, 0);
  PVector c = new PVector(cm.x/cm.z, cm.y/cm.z);
  for(int i = x - r; i <= x + r; i++) for(int j = y - r; j <= y + r; j++)
  {
    if(i < 0 || i >= w) continue;
    if(j < 0 || j >= h) continue;
    int q = (i-x)*(i-x)+(j-y)*(j-y);
    if(q < r*r && (p.pixels[i+w*j] != color(255, 255, 255))) 
    {
      cmt.x += i;
      cmt.y += j;
      cmt.z++;
      mm -= 1/6 + (cm.x/cm.z-i)*(cm.x/cm.z-i)+(cm.y/cm.z-j)*(cm.y/cm.z-j);
      p.pixels[i+w*j] = color(255, 255, 255);
    }
    else if(p.pixels[i+w*j] == color(0, 0, 0) && q <= (r+1)*(r+1)) p.pixels[i+w*j] = color(255, 0, 255);
  }
  
  cm.x -= cmt.x;
  cm.y -= cmt.y;
  cm.z -= cmt.z;
  mm = mm - cm.z * ((cm.x/cm.z - c.x)*(cm.x/cm.z - c.x)+(cm.y/cm.z - c.y)*(cm.y/cm.z - c.y));
  
  
  
  p.updatePixels();
}

PVector cm = new PVector();
float mm = 0;

void calccmmm()
{
  cm.x = 0;
  cm.y = 0;
  cm.z = 0;
  mm = 0;
  
  for(int x = 0; x < w; x++) for(int y = 0; y < w; y++) if(p.pixels[x+w*y] != color(255, 255, 255))
  {
    cm.x += x;
    cm.y += y;
    cm.z++;
  }
  
  for(int x = 0; x < w; x++) for(int y = 0; y < w; y++) if(p.pixels[x+w*y] != color(255, 255, 255)) 
  mm += 1/6 + (cm.x/cm.z - x)*(cm.x/cm.z - x) + (cm.y/cm.z - y)*(cm.y/cm.z - y);
}

void mouseClicked()
{
  //eat(mouseX/4, mouseY/4, 30);
  walk(mouseX/4, mouseY/4);
  println("");
}

void walk(int x, int y)
{
 
}

void draw()
{
  background(0);
  image(p, 0, 0, 512, 512);
  fill(255, 0, 0);
  ellipse(4*cm.x / cm.z, 4*cm.y / cm.z, 10, 10);
  text("MOMENT: " + mm, 10, 10);
}
