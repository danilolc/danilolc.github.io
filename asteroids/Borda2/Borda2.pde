//   1
//2 | 0
//  3
final int[] DX = {1, 0, -1, 0};
final int[] DY = {0, -1, 0, 1};
final int R = 25;
final int RELOAD = 45;
final color BColor = color(123,255,123,123);

void clean(PImage img) {
  for(int x = 0; x < img.width; x++)
  for(int y = 0; y < img.height; y++)
  {
    color c = img.pixels[x + y * img.width];
    //img.pixels[x + y * img.width] = color(255);
    if(alpha(c) != 0) img.pixels[x + y * img.width] |= 0xff000000;
  }
  img.updatePixels();
}

int Laser = 0;

void laser(int x, int y, int a, int b) {
  
}

class Ship {
  PImage img;
  
  float px = 200, py = 200, r = 0;
  float vx = 0, vy = 0, w = 0.007;
  boolean up, left, right, bar;
   
  Ship(String source) {
    img = loadImage(source);
    up = false;
    left = false;
    right = false;
    bar = false;
  }
  
  int key_delay = 0;
  
  void shoot() {
    
    if(key_delay != 0) return;
    
    key_delay = RELOAD;
    Laser = 3;
    
    met.img.loadPixels();
    
    float x = px, y = py, a = HALF_PI - r;
    
    x -= met.px;
    y -= met.py;
    
    float _x = x;
    x = x*cos(-met.r)-y*sin(-met.r);
    y = _x*sin(-met.r)+y*cos(-met.r);
    x += met.CM[0];
    y += met.CM[1];
    
    a += met.r;
    
    met.raster((int)x, (int)y, a);
    met.img.updatePixels();
  }
  
  void update() {
    if (KUp) {
      vx += 0.05*sin(r);
      vy -= 0.05*cos(r);
    }
    if (KLeft){
      w -= 0.002;
    }
    if (KRight){
      w += 0.002;
    }
    if (KSpace) {
      shoot();
    }
    
    if (px > 512+32) px -= 512+64;
    if (px < 0-32) px += 512+64;
    
    if (py > 512+32) py -= 512+64;
    if (py < 0-32) py += 512+64;
    
    px += vx;
    py += vy;
    r += w;
    
    vx *= 0.995;
    vy *= 0.995;
    w *= 0.99;
  }
  
  void draw(float ox, float oy) {
    
    if (key_delay != 0) {
      key_delay--;
    }
    
    pushMatrix();
    
    translate(px + ox, py + oy);
    rotate(r);
    
    if(ox == 0 && oy == 0)
    {
      stroke(255, 0, 50, Laser * (float)255);
      line(0, -20, 0, -1000);
    }
    
    if(KUp) {
      stroke(255, 100, 0);
      fill(255, 255, 0);
      ellipse(0, 15, 10, 30);
    }
    
    imageMode(CENTER);
    image(img, 0, 0, 500 / 8, 340 / 8);
    imageMode(CORNER);
    
    
    
    popMatrix();
  }
  
}

class Meteor {
  PImage img;
  
  int M = 0;
  float[] CM = {0, 0};
  long I = 0;
  
  float px = 300, py = 300, r = 0;
  float vx = 0, vy = 0, w = 0.0;
  
  Meteor(String source) {
    img = loadImage(source);
    clean(img);
    findBorder();
  }
  
  void update() {
    px += vx;
    py += vy;
    r += w;
  }
  
  void draw() {
    pushMatrix();
    
    translate(px, py);
    rotate(r);
    translate(-CM[0], -CM[1]);
    image(img, 0, 0, 256, 256);
    
    popMatrix();
  }
  
  void findBorder() {
    M = 0;
    CM[0] = 0;
    CM[1] = 0;
    I = 0;
    
    while(true) {
      int x = int(random(img.width));
      int y = int(random(img.height));
    
      if (alpha(img.pixels[x + y * img.width]) != 0) {
        do x--;
        while(alpha(img.pixels[x + y * img.width]) != 0);
        
        contour(x, y, 0);
        break;
      }
    }
  }

  void integrate(int px, int py, int di) {
    int a = (di % 2 == 0)? px : py;
    int v = 1;
    
    if (di == 0 || di == 3) {
      a++;
      v = -1;
    }
    
    v *= a;
    M += v; // v * b
    
    v *= a;
    CM[di % 2] += v; // v * b^2
    
    v *= a;
    I += v; // v * b^3
  }

  boolean havePixel(int px, int py, int di) {
    px += DX[di];
    py += DY[di];
    
    float a = alpha(img.pixels[px + py * img.width]);
    return a != 0 && a != 200;
  }
  

  void contour(int ox, int oy, int oi) {
    
    int px = ox, py = oy, di = oi;
    
    do {
      if (havePixel(px, py, di)) {
    
        /*if (di == 0) { 
          img.loadPixels();
          for(int i = px; havePixel(i, py, di); )
            img.pixels[++i + py * img.width] = color(255, 0, 255);        
          img.updatePixels();
        }*/
        
        
        integrate(px, py, di);
        di = (di - 1) & ~-4; //(DI - 1) % 4
      } else {
        px += DX[di];
        py += DY[di];
        di = (di + 1) % 4;
      }
    
    } while(px != ox || py != oy || di != oi);
    
    M /= 2;
    CM[0] /= 2 * M;
    CM[1] /= 2 * M;
    I /= 3;
      
    I -= (CM[0]*CM[0]+CM[1]*CM[1]) * M;
  }
  
  void limpa(int minx, int maxx, int miny, int maxy) {
    
    for(int j = maxy; j >= miny; j--){
      int y = j * img.width;
      
      if (minx > 0) {
        minx--;
        if(img.pixels[minx + y] == BColor) {
          while(img.pixels[--minx + y] == BColor);
          minx++;
        }
        else
          while(img.pixels[++minx + y] != BColor);
      }
      else {
        if(img.pixels[minx + y] != BColor)
          while(img.pixels[++minx + y] != BColor);
      }
      
      if (maxx < img.width - 1) {
        maxx++;
        if(img.pixels[maxx + y] == BColor) {
          while(img.pixels[++maxx + y] == BColor);
          maxx--;
        }
        else
          while(img.pixels[--maxx + y] != BColor);
      } 
      else {
        if(img.pixels[maxx + y] != BColor)
          while(img.pixels[--maxx + y] != BColor);
      }
      
      //img.pixels[minx + y - 1] = color(0,0,255);
      //img.pixels[maxx + y + 1] = color(0,0,255);
      
      for(int i = minx + y; i <= maxx + y; i++)
        img.pixels[i] = color(0,0,0,0);
    }
    
    
  }
  
  void come(int x, int y, float w) {
    
    int miny = 9999, maxy = -1;
    int minx = 9999, maxx = -1;
    
    float A = 40, B = 20;
    float cw = cos(w);
    float sw = sin(w);
    
    int lx = -1, ly = -1;
    
    for (float t = 0; t < 2*PI; t += HALF_PI / (2*A)) {
      int _x = (int)(A*cos(t)*cw - B*sin(t)*sw + x);
      int _y = (int)(A*cos(t)*sw + B*sin(t)*cw + y);
      
      if (lx == _x && ly == _y)
        continue;
      
      if(_y < 0 || _y >= img.height)
        continue;
        
      if(_x < 0)
        _x = 0;
      if(_x >= img.width)
        _x = img.width - 1;
      
      if (_y > maxy) { 
        maxy = _y;
        minx = 9999;
        maxx = -1;
      }
      if(_y == maxy) {
        if (_x > maxx)
          maxx = _x;
        if (_x < minx)
          minx = _x;
      }
      if (_y < miny)
        miny = _y;
      
      img.pixels[_x + img.width * _y] = BColor;
    }
    
    
    
    limpa(minx, maxx, miny, maxy);
    
    
    //(a,b)(c,d) = ad-bc
    float tor = ((x - CM[0]) * sw - (y - CM[1]) * cw) / I;
    this.w += tor * 10000;
    
    this.vx += cw * 5000 / this.M;
    this.vy += sw * 5000 / this.M;
    
  }

  void raster(int x, int y, float angle) {
    float i = x, j = y;
    
    float a = cos(angle), b = sin(angle);
    float s = max(abs(a), abs(b));
    a /= s;
    b /= s;
    for(int PPPP = 0; PPPP < 100000; PPPP++){
      if(x >= 0 && x < img.width && y >= 0 && y < img.width) {
        if (alpha(img.pixels[x + y * img.width]) != 0) {
          //img.pixels[x + y * img.width] = color(255,144,144);
          come(x, y, -angle);
          break;
        } else {
          //img.pixels[x + y * img.width] = color(144,144,255);
        }
      }
      i += a;
      j -= b;
      
      x = floor(i);
      y = floor(j);
    }
    
  }


}

Meteor met;
Ship ship;

void setup() {
  size(512, 512);
  noSmooth();
  stroke(255,0,0);
  
  ship = new Ship("ship.png");
  met = new Meteor("img.png");
  
  strokeWeight(3);
}

float angle;
void draw() {
  fill(0);
  background(0, 120, 120);
  
  if (Laser > 0)
    Laser--;
  
  
  angle = -atan2(mouseY, mouseX);
  
  ship.update();
  ship.draw(0, 0);
  //ship.draw(512, 0);
  
  met.update();
  met.draw();
  
  
  noStroke();
  fill(255,255,255,Laser*50);
  rect(0,0,512,512);
  //text("M = " + met.M, 10, 10);
  //text("X = " + met.CM[0], 10, 20);
  //text("Y = " + met.CM[1], 10, 30);
  //text("I = " + met.I, 10, 40);
  //text(-ship.r + HALF_PI, 10, 50);
  
  if (KDown)
    image(met.img, 0, 0, 512, 512);
  
}

boolean KLeft = false, KUp = false, KRight = false, KDown = false, KSpace = false;

boolean setKey(int k, boolean v) {
  switch (k) {
    case LEFT:
      return KLeft = v;
    case UP:
      return KUp = v;
    case RIGHT:
      return KRight = v;
    case DOWN:
      return KDown = v;
    case ' ':
      return KSpace = v;
  }
  return false;
}

void keyPressed() {
  setKey(keyCode, true);
}
 
void keyReleased() {
  setKey(keyCode, false);
}
